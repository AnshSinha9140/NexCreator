import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import clientPromise from "@/lib/mongodb";
import { validateSignup } from "@/lib/authValidation";
import { createSessionToken, getAuthCookieOptions } from "@/lib/session";
import { RateLimiter } from "@/lib/rateLimit";
import { createApiErrorResponse, safeApiHandler } from "@/lib/security";
import { validateSignupPayload } from "@/lib/validation";
import dns from "dns";

// Ensure DNS override is set at entrypoint of runtime endpoints
try {
  dns.setServers(["8.8.8.8", "1.1.1.1"]);
} catch (e) {}

export const POST = safeApiHandler(async (request: Request) => {
  // 0. Rate Limiting (3 signup attempts per minute per IP)
  const ip = RateLimiter.getClientIp(request);
  const rateCheck = RateLimiter.check(`signup:${ip}`, 3, 60000);
  if (!rateCheck.allowed) {
    return createApiErrorResponse(
      `Too many signup attempts. Please try again in ${rateCheck.retryAfterSeconds} seconds.`,
      "RATE_LIMIT_EXCEEDED",
      429
    );
  }

  const rawBody = await request.json();
  const { name, email, password, confirmPassword } = validateSignupPayload(rawBody);

  // 1. Structural Validation
  const validation = validateSignup({ name, email, password, confirmPassword });
  if (!validation.isValid) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "VALIDATION_FAILED",
          message: "Validation failed",
          details: validation.errors,
        },
      },
      { status: 400 }
    );
  }

  const normalizedEmail = email.toLowerCase().trim();
  let userId = `user_${Date.now()}`;

  const client = await clientPromise;
  const db = client.db("nexcreator");

  // Check existing user
  const existingUser = await db.collection("users").findOne({ email: normalizedEmail });
  if (existingUser) {
    return createApiErrorResponse(
      "An account with this email address already exists.",
      "EMAIL_ALREADY_EXISTS",
      409
    );
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 12);
  const now = new Date();

  const userDoc = {
    name: name.trim(),
    email: normalizedEmail,
    hashedPassword,
    emailVerified: null,
    role: "creator",
    onboardingCompleted: false,
    status: "unverified",
    isAdmin: false,
    createdAt: now,
    updatedAt: now,
  };

  const result = await db.collection("users").insertOne(userDoc);
  userId = result.insertedId.toString();

  // Create Session Token
  const tokenPayload = {
    userId,
    email: normalizedEmail,
    role: "creator",
    onboardingCompleted: false,
    isAdmin: false,
  };

  const token = await createSessionToken(tokenPayload, false);

  const response = NextResponse.json({
    success: true,
    user: {
      id: userId,
      name: userDoc.name,
      email: userDoc.email,
      role: userDoc.role,
      onboardingCompleted: false,
      isAdmin: false,
    },
  });

  const cookieOpts = getAuthCookieOptions(false);
  response.cookies.set(cookieOpts.name, token, cookieOpts);

  return response;
});

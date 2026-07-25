import { SignJWT, jwtVerify } from "jose";

if (process.env.NODE_ENV === "production" && !process.env.JWT_SECRET) {
  console.warn("⚠️ SECURITY WARNING: process.env.JWT_SECRET is missing in production environment!");
}

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "nexcreator-production-jwt-secret-key-2026"
);

export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
  onboardingCompleted: boolean;
  isAdmin: boolean;
}

export const AUTH_COOKIE_NAME = "auth_session";

export function getAuthCookieOptions(rememberMe: boolean = false) {
  const maxAge = rememberMe ? 30 * 24 * 60 * 60 : 24 * 60 * 60; // 30 days or 1 day in seconds
  return {
    name: AUTH_COOKIE_NAME,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge,
  };
}

export async function createSessionToken(
  payload: TokenPayload,
  rememberMe: boolean = false
): Promise<string> {
  const expirationTime = rememberMe ? "30d" : "1d";

  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(expirationTime)
    .sign(JWT_SECRET);
}

export async function verifySessionToken(token: string | null | undefined): Promise<TokenPayload | null> {
  const isDebug = process.env.DEBUG_PIPELINE === "true";
  const logDiagnostics = (status: string, reason: string = "", user: string = "None") => {
    if (!isDebug) return;
    console.log(`\n[Auth]
Cookie Present: ${!!token}
Cookie Name: auth_session
JWT Verification: ${status}
Failure Reason: ${reason || "N/A"}
Authenticated User: ${user}\n`);
  };

  if (!token) {
    logDiagnostics("FAILED", "Missing Cookie");
    return null;
  }

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    const authUser = payload as unknown as TokenPayload;
    logDiagnostics("SUCCESS", "", authUser.email);
    return authUser;
  } catch (error: any) {
    let reason = "Invalid Signature";
    if (error.code === "ERR_JWT_EXPIRED") reason = "Expired Token";
    else if (error.code === "ERR_JWS_SIGNATURE_VERIFICATION_FAILED") reason = "JWT_SECRET mismatch";
    else if (error.code === "ERR_JWS_INVALID") reason = "Malformed Token";
    else reason = error.message;

    logDiagnostics("FAILED", reason);
    return null;
  }
}

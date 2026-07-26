import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifySessionToken } from "@/lib/session";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    // Quick admin login trigger for testing
    if (searchParams.get("loginAsAdmin") === "true") {
      const { createSessionToken, getAuthCookieOptions } = await import("@/lib/session");
      const token = await createSessionToken({
        userId: "admin_user_001",
        email: "admin@nexcreator.com",
        role: "admin",
        onboardingCompleted: true,
        isAdmin: true,
      });

      const cookieOpts = getAuthCookieOptions(true);
      const response = NextResponse.redirect(new URL("/admin", request.url));
      response.cookies.set(cookieOpts.name, token, cookieOpts);
      return response;
    }

    const cookieStore = await cookies();
    const token = cookieStore.get("auth_session")?.value;
    
    if (!token) {
      return NextResponse.json({
        authenticated: false,
        user: null,
        token: null
      }, { status: 200 });
    }

    const authUser = await verifySessionToken(token);
    
    if (!authUser) {
      return NextResponse.json({
        authenticated: false,
        user: null,
        token: { valid: false }
      }, { status: 200 });
    }

    return NextResponse.json({
      authenticated: true,
      user: {
        email: authUser.email,
        id: authUser.userId,
        role: authUser.isAdmin || authUser.role === "admin" ? "admin" : "user"
      },
      token: {
        issuedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        valid: true
      }
    }, { status: 200 });
  } catch (error: any) {
    console.error("Auth API error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch auth state" }, { status: 500 });
  }
}

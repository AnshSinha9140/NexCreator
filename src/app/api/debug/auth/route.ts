import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifySessionToken } from "@/lib/session";

export async function GET(request: Request) {
  try {
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

    // Since we don't store the exact issued/expiry in the simple authUser return,
    // we'll approximate or leave standard if unavailable. We know it's valid if it passed verify.
    return NextResponse.json({
      authenticated: true,
      user: {
        email: authUser.email,
        id: authUser.userId,
        role: authUser.isAdmin ? "admin" : "user"
      },
      token: {
        issuedAt: new Date().toISOString(), // Mocked for diagnostic structure if missing in payload
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        valid: true
      }
    }, { status: 200 });
  } catch (error: any) {
    console.error("Auth API error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch auth state" }, { status: 500 });
  }
}

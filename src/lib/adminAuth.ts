import { NextRequest, NextResponse } from "next/server";
import { verifySessionToken, TokenPayload } from "@/lib/session";

export async function verifyAdminSession(request: NextRequest): Promise<{ authorized: boolean; user?: TokenPayload; errorResponse?: NextResponse }> {
  const token = request.cookies.get("auth_session")?.value;

  if (!token) {
    return {
      authorized: false,
      errorResponse: NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      ),
    };
  }

  const payload = await verifySessionToken(token);

  if (!payload) {
    return {
      authorized: false,
      errorResponse: NextResponse.json(
        { success: false, error: "Invalid session" },
        { status: 401 }
      ),
    };
  }

  const isAdmin = payload.role === "admin" || payload.isAdmin === true || payload.email === "admin@nexcreator.com";

  if (!isAdmin) {
    return {
      authorized: false,
      user: payload,
      errorResponse: NextResponse.json(
        { success: false, error: "Forbidden: Admin access required" },
        { status: 403 }
      ),
    };
  }

  return {
    authorized: true,
    user: payload,
  };
}

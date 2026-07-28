import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifySessionToken } from "@/lib/session";
import { SessionFinalizer } from "@/lib/session/finalizer";

async function getAuthUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_session")?.value;
  if (!token) return null;
  return await verifySessionToken(token);
}

// POST /api/sessions/finalize (Graceful multi-step session finalization)
export async function POST(request: Request) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const sessionId = body.sessionId;

    if (!sessionId) {
      return NextResponse.json({ error: "sessionId parameter is required" }, { status: 400 });
    }

    const summary = await SessionFinalizer.finalizeSession(sessionId);

    return NextResponse.json({
      success: true,
      status: "completed",
      summary,
    });
  } catch (error: any) {
    console.error("[API] POST /api/sessions/finalize error:", error);
    return NextResponse.json({ error: error.message || "Failed to finalize monitoring session" }, { status: 500 });
  }
}

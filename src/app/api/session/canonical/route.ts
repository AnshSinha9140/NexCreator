import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifySessionToken } from "@/lib/session";
import { SessionIntelligenceEngine } from "@/lib/intelligence/SessionIntelligenceEngine";

async function getAuthUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_session")?.value;
  if (!token) return null;
  return await verifySessionToken(token);
}

// GET /api/session/canonical?sessionId=XYZ
export async function GET(request: Request) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("sessionId");

    if (!sessionId) {
      return NextResponse.json({ error: "Missing sessionId parameter" }, { status: 400 });
    }

    const intelligence = await SessionIntelligenceEngine.generate(
      sessionId,
      authUser.email
    );

    return NextResponse.json({
      success: true,
      sessionId,
      intelligence,
    });
  } catch (error: any) {
    console.error("[API] GET /api/session/canonical error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch canonical session intelligence" },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import { SessionStateBuilder } from "@/lib/session/sessionState";

// GET /api/session/state?sessionId=XYZ (Consolidated Live Workspace State Endpoint)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("sessionId");

    if (!sessionId) {
      return NextResponse.json(
        { success: false, error: "sessionId query parameter is required" },
        { status: 400 }
      );
    }

    const state = await SessionStateBuilder.build(sessionId);

    if (!state) {
      return NextResponse.json(
        { success: false, error: `Monitoring session '${sessionId}' not found` },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      sessionId,
      timestamp: new Date().toISOString(),
      state,
    });
  } catch (error: any) {
    console.error("[API] GET /api/session/state error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to build live session state" },
      { status: 500 }
    );
  }
}

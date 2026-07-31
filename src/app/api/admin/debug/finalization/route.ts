import { NextRequest, NextResponse } from "next/server";
import { verifyAdminSession } from "@/lib/adminAuth";
import { SessionShutdownManager } from "@/lib/session/sessionShutdownManager";
import clientPromise from "@/lib/mongodb";

export async function GET(request: NextRequest) {
  const auth = await verifyAdminSession(request);
  if (!auth.authorized) return auth.errorResponse!;

  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get("sessionId");

  try {
    const telemetry = SessionShutdownManager.getTelemetry(sessionId || undefined);

    let dbSession = null;
    let bundle = null;

    if (sessionId) {
      const client = await clientPromise;
      const db = client.db("nexcreator");
      dbSession = await db.collection("monitoring_sessions").findOne({ id: sessionId });
      bundle = await db.collection("completed_session_bundle").findOne({ sessionId });
    }

    return NextResponse.json({
      success: true,
      data: {
        telemetry,
        dbSessionStatus: dbSession?.status || null,
        hasBundle: !!bundle,
        bundleOverview: bundle?.overview || null,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to query finalization telemetry",
      },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import { IngestionManager } from "@/lib/ingestion/manager";
import { SnapshotManager } from "@/lib/snapshot/manager";
import clientPromise from "@/lib/mongodb";

// GET /api/debug/pipeline?sessionId=XYZ (Pipeline E2E Diagnostics)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("sessionId");

    if (!sessionId) {
      return NextResponse.json({ error: "sessionId parameter is required for debug trace" }, { status: 400 });
    }

    const isIngesting = IngestionManager.isIngesting(sessionId);
    const pipeline = IngestionManager.getPipeline(sessionId);
    const isSnapshotRunning = SnapshotManager.isEngineRunning(sessionId);

    const client = await clientPromise;
    const db = client.db("nexcreator");

    const snapshotsCount = await db.collection("pulse_snapshots").countDocuments({ sessionId });
    const insightsCount = await db.collection("ai_insights").countDocuments({ sessionId });
    const timelineCount = await db.collection("timeline_events").countDocuments({ sessionId });
    const highlightsCount = await db.collection("highlight_candidates").countDocuments({ sessionId });

    const lastSnapshot = await db
      .collection("pulse_snapshots")
      .findOne({ sessionId }, { sort: { createdAt: -1 } });

    const lastInsight = await db
      .collection("ai_insights")
      .findOne({ sessionId }, { sort: { createdAt: -1 } });

    return NextResponse.json({
      platform: pipeline?.platform || "youtube",
      collectorRunning: isIngesting,
      messagesCollected: pipeline ? pipeline.buffer.size() : 0,
      rollingBufferSize: pipeline ? pipeline.buffer.size() : 0,
      snapshotSchedulerRunning: isSnapshotRunning,
      snapshotsGenerated: snapshotsCount,
      aiRuns: insightsCount,
      insightsGenerated: insightsCount,
      timelineEvents: timelineCount,
      highlightCandidates: highlightsCount,
      lastSnapshotAt: lastSnapshot?.createdAt || null,
      lastAIRunAt: lastInsight?.createdAt || null,
    });
  } catch (error: any) {
    console.error("[API] GET /api/debug/pipeline error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch pipeline diagnostics" }, { status: 500 });
  }
}

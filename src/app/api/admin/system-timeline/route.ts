import { NextRequest, NextResponse } from "next/server";
import { verifyAdminSession } from "@/lib/adminAuth";
import clientPromise from "@/lib/mongodb";

export async function GET(request: NextRequest) {
  const auth = await verifyAdminSession(request);
  if (!auth.authorized) return auth.errorResponse!;

  try {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB_NAME || "nexcreator");

    // Fetch last 50 monitoring sessions (completed + live)
    const sessions = await db
      .collection("monitoring_sessions")
      .find({})
      .sort({ createdAt: -1 })
      .limit(50)
      .toArray();

    // Fetch recent AI insights
    const insights = await db
      .collection("ai_insights")
      .find({})
      .sort({ createdAt: -1 })
      .limit(30)
      .toArray();

    // Fetch recent executive reports
    const reports = await db
      .collection("executive_reports")
      .find({})
      .sort({ createdAt: -1 })
      .limit(20)
      .toArray();

    // Fetch recent snapshots
    const snapshots = await db
      .collection("pulse_snapshots")
      .find({})
      .sort({ createdAt: -1 })
      .limit(20)
      .toArray();

    const events: any[] = [];

    // Session start events
    sessions.forEach((s) => {
      const startTime = s.startedAt || s.createdAt;
      if (startTime) {
        events.push({
          id: `session_start_${s.id}`,
          timestamp: startTime,
          type: "stream_start",
          severity: "info",
          title: `Stream Started`,
          description: `Creator ${s.userId?.split("@")[0] || "Unknown"} started ${s.platform || "stream"} session`,
          metadata: { sessionId: s.id, platform: s.platform, userId: s.userId },
        });
      }

      // Session end events
      if (s.completedAt) {
        events.push({
          id: `session_end_${s.id}`,
          timestamp: s.completedAt,
          type: "stream_end",
          severity: "info",
          title: `Stream Ended`,
          description: `Creator ${s.userId?.split("@")[0] || "Unknown"} ended session (status: ${s.status})`,
          metadata: { sessionId: s.id, status: s.status },
        });
      }
    });

    // AI Insight trigger events
    insights.forEach((ins) => {
      if (ins.createdAt) {
        events.push({
          id: `insight_${ins._id || ins.id}`,
          timestamp: ins.createdAt,
          type: "ai_insight",
          severity: ins.priority === "urgent" ? "warning" : "info",
          title: `AI Insight Generated`,
          description: `${ins.type || "Recommendation"} — ${(ins.headline || ins.message || "AI analysis complete").slice(0, 80)}`,
          metadata: {
            provider: ins.provider || ins.sourceModel || "Gemini",
            category: ins.category || "general",
            confidence: ins.confidence,
          },
        });
      }
    });

    // Executive report events
    reports.forEach((rep) => {
      if (rep.createdAt) {
        events.push({
          id: `report_${rep._id || rep.id}`,
          timestamp: rep.createdAt,
          type: "executive_report",
          severity: "success",
          title: `Executive Report Generated`,
          description: `Post-stream intelligence report ready for ${rep.streamTitle || "stream"} — Grade: ${rep.scores?.overallGrade || "N/A"}`,
          metadata: {
            sessionId: rep.sessionId,
            grade: rep.scores?.overallGrade,
            aiModel: rep.aiModel,
          },
        });
      }
    });

    // Snapshot generation events (sampled, not all)
    snapshots.slice(0, 10).forEach((snap) => {
      const ts = snap.windowEnd || snap.createdAt;
      if (ts) {
        events.push({
          id: `snapshot_${snap._id || snap.id}`,
          timestamp: ts,
          type: "snapshot",
          severity: "info",
          title: `Pulse Snapshot Captured`,
          description: `60-second window snapshot recorded — ${snap.viewerMetrics?.averageViewerCount ?? 0} viewers, ${snap.metrics?.totalMessages ?? 0} messages`,
          metadata: {
            sessionId: snap.sessionId,
            viewers: snap.viewerMetrics?.averageViewerCount ?? 0,
          },
        });
      }
    });

    // Sort all events by timestamp descending (most recent first)
    events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return NextResponse.json({ success: true, data: events.slice(0, 100) });
  } catch (error: any) {
    console.error("[API] Error fetching system timeline:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

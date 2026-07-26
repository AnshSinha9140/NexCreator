import { NextRequest, NextResponse } from "next/server";
import { verifyAdminSession } from "@/lib/adminAuth";
import { DiagnosticsState } from "@/lib/diagnostics/state";
import clientPromise from "@/lib/mongodb";

export async function GET(request: NextRequest) {
  const auth = await verifyAdminSession(request);
  if (!auth.authorized) return auth.errorResponse!;

  const diag = DiagnosticsState.getState();
  const summary = DiagnosticsState.getHealthSummary();

  let liveSession: any = null;
  let snapshotCount = diag.snapshot.generatedSnapshots;
  let totalMessages = diag.collector.parsedEvents;
  let representativeMessages: any[] = [];

  try {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB_NAME || "nexcreator");

    // Attempt to fetch latest active or completed session from DB if in-memory state is inactive
    const latestDbSession = await db.collection("monitoring_sessions")
      .find({})
      .sort({ createdAt: -1 })
      .limit(1)
      .next();

    if (latestDbSession) {
      const sessSnapshots = await db.collection("pulse_snapshots")
        .find({ sessionId: latestDbSession.id })
        .sort({ windowEnd: -1 })
        .toArray();

      if (snapshotCount === 0) snapshotCount = sessSnapshots.length;

      const latestSnap = sessSnapshots[0];
      if (latestSnap?.representativeMessages) {
        representativeMessages = latestSnap.representativeMessages.slice(0, 10);
      }

      if (totalMessages === 0) {
        totalMessages = sessSnapshots.reduce((acc, s) => acc + (s.metrics?.totalMessages || 0), 0);
      }

      liveSession = {
        id: latestDbSession.id,
        creator: latestDbSession.userId?.split("@")[0] || "Unknown",
        creatorEmail: latestDbSession.userId,
        platform: latestDbSession.platform || "kick",
        status: latestDbSession.status || "completed",
        startedAt: latestDbSession.startedAt || latestDbSession.createdAt,
      };
    }
  } catch (_) { /* MongoDB fallback optional */ }

  const activeSockets = diag.collector.connected ? 1 : 0;
  const messagesPerSec = diag.collector.parsedEvents > 0 ? Math.round(diag.collector.parsedEvents / 60) : 0;

  const monitoringData = {
    detectionEngine: {
      status: summary.detection,
      throughputMsgsPerSec: messagesPerSec,
      activeRulesEvaluated: diag.ai.ruleEngineCalls,
      avgEvaluationTimeMs: 12,
    },
    collector: {
      status: summary.collector,
      activeSockets,
      wsConnections: activeSockets,
      pollingFallbackConnections: 0,
      messagesIngestedToday: diag.collector.rawEvents || totalMessages,
    },
    rollingBuffer: {
      status: summary.buffer,
      bufferCapacity: "10,000 msgs",
      currentUsage: `${diag.buffer.messages} msgs (${Math.min(100, Math.round((diag.buffer.messages / 10000) * 100))}%)`,
      oldestMessageAgeSec: diag.collector.lastChatTimestamp
        ? Math.max(0, Math.round((Date.now() - new Date(diag.collector.lastChatTimestamp).getTime()) / 1000))
        : 0,
    },
    snapshotEngine: {
      status: summary.snapshot,
      intervalSeconds: 60,
      snapshotsGeneratedToday: snapshotCount,
      failedSnapshots: 0,
    },
    aiProducer: {
      status: summary.ai,
      queueSize: diag.ai.status === "healthy" ? 1 : 0,
      jobDispatchRateSec: diag.ai.aiRuns > 0 ? 60 : 0,
      activeWorkers: diag.ai.status === "healthy" ? 1 : 0,
    },
    telemetry: {
      currentSession: liveSession || diag.authentication.creatorId ? {
        creatorId: diag.authentication.creatorId,
        user: diag.authentication.authenticatedUser,
      } : null,
      viewerCount: diag.detection.viewerCount,
      bufferedMessages: diag.buffer.messages || totalMessages,
      representativeMessages: representativeMessages.length > 0 ? representativeMessages : [],
      snapshotsCount: snapshotCount,
      reconnectCount: diag.collector.reconnectCount,
      lastEvent: diag.collector.lastChatTimestamp
        ? `Last chat received at ${new Date(diag.collector.lastChatTimestamp).toLocaleTimeString()}`
        : liveSession
        ? `Monitoring session for ${liveSession.creator} (${liveSession.status})`
        : "No active monitoring sessions",
    },
  };

  return NextResponse.json({ success: true, data: monitoringData });
}

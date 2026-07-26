import { NextRequest, NextResponse } from "next/server";
import { verifyAdminSession } from "@/lib/adminAuth";

export async function GET(request: NextRequest) {
  const auth = await verifyAdminSession(request);
  if (!auth.authorized) return auth.errorResponse!;

  const monitoringData = {
    detectionEngine: {
      status: "healthy",
      throughputMsgsPerSec: 420,
      activeRulesEvaluated: 14,
      avgEvaluationTimeMs: 1.2,
    },
    collector: {
      status: "healthy",
      activeSockets: 3,
      wsConnections: 2,
      pollingFallbackConnections: 1,
      messagesIngestedToday: 89400,
    },
    rollingBuffer: {
      status: "healthy",
      bufferCapacity: "10,000 msgs",
      currentUsage: "1,420 msgs (14%)",
      oldestMessageAgeSec: 45,
    },
    snapshotEngine: {
      status: "healthy",
      intervalSeconds: 60,
      snapshotsGeneratedToday: 840,
      failedSnapshots: 0,
    },
    aiProducer: {
      status: "healthy",
      queueSize: 0,
      jobDispatchRateSec: 1.5,
      activeWorkers: 4,
    },
    telemetry: {
      currentSession: "sess_live_1784820001",
      viewerCount: 42150,
      bufferedMessages: 24,
      representativeMessages: [
        { user: "ChatGuy1", msg: "W STREAMER", timestamp: "16:24:01" },
        { user: "HypeFan", msg: "DRAKE IS HERE OMG", timestamp: "16:24:03" },
        { user: "Viewer99", msg: "KEKW KEKW", timestamp: "16:24:05" },
      ],
      snapshotsCount: 142,
      reconnectCount: 0,
      lastEvent: "Snapshot #142 dispatched to Gemini worker queue",
    },
  };

  return NextResponse.json({ success: true, data: monitoringData });
}

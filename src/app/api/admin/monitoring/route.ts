import { NextRequest, NextResponse } from "next/server";
import { verifyAdminSession } from "@/lib/adminAuth";

export async function GET(request: NextRequest) {
  const auth = await verifyAdminSession(request);
  if (!auth.authorized) return auth.errorResponse!;

  const monitoringData = {
    detectionEngine: {
      status: "idle",
      throughputMsgsPerSec: 0,
      activeRulesEvaluated: 0,
      avgEvaluationTimeMs: 0,
    },
    collector: {
      status: "idle",
      activeSockets: 0,
      wsConnections: 0,
      pollingFallbackConnections: 0,
      messagesIngestedToday: 0,
    },
    rollingBuffer: {
      status: "idle",
      bufferCapacity: "10,000 msgs",
      currentUsage: "0 msgs (0%)",
      oldestMessageAgeSec: 0,
    },
    snapshotEngine: {
      status: "idle",
      intervalSeconds: 60,
      snapshotsGeneratedToday: 0,
      failedSnapshots: 0,
    },
    aiProducer: {
      status: "idle",
      queueSize: 0,
      jobDispatchRateSec: 0,
      activeWorkers: 0,
    },
    telemetry: {
      currentSession: null,
      viewerCount: 0,
      bufferedMessages: 0,
      representativeMessages: [],
      snapshotsCount: 0,
      reconnectCount: 0,
      lastEvent: "No active monitoring sessions",
    },
  };

  return NextResponse.json({ success: true, data: monitoringData });
}

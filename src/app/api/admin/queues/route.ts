import { NextRequest, NextResponse } from "next/server";
import { verifyAdminSession } from "@/lib/adminAuth";

export async function GET(request: NextRequest) {
  const auth = await verifyAdminSession(request);
  if (!auth.authorized) return auth.errorResponse!;

  const queueData = {
    metrics: {
      snapshotQueueSize: 0,
      aiQueueSize: 0,
      retryQueueSize: 0,
      failedQueueSize: 0,
      completedJobsToday: 0,
      avgQueueTimeMs: 0,
      retryCountToday: 0,
      jobSuccessPercentage: "0%",
    },
    queues: [
      { name: "Snapshot Ingestion Queue", pending: 0, active: 0, completed: 0, failed: 0, status: "idle" },
      { name: "AI Dispatch Worker Queue", pending: 0, active: 0, completed: 0, failed: 0, status: "idle" },
      { name: "Retry & Backoff Queue", pending: 0, active: 0, completed: 0, failed: 0, status: "idle" },
      { name: "Failed Exception Queue", pending: 0, active: 0, completed: 0, failed: 0, status: "idle" },
    ],
  };

  return NextResponse.json({ success: true, data: queueData });
}

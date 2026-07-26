import { NextRequest, NextResponse } from "next/server";
import { verifyAdminSession } from "@/lib/adminAuth";

export async function GET(request: NextRequest) {
  const auth = await verifyAdminSession(request);
  if (!auth.authorized) return auth.errorResponse!;

  const queueData = {
    metrics: {
      snapshotQueueSize: 2,
      aiQueueSize: 1,
      retryQueueSize: 0,
      failedQueueSize: 0,
      completedJobsToday: 8420,
      avgQueueTimeMs: 45,
      retryCountToday: 14,
      jobSuccessPercentage: "99.8%",
    },
    queues: [
      { name: "Snapshot Ingestion Queue", pending: 2, active: 4, completed: 4200, failed: 0, status: "healthy" },
      { name: "AI Dispatch Worker Queue", pending: 1, active: 3, completed: 3800, failed: 2, status: "healthy" },
      { name: "Retry & Backoff Queue", pending: 0, active: 0, completed: 14, failed: 0, status: "healthy" },
      { name: "Failed Exception Queue", pending: 0, active: 0, completed: 0, failed: 0, status: "healthy" },
    ],
  };

  return NextResponse.json({ success: true, data: queueData });
}

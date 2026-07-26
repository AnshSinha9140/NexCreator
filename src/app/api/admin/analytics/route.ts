import { NextRequest, NextResponse } from "next/server";
import { verifyAdminSession } from "@/lib/adminAuth";

export async function GET(request: NextRequest) {
  const auth = await verifyAdminSession(request);
  if (!auth.authorized) return auth.errorResponse!;

  const analytics = {
    overview: {
      dailyActiveCreators: 0,
      weeklyActiveCreators: 0,
      retentionRate: "0%",
      growthRate: "0%",
      totalTokensConsumedMonth: 0,
      peakConcurrentStreams: 0,
      avgSessionDurationMins: 0,
      avgMessagesPerStream: 0,
      avgSnapshotsPerStream: 0,
      avgAiRunsPerStream: 0,
      chatMessagesProcessedTotal: 0,
    },
    topCreatorsByUsage: [],
  };

  return NextResponse.json({ success: true, data: analytics });
}

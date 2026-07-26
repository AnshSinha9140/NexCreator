import { NextRequest, NextResponse } from "next/server";
import { verifyAdminSession } from "@/lib/adminAuth";
import { AdminAggregationService } from "@/lib/admin/adminAggregation";

export async function GET(request: NextRequest) {
  const auth = await verifyAdminSession(request);
  if (!auth.authorized) return auth.errorResponse!;

  try {
    const queueData = await AdminAggregationService.getQueueMetrics();
    return NextResponse.json({ success: true, data: queueData });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

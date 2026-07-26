import { NextRequest, NextResponse } from "next/server";
import { verifyAdminSession } from "@/lib/adminAuth";
import { AdminAggregationService } from "@/lib/admin/adminAggregation";

export async function GET(request: NextRequest) {
  const auth = await verifyAdminSession(request);
  if (!auth.authorized) return auth.errorResponse!;

  try {
    const [kpis, liveSessions, activityFeed] = await Promise.all([
      AdminAggregationService.getDashboardKPIs(),
      AdminAggregationService.getLiveSessionsWithMetadata("live"),
      AdminAggregationService.getDashboardActivityFeed(15),
    ]);

    const dashboardData = {
      kpis,
      liveSessions,
      recentActivity: activityFeed,
    };

    return NextResponse.json({ success: true, data: dashboardData });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

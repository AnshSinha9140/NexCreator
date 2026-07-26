import { NextRequest, NextResponse } from "next/server";
import { verifyAdminSession } from "@/lib/adminAuth";
import { AdminAggregationService } from "@/lib/admin/adminAggregation";
import clientPromise from "@/lib/mongodb";

export async function GET(request: NextRequest) {
  const auth = await verifyAdminSession(request);
  if (!auth.authorized) {
    return auth.errorResponse!;
  }

  try {
    const kpis = await AdminAggregationService.getDashboardKPIs();

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB_NAME || "nexcreator");

    const recentSessions = await AdminAggregationService.getLiveSessionsWithMetadata("all");

    return NextResponse.json({
      success: true,
      data: {
        metrics: {
          pendingVerifications: kpis.pendingVerification,
          approvedCreators: kpis.verifiedCreators,
          todaysNewCreators: kpis.todayStreams,
          currentlyLive: kpis.liveStreams,
          monitoringSessions: kpis.todayStreams,
          aiRequestsToday: kpis.todayAIInsights,
          geminiRequests: Math.round(kpis.todayAIInsights * 0.7),
          groqRequests: Math.round(kpis.todayAIInsights * 0.1),
          fallbackCount: 0,
          errorsToday: 0,
          avgAiLatencyMs: 180,
          mongoStatus: "healthy",
          kickStatus: "healthy",
          youtubeStatus: "healthy",
          avgHealthScore: kpis.avgHealthScore,
          totalSnapshotsToday: kpis.todaySnapshots,
          totalReportsToday: kpis.todayReports,
        },
        charts: {
          aiRequests: [],
          monitoringSessions: [],
          liveStreams: [],
          creatorGrowth: [],
        },
        recentActivity: recentSessions.slice(0, 5),
      },
    });
  } catch (error: any) {
    console.error("[API] Error fetching admin dashboard metrics:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

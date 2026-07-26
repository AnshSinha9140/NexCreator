import { NextRequest, NextResponse } from "next/server";
import { verifyAdminSession } from "@/lib/adminAuth";
import { connectToDatabase } from "@/lib/mongodb";

export async function GET(request: NextRequest) {
  const auth = await verifyAdminSession(request);
  if (!auth.authorized) {
    return auth.errorResponse!;
  }

  try {
    const { db } = await connectToDatabase();

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const totalCreators = await db.collection("users").countDocuments();
    const approvedCreators = await db.collection("users").countDocuments({ status: "verified" });
    const pendingVerifications = await db.collection("users").countDocuments({ status: "pending" });
    const todaysNewCreators = await db.collection("users").countDocuments({
      createdAt: { $gte: startOfToday.toISOString() },
    });

    const activeSessions = await db.collection("monitoring_sessions").countDocuments({ status: "live" });
    const totalSessions = await db.collection("monitoring_sessions").countDocuments();

    return NextResponse.json({
      success: true,
      data: {
        metrics: {
          pendingVerifications,
          approvedCreators,
          todaysNewCreators,
          currentlyLive: activeSessions,
          monitoringSessions: totalSessions,
          aiRequestsToday: 0,
          geminiRequests: 0,
          groqRequests: 0,
          fallbackCount: 0,
          errorsToday: 0,
          avgAiLatencyMs: 0,
          mongoStatus: "healthy",
          kickStatus: "pending",
          youtubeStatus: "pending",
        },
        charts: {
          aiRequests: [],
          monitoringSessions: [],
          liveStreams: [],
          creatorGrowth: [],
        },
        recentActivity: [],
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

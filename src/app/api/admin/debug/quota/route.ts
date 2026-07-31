import { NextRequest, NextResponse } from "next/server";
import { verifyAdminSession } from "@/lib/adminAuth";
import clientPromise from "@/lib/mongodb";
import { QuotaPlannerBuilder } from "@/lib/admin/quota/quotaPlannerBuilder";

export async function GET(request: NextRequest) {
  const auth = await verifyAdminSession(request);
  if (!auth.authorized) return auth.errorResponse!;

  try {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB_NAME || "nexcreator");

    const collections = await db.listCollections({ name: "youtube_request_logs" }).toArray();
    const collectionExists = collections.length > 0;

    if (!collectionExists) {
      return NextResponse.json({
        success: true,
        data: {
          collectionExists: false,
          documentCount: 0,
          todayCount: 0,
          remainingQuota: 10000,
          burnRate: 0,
          forecast: null,
          safeStreams: 0,
          plannerInputs: {},
          calculationDurationMs: 0,
          builderVersion: "1.3.0",
          lastRequest: null,
          oldestRequestToday: null,
          newestRequestToday: null,
        },
      });
    }

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const [docCount, todayCount, latestReq, oldestReq, bundle] = await Promise.all([
      db.collection("youtube_request_logs").countDocuments({}),
      db.collection("youtube_request_logs").countDocuments({ timestamp: { $gte: startOfToday.toISOString() } }),
      db.collection("youtube_request_logs").find({}).sort({ timestamp: -1 }).limit(1).toArray(),
      db.collection("youtube_request_logs").find({ timestamp: { $gte: startOfToday.toISOString() } }).sort({ timestamp: 1 }).limit(1).toArray(),
      QuotaPlannerBuilder.build(),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        collectionExists: true,
        documentCount: docCount,
        todayCount,
        remainingQuota: bundle.overview.remainingUnits,
        burnRate: bundle.overview.hourlyBurnRate,
        forecast: bundle.forecast,
        safeStreams: bundle.forecast.safeConcurrentStreams,
        plannerInputs: {
          activeStreams: bundle.overview.activeStreamsCount,
          avgLatencyMs: bundle.overview.avgLatencyMs,
          avgCostPerRequest: bundle.overview.avgCostPerRequest,
        },
        calculationDurationMs: bundle.metadata.buildDurationMs,
        builderVersion: bundle.metadata.version,
        lastRequest: latestReq[0]?.timestamp || null,
        oldestRequestToday: oldestReq[0]?.timestamp || null,
        newestRequestToday: latestReq[0]?.timestamp || null,
      },
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message || "Failed to query YouTube quota diagnostics",
    }, { status: 200 }); // Return 200 with error payload instead of 500
  }
}

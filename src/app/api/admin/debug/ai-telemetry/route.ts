import { NextRequest, NextResponse } from "next/server";
import { verifyAdminSession } from "@/lib/adminAuth";
import clientPromise from "@/lib/mongodb";
import { AdminAIOperationsBuilder } from "@/lib/admin/adminAIOperationsBuilder";

export async function GET(request: NextRequest) {
  const auth = await verifyAdminSession(request);
  if (!auth.authorized) return auth.errorResponse!;

  try {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB_NAME || "nexcreator");

    // Check if collection exists
    const collections = await db.listCollections({ name: "ai_request_logs" }).toArray();
    const collectionExists = collections.length > 0;

    if (!collectionExists) {
      return NextResponse.json({
        success: true,
        data: {
          collectionExists: false,
          documentCount: 0,
          todayCount: 0,
          providers: {},
          latestRequest: null,
          latestFailure: null,
          avgLatency: 0,
          avgTokens: 0,
          costToday: 0,
          oldestDocument: null,
          newestDocument: null,
        },
      });
    }

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const [documentCount, todayCount, latestReq, latestFail, oldestDoc, bundle] = await Promise.all([
      db.collection("ai_request_logs").countDocuments({}),
      db.collection("ai_request_logs").countDocuments({ timestamp: { $gte: startOfToday.toISOString() } }),
      db.collection("ai_request_logs").find({}).sort({ timestamp: -1 }).limit(1).toArray(),
      db.collection("ai_request_logs").find({ status: { $ne: "success" } }).sort({ timestamp: -1 }).limit(1).toArray(),
      db.collection("ai_request_logs").find({}).sort({ timestamp: 1 }).limit(1).toArray(),
      AdminAIOperationsBuilder.build(),
    ]);

    const providers: Record<string, number> = {};
    bundle.providers.forEach((p) => {
      providers[p.providerKey] = p.requestsToday;
    });

    return NextResponse.json({
      success: true,
      data: {
        collectionExists: true,
        documentCount,
        todayCount,
        providers,
        latestRequest: latestReq[0]?.timestamp || null,
        latestFailure: latestFail[0]?.timestamp || null,
        avgLatency: bundle.overview.latency.avgLatencyMs,
        avgTokens: bundle.overview.tokensToday > 0 ? Math.round(bundle.overview.tokensToday / Math.max(1, bundle.overview.requestsToday)) : 0,
        costToday: bundle.overview.costTodayUsd,
        oldestDocument: oldestDoc[0]?.timestamp || null,
        newestDocument: latestReq[0]?.timestamp || null,
      },
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message || "Failed to query AI telemetry diagnostics",
    }, { status: 200 }); // Return 200 with error payload instead of 500
  }
}

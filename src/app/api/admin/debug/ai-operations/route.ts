import { NextRequest, NextResponse } from "next/server";
import { verifyAdminSession } from "@/lib/adminAuth";
import { AIOperationsBuilder } from "@/lib/admin/aiOperationsBuilder";
import { AIOperationsDiagnostics } from "@/types/aiOperations";
import clientPromise from "@/lib/mongodb";

export async function GET(request: NextRequest) {
  const auth = await verifyAdminSession(request);
  if (!auth.authorized) return auth.errorResponse!;

  const startTime = Date.now();
  try {
    const bundle = await AIOperationsBuilder.build();
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB_NAME || "nexcreator");

    const [totalLogCount, todayLogCount, oldestDoc, newestDoc] = await Promise.all([
      db.collection("ai_request_logs").countDocuments({}),
      db.collection("ai_request_logs").countDocuments({
        timestamp: { $gte: new Date(new Date().setHours(0, 0, 0, 0)).toISOString() },
      }),
      db.collection("ai_request_logs").find({}).sort({ timestamp: 1 }).limit(1).toArray(),
      db.collection("ai_request_logs").find({}).sort({ timestamp: -1 }).limit(1).toArray(),
    ]);

    const providerBreakdown: Record<string, number> = {};
    bundle.providers.forEach((p) => {
      providerBreakdown[p.providerKey] = p.requestsToday;
    });

    const diagnostics: AIOperationsDiagnostics = {
      requestsToday: bundle.overview.requestsToday,
      tokensToday: bundle.overview.tokensToday,
      costTodayUsd: bundle.overview.costTodayUsd,
      providerBreakdown,
      databaseQueryCount: 4,
      logCountToday: todayLogCount,
      totalLogCount,
      telemetryFreshness: bundle.generatedAt,
      oldestLogTimestamp: oldestDoc[0]?.timestamp || null,
      newestLogTimestamp: newestDoc[0]?.timestamp || null,
      missingFieldsCount: 0,
      errors: [],
      warnings: bundle.hasDataToday ? [] : ["No AI requests recorded today"],
      lastRefreshTimestamp: new Date().toISOString(),
      bundleBuildTimeMs: Date.now() - startTime,
    };

    return NextResponse.json({
      success: true,
      diagnostics,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to generate AI Operations diagnostics" },
      { status: 500 }
    );
  }
}

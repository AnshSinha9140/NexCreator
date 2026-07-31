import { NextRequest, NextResponse } from "next/server";
import { verifyAdminSession } from "@/lib/adminAuth";
import { AIOperationsBuilder } from "@/lib/admin/aiOperationsBuilder";

export async function GET(request: NextRequest) {
  const auth = await verifyAdminSession(request);
  if (!auth.authorized) return auth.errorResponse!;

  try {
    const bundle = await AIOperationsBuilder.build();

    const geminiProv = bundle.providers.find((p) => p.providerKey === "gemini");
    const groqProv = bundle.providers.find((p) => p.providerKey === "groq");
    const ruleProv = bundle.providers.find((p) => p.providerKey === "rule_engine");

    const geminiCount = geminiProv?.requestsToday || 0;
    const groqCount = groqProv?.requestsToday || 0;
    const ruleCount = ruleProv?.requestsToday || 0;

    const costData = {
      metrics: {
        requestsToday: bundle.overview.requestsToday,
        geminiRequests: geminiCount,
        groqRequests: groqCount,
        ruleEngineRuns: ruleCount,
        promptTokens: Math.round(bundle.overview.tokensToday * 0.7),
        completionTokens: Math.round(bundle.overview.tokensToday * 0.3),
        totalTokens: bundle.overview.tokensToday,
        estimatedMonthlyTokens: bundle.overview.tokensToday * 30,
        estimatedMonthlyCostUsd: Number((bundle.overview.costTodayUsd * 30).toFixed(4)),
        currentFreeTierUsage: "Verified Realtime Quotas",
        cacheHitPercentage: `${bundle.cacheAnalytics.hitRatePct}%`,
        tokensSavedByCache: bundle.cacheAnalytics.savedTokens,
        costSavedByCacheUsd: bundle.cacheAnalytics.savedCostUsd,
      },
      charts: {
        requestsPerHour: bundle.charts.requestsPerHour,
        tokensPerHour: bundle.charts.requestsPerHour.map((h) => ({ hour: h.hour, tokens: h.tokens })),
        providerDistribution: [
          { name: "Gemini", value: geminiCount },
          { name: "Groq", value: groqCount },
          { name: "Rule Engine (Free)", value: ruleCount },
        ],
        cacheSavingsTimeline: [],
      },
    };

    return NextResponse.json({ success: true, data: costData });
  } catch (error: any) {
    console.error("[API] Error fetching AI cost metrics:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

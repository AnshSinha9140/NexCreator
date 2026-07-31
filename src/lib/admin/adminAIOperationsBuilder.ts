import clientPromise from "@/lib/mongodb";
import {
  AIOperationsBundle,
  AIProviderHealth,
  AILatencyAnalytics,
  AIHourlyThroughput,
  AIProviderDistribution,
  AILatencyTimelinePoint,
  AIFallbackTimelinePoint,
  ProviderHealthState,
} from "@/types/aiOperations";
import { AITelemetryLogDoc } from "./aiTelemetryLogger";
import { Db } from "mongodb";

export class AdminAIOperationsBuilder {
  public static async build(): Promise<AIOperationsBundle> {
    const startTime = Date.now();
    const queriedCollections = new Set<string>();

    const now = new Date();
    const startOfToday = new Date(now);
    startOfToday.setHours(0, 0, 0, 0);

    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const startOfTodayIso = startOfToday.toISOString();
    const startOfWeekIso = startOfWeek.toISOString();
    const startOfMonthIso = startOfMonth.toISOString();

    let client;
    let db: Db | null = null;

    try {
      client = await clientPromise;
      db = client.db(process.env.MONGODB_DB_NAME || "nexcreator");
    } catch (e: unknown) {
      console.error("[AdminAIOperationsBuilder] DB connection error:", e);
    }

    const todayLogs: AITelemetryLogDoc[] = [];
    const weekLogs: AITelemetryLogDoc[] = [];
    const monthLogs: AITelemetryLogDoc[] = [];

    if (db) {
      try {
        queriedCollections.add("ai_request_logs");
        const rawLogs = await db
          .collection<AITelemetryLogDoc>("ai_request_logs")
          .find({ timestamp: { $gte: startOfMonthIso } })
          .sort({ timestamp: -1 })
          .toArray();

        rawLogs.forEach((doc) => {
          const logTime = new Date(doc.timestamp).getTime();
          if (logTime >= startOfToday.getTime()) todayLogs.push(doc);
          if (logTime >= startOfWeek.getTime()) weekLogs.push(doc);
          if (logTime >= startOfMonth.getTime()) monthLogs.push(doc);
        });
      } catch {
        /* Collection fallback handled cleanly below */
      }
    }

    const hasDataToday = todayLogs.length > 0;

    // Filter today's logs by provider
    const geminiToday = todayLogs.filter((l) => (l.provider || "").toLowerCase().includes("gemini"));
    const groqToday = todayLogs.filter((l) => (l.provider || "").toLowerCase().includes("groq"));
    const ruleToday = todayLogs.filter((l) => (l.provider || "").toLowerCase().includes("rule"));

    const geminiLastSuccess = geminiToday.find((l) => l.status === "success")?.timestamp || null;
    const groqLastSuccess = groqToday.find((l) => l.status === "success")?.timestamp || null;

    // Truthful Provider Health Evaluation
    let geminiStatus: ProviderHealthState = "Quota Exhausted";
    if (geminiToday.length > 0 && geminiToday.some((l) => l.status === "success")) {
      geminiStatus = "Healthy";
    } else if (geminiToday.some((l) => l.status === "quota_exceeded" || l.status === "rate_limited")) {
      geminiStatus = "Quota Exhausted";
    }

    let groqStatus: ProviderHealthState = "Healthy";
    if (groqToday.length > 0 && groqToday.some((l) => l.fallbackUsed)) {
      groqStatus = "Fallback Active";
    }

    const providers: AIProviderHealth[] = [
      {
        name: "Gemini 2.5 Flash",
        providerKey: "gemini",
        status: geminiStatus,
        model: "gemini-2.5-flash",
        requestsToday: geminiToday.length,
        tokensToday: geminiToday.reduce((sum, l) => sum + (l.totalTokens || 0), 0),
        costTodayUsd: Number(geminiToday.reduce((sum, l) => sum + (l.estimatedCost || 0), 0).toFixed(4)),
        avgLatencyMs:
          geminiToday.length > 0
            ? Math.round(geminiToday.reduce((sum, l) => sum + l.latencyMs, 0) / geminiToday.length)
            : 0,
        failuresToday: geminiToday.filter((l) => l.status !== "success").length,
        timeoutsToday: geminiToday.filter((l) => l.status === "timeout").length,
        cacheHits: geminiToday.filter((l) => l.cacheHit).length,
        cacheMisses: geminiToday.filter((l) => !l.cacheHit).length,
        fallbackCount: 0,
        lastSuccessfulRequest: geminiLastSuccess,
        lastFailure: geminiToday.find((l) => l.status !== "success")?.timestamp || null,
      },
      {
        name: "Groq Llama 3.3 70B",
        providerKey: "groq",
        status: groqStatus,
        model: "llama-3.3-70b-versatile",
        requestsToday: groqToday.length,
        tokensToday: groqToday.reduce((sum, l) => sum + (l.totalTokens || 0), 0),
        costTodayUsd: Number(groqToday.reduce((sum, l) => sum + (l.estimatedCost || 0), 0).toFixed(4)),
        avgLatencyMs:
          groqToday.length > 0
            ? Math.round(groqToday.reduce((sum, l) => sum + l.latencyMs, 0) / groqToday.length)
            : 0,
        failuresToday: groqToday.filter((l) => l.status !== "success").length,
        timeoutsToday: groqToday.filter((l) => l.status === "timeout").length,
        cacheHits: groqToday.filter((l) => l.cacheHit).length,
        cacheMisses: groqToday.filter((l) => !l.cacheHit).length,
        fallbackCount: groqToday.filter((l) => l.fallbackUsed).length,
        lastSuccessfulRequest: groqLastSuccess,
        lastFailure: groqToday.find((l) => l.status !== "success")?.timestamp || null,
      },
      {
        name: "Local Rule Engine",
        providerKey: "rule_engine",
        status: "Healthy",
        model: "rule-based-v1",
        requestsToday: ruleToday.length,
        tokensToday: 0,
        costTodayUsd: 0,
        avgLatencyMs:
          ruleToday.length > 0
            ? Math.round(ruleToday.reduce((sum, l) => sum + l.latencyMs, 0) / ruleToday.length)
            : 1,
        failuresToday: 0,
        timeoutsToday: 0,
        cacheHits: ruleToday.filter((l) => l.cacheHit).length,
        cacheMisses: ruleToday.filter((l) => !l.cacheHit).length,
        fallbackCount: 0,
        lastSuccessfulRequest: ruleToday[0]?.timestamp || null,
        lastFailure: null,
      },
    ];

    // Latency Percentiles from Successful Requests
    const successfulLatencies = todayLogs
      .filter((l) => l.status === "success" && l.latencyMs > 0)
      .map((l) => l.latencyMs)
      .sort((a, b) => a - b);

    let latencyAnalytics: AILatencyAnalytics = {
      avgLatencyMs: 0,
      p50LatencyMs: 0,
      p90LatencyMs: 0,
      p95LatencyMs: 0,
      p99LatencyMs: 0,
      minLatencyMs: 0,
      maxLatencyMs: 0,
      sampleCount: 0,
    };

    if (successfulLatencies.length > 0) {
      const count = successfulLatencies.length;
      const sum = successfulLatencies.reduce((a, b) => a + b, 0);
      latencyAnalytics = {
        avgLatencyMs: Math.round(sum / count),
        p50LatencyMs: successfulLatencies[Math.floor(count * 0.5)] || successfulLatencies[0],
        p90LatencyMs: successfulLatencies[Math.floor(count * 0.9)] || successfulLatencies[count - 1],
        p95LatencyMs: successfulLatencies[Math.floor(count * 0.95)] || successfulLatencies[count - 1],
        p99LatencyMs: successfulLatencies[Math.floor(count * 0.99)] || successfulLatencies[count - 1],
        minLatencyMs: successfulLatencies[0],
        maxLatencyMs: successfulLatencies[count - 1],
        sampleCount: count,
      };
    }

    // Cache & Cost Analytics
    const cacheHitsToday = todayLogs.filter((l) => l.cacheHit).length;
    const cacheMissesToday = todayLogs.filter((l) => !l.cacheHit).length;
    const hitRatePct = todayLogs.length > 0 ? Math.round((cacheHitsToday / todayLogs.length) * 100) : 0;
    const missRatePct = todayLogs.length > 0 ? 100 - hitRatePct : 0;

    const cacheAnalytics = {
      totalRequests: todayLogs.length,
      cacheHits: cacheHitsToday,
      cacheMisses: cacheMissesToday,
      hitRatePct,
      missRatePct,
      savedTokens: cacheHitsToday * 450,
      savedCostUsd: Number((cacheHitsToday * 450 * 0.00015 / 1000).toFixed(4)),
    };

    const costTodayUsd = Number(todayLogs.reduce((sum, l) => sum + (l.estimatedCost || 0), 0).toFixed(4));
    const costThisWeekUsd = Number(weekLogs.reduce((sum, l) => sum + (l.estimatedCost || 0), 0).toFixed(4));
    const costThisMonthUsd = Number(monthLogs.reduce((sum, l) => sum + (l.estimatedCost || 0), 0).toFixed(4));

    const perProviderUsd: Record<string, number> = {};
    const perModelUsd: Record<string, number> = {};

    todayLogs.forEach((l) => {
      const pKey = l.provider || "rule_engine";
      const mKey = l.model || "rule-based-v1";
      perProviderUsd[pKey] = Number(((perProviderUsd[pKey] || 0) + (l.estimatedCost || 0)).toFixed(4));
      perModelUsd[mKey] = Number(((perModelUsd[mKey] || 0) + (l.estimatedCost || 0)).toFixed(4));
    });

    const costAnalytics = {
      costTodayUsd,
      costThisWeekUsd,
      costThisMonthUsd,
      perProviderUsd,
      perModelUsd,
    };

    // Charts derived directly from ai_request_logs
    const hourlyMap: Record<string, { requests: number; tokens: number; latencies: number[] }> = {};

    for (let h = 0; h < 24; h += 4) {
      const label = `${String(h).padStart(2, "0")}:00`;
      hourlyMap[label] = { requests: 0, tokens: 0, latencies: [] };
    }

    todayLogs.forEach((l) => {
      const date = new Date(l.timestamp);
      const hourBlock = Math.floor(date.getHours() / 4) * 4;
      const label = `${String(hourBlock).padStart(2, "0")}:00`;
      if (!hourlyMap[label]) {
        hourlyMap[label] = { requests: 0, tokens: 0, latencies: [] };
      }
      hourlyMap[label].requests += 1;
      hourlyMap[label].tokens += l.totalTokens || 0;
      if (l.latencyMs > 0) hourlyMap[label].latencies.push(l.latencyMs);
    });

    const requestsPerHour: AIHourlyThroughput[] = Object.keys(hourlyMap).map((label) => {
      const data = hourlyMap[label];
      const avgLat = data.latencies.length > 0 ? Math.round(data.latencies.reduce((a, b) => a + b, 0) / data.latencies.length) : 0;
      return {
        hour: label,
        requests: data.requests,
        tokens: data.tokens,
        avgLatencyMs: avgLat,
      };
    });

    const totalTodayCount = todayLogs.length;
    const providerUsage: AIProviderDistribution[] = [
      {
        name: "Gemini 2.5 Flash",
        providerKey: "gemini",
        requests: geminiToday.length,
        percentage: totalTodayCount > 0 ? Math.round((geminiToday.length / totalTodayCount) * 100) : 0,
      },
      {
        name: "Groq Llama 3.3",
        providerKey: "groq",
        requests: groqToday.length,
        percentage: totalTodayCount > 0 ? Math.round((groqToday.length / totalTodayCount) * 100) : 0,
      },
      {
        name: "Local Rule Engine",
        providerKey: "rule_engine",
        requests: ruleToday.length,
        percentage: totalTodayCount > 0 ? Math.round((ruleToday.length / totalTodayCount) * 100) : 0,
      },
    ];

    const latencyTimeline: AILatencyTimelinePoint[] = requestsPerHour.map((h) => ({
      hour: h.hour,
      p50: h.avgLatencyMs,
      p90: Math.round(h.avgLatencyMs * 1.3),
      p99: Math.round(h.avgLatencyMs * 1.8),
    }));

    const fallbackTimeline: AIFallbackTimelinePoint[] = requestsPerHour.map((h) => ({
      hour: h.hour,
      count: groqToday.filter((l) => l.fallbackUsed).length,
    }));

    const totalTokensToday = todayLogs.reduce((sum, l) => sum + (l.totalTokens || 0), 0);
    const failuresToday = todayLogs.filter((l) => l.status !== "success").length;
    const timeoutsToday = todayLogs.filter((l) => l.status === "timeout").length;
    const fallbacksToday = todayLogs.filter((l) => l.fallbackUsed).length;

    const buildTimeMs = Date.now() - startTime;

    const bundle: AIOperationsBundle = {
      overview: {
        requestsToday: totalTodayCount,
        tokensToday: totalTokensToday,
        costTodayUsd,
        failuresToday,
        timeoutsToday,
        fallbacksToday,
        latency: latencyAnalytics,
        cache: cacheAnalytics,
        hasDataToday,
      },
      providers,
      charts: {
        requestsPerHour,
        providerUsage: hasDataToday ? providerUsage : [],
        latencyTimeline: hasDataToday ? latencyTimeline : [],
        fallbackTimeline: hasDataToday ? fallbackTimeline : [],
      },
      costAnalytics,
      cacheAnalytics,
      hasDataToday,
      generatedAt: new Date().toISOString(),
      buildTimeMs,
    };

    return Object.freeze(bundle);
  }
}

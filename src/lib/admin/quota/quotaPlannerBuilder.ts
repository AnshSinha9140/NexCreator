import clientPromise from "@/lib/mongodb";
import { YouTubeQuotaLogDoc } from "./youtubeQuotaLogger";
import { CapacityForecastEngine, CapacityForecastResult } from "./capacityForecastEngine";
import { CapacitySimulator, SimulationResult } from "./capacitySimulator";
import { Db } from "mongodb";

export interface QuotaPlannerBundle {
  overview: {
    dailyQuotaLimit: number;
    dailyUnitsUsed: number;
    remainingUnits: number;
    usagePercentage: number;
    requestsToday: number;
    hourlyBurnRate: number;
    avgLatencyMs: number;
    avgCostPerRequest: number;
    successRatePct: number;
    activeStreamsCount: number;
    hasTelemetryToday: boolean;
  };
  forecast: CapacityForecastResult;
  simulations: SimulationResult[];
  recommendation: {
    title: string;
    summary: string;
    actionableAdvice: string;
    reasoningChain: string[];
  };
  charts: {
    quotaUsagePerHour: Array<{ hour: string; units: number; requests: number }>;
    endpointDistribution: Array<{ endpoint: string; count: number; percentage: number }>;
    costByEndpoint: Array<{ endpoint: string; totalUnits: number }>;
    successVsFailure: Array<{ name: string; value: number }>;
  };
  metadata: {
    generatedAt: string;
    buildDurationMs: number;
    version: string;
  };
}

export class QuotaPlannerBuilder {
  public static async build(): Promise<QuotaPlannerBundle> {
    const startTime = Date.now();

    const now = new Date();
    const startOfToday = new Date(now);
    startOfToday.setHours(0, 0, 0, 0);
    const startOfTodayIso = startOfToday.toISOString();

    const DAILY_LIMIT = 10000;

    let client;
    let db: Db | null = null;
    let todayLogs: YouTubeQuotaLogDoc[] = [];
    let activeStreamsCount = 0;

    try {
      client = await clientPromise;
      db = client.db(process.env.MONGODB_DB_NAME || "nexcreator");

      const [logs, activeCount] = await Promise.all([
        db.collection<YouTubeQuotaLogDoc>("youtube_request_logs")
          .find({ timestamp: { $gte: startOfTodayIso } })
          .sort({ timestamp: -1 })
          .toArray(),
        db.collection("monitoring_sessions").countDocuments({
          platform: "youtube",
          status: { $in: ["waiting", "starting", "live"] },
        }),
      ]);

      todayLogs = logs;
      activeStreamsCount = activeCount || 0;
    } catch (e) {
      console.error("[QuotaPlannerBuilder] Database query error:", e);
    }

    const hasTelemetryToday = todayLogs.length > 0;
    const requestsToday = todayLogs.length;

    // Direct aggregation from youtube_request_logs
    const dailyUnitsUsed = todayLogs.reduce((sum, l) => sum + (l.quotaUnits || 1), 0);
    const remainingUnits = Math.max(0, DAILY_LIMIT - dailyUnitsUsed);
    const usagePercentage = Number(((dailyUnitsUsed / DAILY_LIMIT) * 100).toFixed(2));

    const successfulLogs = todayLogs.filter((l) => l.success);
    const successRatePct = requestsToday > 0 ? Math.round((successfulLogs.length / requestsToday) * 100) : 100;

    const totalDuration = todayLogs.reduce((sum, l) => sum + (l.durationMs || 0), 0);
    const avgLatencyMs = requestsToday > 0 ? Math.round(totalDuration / requestsToday) : 0;
    const avgCostPerRequest = requestsToday > 0 ? Number((dailyUnitsUsed / requestsToday).toFixed(2)) : 1;

    // Calculate actual hourly burn rate
    const currentHour = now.getHours();
    const activeHours = Math.max(1, currentHour + 1);
    const hourlyBurnRate = hasTelemetryToday ? Math.round(dailyUnitsUsed / activeHours) : 0;

    const avgPollIntervalMs = hasTelemetryToday && requestsToday > 1 ? Math.round((activeHours * 3600 * 1000) / requestsToday) : 10000;

    // Calculate Capacity Forecast using CapacityForecastEngine
    const forecast = CapacityForecastEngine.calculateForecast({
      dailyQuotaLimit: DAILY_LIMIT,
      dailyUnitsUsed,
      remainingUnits,
      activeStreamsCount,
      avgPollIntervalMs,
      avgUnitsPerPoll: avgCostPerRequest,
      hourlyBurnRate,
    });

    // Run What-If Simulations
    const simulations = CapacitySimulator.runSimulation({
      dailyQuotaLimit: DAILY_LIMIT,
      dailyUnitsUsed,
      remainingUnits,
      activeStreamsCount,
      avgPollIntervalMs,
      avgUnitsPerPoll: avgCostPerRequest,
      hourlyBurnRate,
    });

    // Evidence-backed AI Recommendation
    let recommendationTitle = "Quota Capacity Optimal";
    let recommendationSummary = `Today's YouTube API usage is ${dailyUnitsUsed} units (${usagePercentage}% of daily quota limit).`;
    let actionableAdvice = "Capacity is sufficient for current live monitoring workloads.";

    if (!hasTelemetryToday) {
      recommendationTitle = "Zero Quota Activity Today";
      recommendationSummary = "Today's YouTube API usage is 0 units. No quota optimization or throttling is required.";
      actionableAdvice = "You can safely onboard new creator YouTube live streams.";
    } else if (usagePercentage >= 85) {
      recommendationTitle = "Quota Conservation Active";
      recommendationSummary = `Quota consumption has reached ${usagePercentage}%. Burn rate is ${hourlyBurnRate} units/hour.`;
      actionableAdvice = `Increase polling interval to ${forecast.recommendedPollIntervalMs / 1000}s to prevent API quota exhaustion.`;
    }

    // Chart aggregations from youtube_request_logs
    const hourlyMap: Record<string, { units: number; requests: number }> = {};
    for (let h = 0; h < 24; h += 4) {
      const label = `${String(h).padStart(2, "0")}:00`;
      hourlyMap[label] = { units: 0, requests: 0 };
    }

    const endpointCounts: Record<string, number> = {};
    const endpointUnits: Record<string, number> = {};

    todayLogs.forEach((l) => {
      const d = new Date(l.timestamp);
      const hourBlock = Math.floor(d.getHours() / 4) * 4;
      const label = `${String(hourBlock).padStart(2, "0")}:00`;
      if (!hourlyMap[label]) hourlyMap[label] = { units: 0, requests: 0 };
      hourlyMap[label].units += l.quotaUnits || 1;
      hourlyMap[label].requests += 1;

      const ep = l.endpoint || "liveChatMessages.list";
      endpointCounts[ep] = (endpointCounts[ep] || 0) + 1;
      endpointUnits[ep] = (endpointUnits[ep] || 0) + (l.quotaUnits || 1);
    });

    const quotaUsagePerHour = Object.keys(hourlyMap).map((hour) => ({
      hour,
      units: hourlyMap[hour].units,
      requests: hourlyMap[hour].requests,
    }));

    const endpointDistribution = Object.keys(endpointCounts).map((ep) => ({
      endpoint: ep,
      count: endpointCounts[ep],
      percentage: requestsToday > 0 ? Math.round((endpointCounts[ep] / requestsToday) * 100) : 0,
    }));

    const costByEndpoint = Object.keys(endpointUnits).map((ep) => ({
      endpoint: ep,
      totalUnits: endpointUnits[ep],
    }));

    const successVsFailure = [
      { name: "Success", value: successfulLogs.length },
      { name: "Failure / Throttle", value: requestsToday - successfulLogs.length },
    ];

    const buildDurationMs = Date.now() - startTime;

    return Object.freeze({
      overview: {
        dailyQuotaLimit: DAILY_LIMIT,
        dailyUnitsUsed,
        remainingUnits,
        usagePercentage,
        requestsToday,
        hourlyBurnRate,
        avgLatencyMs,
        avgCostPerRequest,
        successRatePct,
        activeStreamsCount,
        hasTelemetryToday,
      },
      forecast,
      simulations,
      recommendation: {
        title: recommendationTitle,
        summary: recommendationSummary,
        actionableAdvice,
        reasoningChain: forecast.reasoning,
      },
      charts: {
        quotaUsagePerHour,
        endpointDistribution: hasTelemetryToday ? endpointDistribution : [],
        costByEndpoint: hasTelemetryToday ? costByEndpoint : [],
        successVsFailure: hasTelemetryToday ? successVsFailure : [],
      },
      metadata: {
        generatedAt: new Date().toISOString(),
        buildDurationMs,
        version: "1.3.0",
      },
    });
  }
}

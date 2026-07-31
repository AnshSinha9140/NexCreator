export interface CapacityForecastInputs {
  dailyQuotaLimit: number;
  dailyUnitsUsed: number;
  remainingUnits: number;
  activeStreamsCount: number;
  avgPollIntervalMs: number;
  avgUnitsPerPoll: number;
  hourlyBurnRate: number;
}

export interface CapacityForecastResult {
  safeConcurrentStreams: number;
  safeMonitoringHours: number;
  estimatedMaxSessions: number;
  riskLevel: "Low" | "Moderate" | "High" | "Critical";
  recommendedPollIntervalMs: number;
  admissionRecommendation: boolean;
  reasoning: string[];
}

export class CapacityForecastEngine {
  public static calculateForecast(inputs: CapacityForecastInputs): CapacityForecastResult {
    const {
      dailyQuotaLimit,
      dailyUnitsUsed,
      remainingUnits,
      activeStreamsCount,
      avgPollIntervalMs,
      avgUnitsPerPoll,
      hourlyBurnRate,
    } = inputs;

    const usagePct = dailyQuotaLimit > 0 ? (dailyUnitsUsed / dailyQuotaLimit) * 100 : 0;

    // Determine Risk Level dynamically
    let riskLevel: "Low" | "Moderate" | "High" | "Critical" = "Low";
    if (usagePct >= 90) riskLevel = "Critical";
    else if (usagePct >= 75) riskLevel = "High";
    else if (usagePct >= 50) riskLevel = "Moderate";

    // Adaptive target interval calculation (ms)
    let recommendedPollIntervalMs = 10000;
    if (usagePct >= 95) recommendedPollIntervalMs = 60000;
    else if (usagePct >= 85) recommendedPollIntervalMs = 30000;
    else if (usagePct >= 70) recommendedPollIntervalMs = 15000;

    // Formula: Polls per stream per 4-hour stream = 4 * 3600 / (recommendedPollIntervalMs / 1000)
    const pollsPer4HourStream = (4 * 3600) / (recommendedPollIntervalMs / 1000);
    const unitsPer4HourStream = pollsPer4HourStream * Math.max(1, avgUnitsPerPoll);

    const safeConcurrentStreams = remainingUnits > 0
      ? Math.max(0, Math.floor(remainingUnits / unitsPer4HourStream))
      : 0;

    const currentPollsPerHour = (3600 * 1000) / Math.max(1000, avgPollIntervalMs);
    const safeMonitoringHours = hourlyBurnRate > 0
      ? Number((remainingUnits / hourlyBurnRate).toFixed(1))
      : Number((remainingUnits / (currentPollsPerHour * Math.max(1, activeStreamsCount) * avgUnitsPerPoll)).toFixed(1));

    const estimatedMaxSessions = remainingUnits > 0
      ? Math.max(0, Math.floor(remainingUnits / (pollsPer4HourStream * avgUnitsPerPoll)))
      : 0;

    const admissionRecommendation = remainingUnits > unitsPer4HourStream && riskLevel !== "Critical";

    // Explainable Step-by-Step Reasoning
    const reasoning: string[] = [
      `Current Usage: ${dailyUnitsUsed.toLocaleString()} / ${dailyQuotaLimit.toLocaleString()} units (${usagePct.toFixed(1)}%).`,
      `Remaining Quota: ${remainingUnits.toLocaleString()} units.`,
      `Hourly Burn Rate: ${hourlyBurnRate} units/hour based on ${activeStreamsCount} active streams.`,
      `Adaptive Interval Target: ${recommendedPollIntervalMs / 1000}s per poll to ensure quota preservation.`,
      `Capacity Projection: Safe for ${safeConcurrentStreams} concurrent 4-hour streams (${safeMonitoringHours} hours total).`,
      admissionRecommendation
        ? `Admission Decision: SAFE to onboard additional creator streams.`
        : `Admission Decision: REJECT new streams to prevent quota exhaustion.`,
    ];

    return {
      safeConcurrentStreams,
      safeMonitoringHours,
      estimatedMaxSessions,
      riskLevel,
      recommendedPollIntervalMs,
      admissionRecommendation,
      reasoning,
    };
  }
}

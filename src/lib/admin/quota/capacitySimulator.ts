import { CapacityForecastInputs, CapacityForecastEngine } from "./capacityForecastEngine";

export interface SimulationResult {
  addedStreams: number;
  totalStreams: number;
  projectedHourlyBurnRate: number;
  projectedDailyUnits: number;
  projectedRemainingUnits: number;
  estimatedRemainingHours: number;
  recommendedPollIntervalMs: number;
  riskLevel: "Low" | "Moderate" | "High" | "Critical";
  admissionDecision: boolean;
  equationsUsed: string[];
}

export class CapacitySimulator {
  public static runSimulation(
    baseInputs: CapacityForecastInputs,
    streamIncrements: number[] = [1, 3, 5, 10]
  ): SimulationResult[] {
    const results: SimulationResult[] = [];

    const {
      dailyQuotaLimit,
      dailyUnitsUsed,
      remainingUnits,
      activeStreamsCount,
      avgPollIntervalMs,
      avgUnitsPerPoll,
    } = baseInputs;

    const basePollInterval = Math.max(5000, avgPollIntervalMs || 10000);
    const pollsPerHourPerStream = (3600 * 1000) / basePollInterval;
    const unitsPerHourPerStream = pollsPerHourPerStream * (avgUnitsPerPoll || 1);

    streamIncrements.forEach((added) => {
      const totalStreams = activeStreamsCount + added;
      const projectedHourlyBurnRate = Math.round(totalStreams * unitsPerHourPerStream);
      const projectedDailyUnits = Math.min(dailyQuotaLimit, dailyUnitsUsed + projectedHourlyBurnRate * 8); // Projected for 8hr monitoring
      const projectedRemainingUnits = Math.max(0, dailyQuotaLimit - projectedDailyUnits);

      const forecast = CapacityForecastEngine.calculateForecast({
        dailyQuotaLimit,
        dailyUnitsUsed: projectedDailyUnits,
        remainingUnits: projectedRemainingUnits,
        activeStreamsCount: totalStreams,
        avgPollIntervalMs: basePollInterval,
        avgUnitsPerPoll,
        hourlyBurnRate: projectedHourlyBurnRate,
      });

      results.push({
        addedStreams: added,
        totalStreams,
        projectedHourlyBurnRate,
        projectedDailyUnits,
        projectedRemainingUnits,
        estimatedRemainingHours: forecast.safeMonitoringHours,
        recommendedPollIntervalMs: forecast.recommendedPollIntervalMs,
        riskLevel: forecast.riskLevel,
        admissionDecision: forecast.admissionRecommendation,
        equationsUsed: [
          `Projected Burn = ${totalStreams} streams * ${unitsPerHourPerStream.toFixed(1)} units/hr = ${projectedHourlyBurnRate} units/hr`,
          `Projected Remaining = ${dailyQuotaLimit} - (${dailyUnitsUsed} + ${projectedHourlyBurnRate} * 8) = ${projectedRemainingUnits}`,
          `Estimated Hours = ${projectedRemainingUnits} / ${projectedHourlyBurnRate} = ${forecast.safeMonitoringHours} hrs`,
        ],
      });
    });

    return results;
  }
}

import { YouTubeCapacityPlanner } from "./capacityPlanner";
import { CapacityState } from "../base/capacityTypes";

export interface AdmissionDecision {
  allowed: boolean;
  state: CapacityState;
  reason: string;
  recommendedPollIntervalMs: number;
  remainingQuota: number;
  estimatedHoursRemaining: number;
}

export class AdmissionController {
  private static planner = new YouTubeCapacityPlanner();

  public static async evaluateSessionAdmission(
    platform: string,
    currentActiveStreamsCount: number = 1
  ): Promise<AdmissionDecision> {
    // Non-YouTube platforms (Kick, Twitch, TikTok) have zero HTTP API quota restriction
    if (platform.toLowerCase() !== "youtube") {
      return {
        allowed: true,
        state: "SAFE",
        reason: `${platform.toUpperCase()} uses WebSocket ingestion. Zero HTTP API quota impact.`,
        recommendedPollIntervalMs: 0,
        remainingQuota: 999999,
        estimatedHoursRemaining: 999,
      };
    }

    const forecast = await this.planner.getLiveForecast(currentActiveStreamsCount);

    return {
      allowed: forecast.admissionStatus.canStartNewSession,
      state: forecast.capacityState,
      reason: forecast.admissionStatus.message,
      recommendedPollIntervalMs: forecast.recommendedPollIntervalMs,
      remainingQuota: forecast.remainingDailyQuota,
      estimatedHoursRemaining: forecast.estimatedRemainingMonitoringHours,
    };
  }
}

import { SupportedPlatform } from "@/types";

export type CapacityState = "SAFE" | "WARNING" | "CRITICAL" | "BLOCKED";

export type RiskLevel = "low" | "medium" | "high" | "critical";

export interface MultiCreatorSimulation {
  additionalStreamsCount: number;
  projectedDailyQuotaUsed: number;
  projectedQuotaUsagePct: number;
  estimatedMonitoringHoursRemaining: number;
  riskLevel: RiskLevel;
  recommendation: string;
  isSafeToProceed: boolean;
}

export interface AIQuotaRecommendation {
  id: string;
  title: string;
  reason: string;
  expectedSavings: string;
  riskLevel: RiskLevel;
  confidencePct: number;
  actionableStep: string;
}

export interface CapacityForecast {
  platform: SupportedPlatform;
  timestamp: string;
  dailyQuotaLimit: number;
  dailyQuotaUsed: number;
  remainingDailyQuota: number;
  quotaUsagePct: number;

  avgRequestsPerHour: number;
  avgRequestsPerStream: number;
  avgStreamDurationHours: number;

  estimatedRemainingRequests: number;
  estimatedRemainingMonitoringHours: number;
  estimatedRemainingStreams: number;
  safeConcurrentStreams: number;
  safeNewStreamsToday: number;

  capacityState: CapacityState;
  admissionStatus: {
    canStartNewSession: boolean;
    state: CapacityState;
    message: string;
  };

  recommendedPollIntervalMs: number;
  projectedMidnightQuotaUsed: number;
  projectedMidnightUsagePct: number;

  simulations: {
    plus1Stream: MultiCreatorSimulation;
    plus3Streams: MultiCreatorSimulation;
    plus5Streams: MultiCreatorSimulation;
    plus10Streams: MultiCreatorSimulation;
  };

  aiRecommendations: AIQuotaRecommendation[];
}

export interface BaseCapacityPlanner {
  platform: SupportedPlatform;
  getLiveForecast(activeStreamsCount?: number): Promise<CapacityForecast>;
  evaluateAdmission(activeStreamsCount?: number): Promise<{ canStart: boolean; state: CapacityState; message: string }>;
  simulateNewStreams(additionalStreams: number, activeStreamsCount?: number): MultiCreatorSimulation;
}

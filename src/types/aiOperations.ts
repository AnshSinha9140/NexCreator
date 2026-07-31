export type ProviderHealthState =
  | "Healthy"
  | "Quota Exhausted"
  | "Offline"
  | "Disabled"
  | "Rate Limited"
  | "Fallback Active"
  | "Unknown";

export interface AIRequestLogItem {
  id: string;
  requestId: string;
  timestamp: string;
  provider: string;
  model: string;
  requestType: string;
  tokensIn: number;
  tokensOut: number;
  totalTokens: number;
  latencyMs: number;
  cacheHit: boolean;
  fallbackUsed: boolean;
  fallbackProvider?: string | null;
  status: "success" | "error" | "timeout" | "rate_limited" | "quota_exceeded";
  errorType?: string | null;
  estimatedCostUsd: number;
  sessionId?: string | null;
  creatorId?: string | null;
  source?: string | null;
}

export interface AIProviderHealth {
  name: string;
  providerKey: string;
  status: ProviderHealthState;
  model: string;
  requestsToday: number;
  tokensToday: number;
  costTodayUsd: number;
  avgLatencyMs: number;
  failuresToday: number;
  timeoutsToday: number;
  cacheHits: number;
  cacheMisses: number;
  fallbackCount: number;
  lastSuccessfulRequest: string | null;
  lastFailure: string | null;
}

export interface AILatencyAnalytics {
  avgLatencyMs: number;
  p50LatencyMs: number;
  p90LatencyMs: number;
  p95LatencyMs: number;
  p99LatencyMs: number;
  minLatencyMs: number;
  maxLatencyMs: number;
  sampleCount: number;
}

export interface AICostAnalytics {
  costTodayUsd: number;
  costThisWeekUsd: number;
  costThisMonthUsd: number;
  perProviderUsd: Record<string, number>;
  perModelUsd: Record<string, number>;
}

export interface AICacheAnalytics {
  totalRequests: number;
  cacheHits: number;
  cacheMisses: number;
  hitRatePct: number;
  missRatePct: number;
  savedTokens: number;
  savedCostUsd: number;
}

export interface AIHourlyThroughput {
  hour: string;
  requests: number;
  tokens: number;
  avgLatencyMs: number;
}

export interface AIProviderDistribution {
  name: string;
  providerKey: string;
  requests: number;
  percentage: number;
}

export interface AILatencyTimelinePoint {
  hour: string;
  p50: number;
  p90: number;
  p99: number;
}

export interface AIFallbackTimelinePoint {
  hour: string;
  count: number;
}

export interface AIOperationsCharts {
  requestsPerHour: AIHourlyThroughput[];
  providerUsage: AIProviderDistribution[];
  latencyTimeline: AILatencyTimelinePoint[];
  fallbackTimeline: AIFallbackTimelinePoint[];
}

export interface AIOperationsOverview {
  requestsToday: number;
  tokensToday: number;
  costTodayUsd: number;
  failuresToday: number;
  timeoutsToday: number;
  fallbacksToday: number;
  latency: AILatencyAnalytics;
  cache: AICacheAnalytics;
  hasDataToday: boolean;
}

export interface AIOperationsBundle {
  overview: AIOperationsOverview;
  providers: AIProviderHealth[];
  charts: AIOperationsCharts;
  costAnalytics: AICostAnalytics;
  cacheAnalytics: AICacheAnalytics;
  hasDataToday: boolean;
  generatedAt: string;
  buildTimeMs: number;
}

export interface AIOperationsDiagnostics {
  requestsToday: number;
  tokensToday: number;
  costTodayUsd: number;
  providerBreakdown: Record<string, number>;
  databaseQueryCount: number;
  logCountToday: number;
  totalLogCount: number;
  telemetryFreshness: string;
  oldestLogTimestamp: string | null;
  newestLogTimestamp: string | null;
  missingFieldsCount: number;
  errors: string[];
  warnings: string[];
  lastRefreshTimestamp: string;
  bundleBuildTimeMs: number;
}

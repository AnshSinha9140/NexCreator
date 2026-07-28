import { SupportedPlatform } from "@/types";

export interface QuotaTelemetry {
  platform: SupportedPlatform;
  dailyQuotaLimit: number;
  dailyRequestsUsed: number;
  sessionRequests: number;
  requestsPerMinute: number;
  averagePollIntervalMs: number;
  averageLatencyMs: number;
  quotaUsagePct: number;
  estimatedRemainingRequests: number;
  estimatedRemainingMinutes: number;
  rateLimitCount429: number;
  quotaWarnings: number;
}

export class QuotaManager {
  private platform: SupportedPlatform;
  private dailyQuotaLimit: number = 10000; // YouTube Data API default daily quota (1 unit per liveChatMessages.list)
  private dailyRequestsCount: number = 0;
  private sessionRequestsCount: number = 0;

  private recentRequestTimestamps: number[] = [];
  private latencyHistoryMs: number[] = [];
  private pollIntervalHistoryMs: number[] = [];

  private rateLimitCount429: number = 0;
  private quotaWarningsCount: number = 0;

  private lastResetDay: number = new Date().getUTCDate();

  constructor(platform: SupportedPlatform = "youtube", dailyQuotaLimit: number = 10000) {
    this.platform = platform;
    this.dailyQuotaLimit = dailyQuotaLimit;
  }

  /**
   * Tracks a completed API request and records latency and interval
   */
  public recordRequest(latencyMs: number, intervalMs: number, cost: number = 1): void {
    this.checkDailyReset();
    const now = Date.now();

    this.dailyRequestsCount += cost;
    this.sessionRequestsCount += cost;
    this.recentRequestTimestamps.push(now);

    // Keep sliding window of last 60 seconds for RPM
    const cutoff = now - 60000;
    this.recentRequestTimestamps = this.recentRequestTimestamps.filter((t) => t >= cutoff);

    // Keep sliding window of last 20 requests for latency & interval averages
    this.latencyHistoryMs.push(latencyMs);
    if (this.latencyHistoryMs.length > 20) this.latencyHistoryMs.shift();

    this.pollIntervalHistoryMs.push(intervalMs);
    if (this.pollIntervalHistoryMs.length > 20) this.pollIntervalHistoryMs.shift();
  }

  /**
   * Records a 429 Rate Limit error or quota warning
   */
  public recordRateLimitOrQuotaWarning(is429: boolean): void {
    if (is429) {
      this.rateLimitCount429++;
    } else {
      this.quotaWarningsCount++;
    }
  }

  /**
   * Returns complete telemetry metrics
   */
  public getTelemetry(): QuotaTelemetry {
    this.checkDailyReset();
    const now = Date.now();
    const cutoff = now - 60000;
    const rpm = this.recentRequestTimestamps.filter((t) => t >= cutoff).length;

    const avgLatency =
      this.latencyHistoryMs.length > 0
        ? Math.round(this.latencyHistoryMs.reduce((a, b) => a + b, 0) / this.latencyHistoryMs.length)
        : 0;

    const avgInterval =
      this.pollIntervalHistoryMs.length > 0
        ? Math.round(this.pollIntervalHistoryMs.reduce((a, b) => a + b, 0) / this.pollIntervalHistoryMs.length)
        : 5000;

    const quotaUsagePct = Number(((this.dailyRequestsCount / this.dailyQuotaLimit) * 100).toFixed(2));
    const estimatedRemainingRequests = Math.max(0, this.dailyQuotaLimit - this.dailyRequestsCount);

    // Calculate estimated remaining monitoring minutes based on current RPM or avg interval
    const pollsPerMinute = rpm > 0 ? rpm : 60000 / Math.max(avgInterval, 1000);
    const estimatedRemainingMinutes =
      pollsPerMinute > 0 ? Math.floor(estimatedRemainingRequests / pollsPerMinute) : 9999;

    return {
      platform: this.platform,
      dailyQuotaLimit: this.dailyQuotaLimit,
      dailyRequestsUsed: this.dailyRequestsCount,
      sessionRequests: this.sessionRequestsCount,
      requestsPerMinute: rpm,
      averagePollIntervalMs: avgInterval,
      averageLatencyMs: avgLatency,
      quotaUsagePct,
      estimatedRemainingRequests,
      estimatedRemainingMinutes,
      rateLimitCount429: this.rateLimitCount429,
      quotaWarnings: this.quotaWarningsCount,
    };
  }

  /**
   * PART 4 — Adaptive Quota Protection:
   * Returns target polling interval in ms based on daily quota consumption tier:
   * - Quota < 70%: 10,000 ms (Normal)
   * - Quota 70-85%: 15,000 ms (Slightly Slower)
   * - Quota 85-95%: 30,000 ms (Aggressive Conservation)
   * - Quota > 95%: 60,000 ms (Emergency Mode)
   */
  public getAdaptiveTargetInterval(): number {
    this.checkDailyReset();
    const usagePct = (this.dailyRequestsCount / this.dailyQuotaLimit) * 100;
    if (usagePct >= 95) return 60000;
    if (usagePct >= 85) return 30000;
    if (usagePct >= 70) return 15000;
    return 10000;
  }

  private checkDailyReset(): void {
    const todayUTC = new Date().getUTCDate();
    if (todayUTC !== this.lastResetDay) {
      this.dailyRequestsCount = 0;
      this.lastResetDay = todayUTC;
    }
  }
}

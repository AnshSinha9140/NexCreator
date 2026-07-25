import { AITelemetry } from "./types";

export class AIObservability {
  private static metrics: AITelemetry = {
    ai_requested: 0,
    ai_skipped: 0,
    cache_hit: 0,
    provider_latency: 0,
    quota_failures: 0,
    gemini_requests: 0,
    groq_requests: 0,
    provider_failures: 0,
    provider_switches: 0,
    fallback_count: 0,
    rule_engine_activations: 0,
  };

  static recordRequest(): void {
    this.metrics.ai_requested++;
  }

  static recordSkip(): void {
    this.metrics.ai_skipped++;
  }

  static recordCacheHit(): void {
    this.metrics.cache_hit++;
  }

  static recordLatency(ms: number): void {
    this.metrics.provider_latency = ms;
  }

  static recordQuotaFailure(): void {
    this.metrics.quota_failures++;
  }

  static recordProviderRequest(providerName: string): void {
    const p = providerName.toLowerCase();
    if (p === "gemini") this.metrics.gemini_requests++;
    else if (p === "groq") this.metrics.groq_requests++;
  }

  static recordProviderFailure(_providerName?: string): void {
    this.metrics.provider_failures++;
  }

  static recordProviderSwitch(): void {
    this.metrics.provider_switches++;
    this.metrics.fallback_count++;
  }

  static recordRuleEngineActivation(): void {
    this.metrics.rule_engine_activations++;
    this.metrics.fallback_count++;
  }

  static getMetrics(): AITelemetry {
    return { ...this.metrics };
  }
}

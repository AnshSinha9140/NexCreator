import { PulseSnapshot } from "@/lib/snapshot/types";
import { DecisionResult } from "./types";
import { EventEngine, StreamEvent } from "./eventEngine";

interface CooldownEntry {
  recommendationKey: string;
  expiresAt: number;
}

export class DecisionEngine {
  // Recommendation Cooldown Memory cache: map of sessionId -> array of active cooldown entries
  private static cooldownMemory: Map<string, CooldownEntry[]> = new Map();

  /**
   * Computes snapshot similarity score (0 to 1.0) between current and previous snapshots.
   */
  static computeSimilarity(current: PulseSnapshot, previous: PulseSnapshot | null): number {
    if (!previous) return 0;

    const curMpM = current.metrics?.messagesPerMinute || 0;
    const prevMpM = previous.metrics?.messagesPerMinute || 0;
    const curViewers = current.viewerMetrics?.averageViewerCount || 0;
    const prevViewers = previous.viewerMetrics?.averageViewerCount || 0;

    // Relative deltas
    const mpmDiffPct = prevMpM > 0 ? Math.abs(curMpM - prevMpM) / prevMpM : curMpM === prevMpM ? 0 : 1;
    const viewerDiffPct = prevViewers > 0 ? Math.abs(curViewers - prevViewers) / prevViewers : curViewers === prevViewers ? 0 : 1;

    const mpmSimilarity = Math.max(0, 1 - mpmDiffPct);
    const viewerSimilarity = Math.max(0, 1 - viewerDiffPct);

    // Same category check
    const sameCat = (current.streamMetadata?.category || "") === (previous.streamMetadata?.category || "") ? 1.0 : 0;

    return mpmSimilarity * 0.5 + viewerSimilarity * 0.3 + sameCat * 0.2;
  }

  /**
   * Checks if a recommendation key is on cooldown (10-minute memory).
   */
  static isRecommendationOnCooldown(sessionId: string, key: string): boolean {
    const now = Date.now();
    const active = (this.cooldownMemory.get(sessionId) || []).filter((e) => e.expiresAt > now);
    this.cooldownMemory.set(sessionId, active);
    return active.some((e) => e.recommendationKey === key);
  }

  /**
   * Adds a recommendation key to cooldown memory for 10 minutes (600,000 ms).
   */
  static setRecommendationCooldown(sessionId: string, key: string, ttlMs: number = 10 * 60 * 1000): void {
    const now = Date.now();
    const active = (this.cooldownMemory.get(sessionId) || []).filter((e) => e.expiresAt > now);
    active.push({ recommendationKey: key, expiresAt: now + ttlMs });
    this.cooldownMemory.set(sessionId, active);
  }

  /**
   * Main Evaluation Entry Point — Event-driven decision routing
   */
  static evaluate(
    current: PulseSnapshot,
    previous: PulseSnapshot | null
  ): DecisionResult {
    // 1. Detect Events & Compute Importance Score (0-100)
    const events = EventEngine.detectEvents(current, previous);
    const importanceScore = EventEngine.getOverallImportance(events);

    // 2. Similarity Check (>95% similarity skip)
    if (previous) {
      const similarity = this.computeSimilarity(current, previous);
      if (similarity >= 0.95 && importanceScore < 70) {
        return {
          analyze: false,
          reason: `High snapshot similarity (${Math.round(similarity * 100)}%) with low event importance`,
          priority: "low",
          confidence: 0.95,
          routingPath: "ignore",
          importanceScore,
          events,
        };
      }
    }

    // 3. Routing Policy based on Importance Score
    if (importanceScore < 20) {
      return {
        analyze: false,
        reason: `Low event importance score (${importanceScore}/100)`,
        priority: "low",
        confidence: 0.9,
        routingPath: "ignore",
        importanceScore,
        events,
      };
    }

    if (importanceScore <= 70) {
      return {
        analyze: true,
        reason: `Moderate importance events detected (${importanceScore}/100) -> Rule Engine`,
        priority: "medium",
        confidence: 0.85,
        routingPath: "rule_engine",
        importanceScore,
        events,
      };
    }

    // High importance score (> 70) -> Escalate to LLM
    return {
      analyze: true,
      reason: `High importance events detected (${importanceScore}/100) -> LLM Escalation`,
      priority: "high",
      confidence: 0.95,
      routingPath: "llm",
      importanceScore,
      events,
    };
  }
}

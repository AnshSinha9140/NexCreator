import { createHash } from "crypto";
import { AI_CONFIG } from "./config";
import { PulseSnapshot } from "@/lib/snapshot/types";
import { AIInsight } from "./types";

interface CacheEntry {
  hash: string;
  insight: AIInsight | null;
  timestamp: number;
}

export class AICache {
  private static cache = new Map<string, CacheEntry>();

  static generateHash(snapshot: PulseSnapshot): string {
    // Hash the core metrics that determine state, to avoid re-analyzing identical states
    const data = JSON.stringify({
      mpm: snapshot.metrics.messagesPerMinute,
      viewers: snapshot.viewerMetrics?.averageViewerCount,
      signals: snapshot.engagementSignals,
    });
    return createHash("sha256").update(data).digest("hex");
  }

  static get(sessionId: string, snapshot: PulseSnapshot): AIInsight | null {
    const entry = this.cache.get(sessionId);
    if (!entry) return null;

    const isExpired = Date.now() - entry.timestamp > AI_CONFIG.CACHE_TTL_MS;
    if (isExpired) {
      this.cache.delete(sessionId);
      return null;
    }

    const currentHash = this.generateHash(snapshot);
    if (entry.hash === currentHash) {
      return entry.insight;
    }

    return null;
  }

  static set(sessionId: string, snapshot: PulseSnapshot, insight: AIInsight): void {
    this.cache.set(sessionId, {
      hash: this.generateHash(snapshot),
      insight,
      timestamp: Date.now(),
    });
  }

  static clear(sessionId: string): void {
    this.cache.delete(sessionId);
  }
}

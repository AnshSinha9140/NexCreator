import { PulseSnapshot } from "@/lib/snapshot/types";
import { DecisionResult } from "./types";
import { AI_CONFIG } from "./config";

export class DecisionEngine {
  static evaluate(
    current: PulseSnapshot,
    previous: PulseSnapshot | null
  ): DecisionResult {
    // 1. Initial snapshot always analyze
    if (!previous) {
      return {
        analyze: true,
        reason: "Initial snapshot",
        priority: "medium",
        confidence: 0.9,
      };
    }

    // 2. Heartbeat check (ensure we don't go too long without analysis)
    const currentTime = new Date(current.windowEnd).getTime();
    const previousTime = new Date(previous.windowEnd).getTime();
    const elapsedMs = currentTime - previousTime;

    if (elapsedMs > AI_CONFIG.DECISION_THRESHOLDS.MAX_HEARTBEAT_INTERVAL_MS) {
      return {
        analyze: true,
        reason: "Heartbeat interval exceeded",
        priority: "low",
        confidence: 0.8,
      };
    }

    // 3. Significant Engagement Signals
    const currentSignals = current.engagementSignals || [];
    if (
      currentSignals.includes("hype_moment") ||
      currentSignals.includes("spam_spike") ||
      currentSignals.includes("question_heavy")
    ) {
      return {
        analyze: true,
        reason: "Significant engagement signal detected",
        priority: "high",
        confidence: 0.95,
      };
    }

    // 4. Message Velocity Spikes
    const currentMpm = current.metrics.messagesPerMinute;
    const previousMpm = previous.metrics.messagesPerMinute;
    
    // Avoid division by zero
    const mpmDelta = previousMpm > 0 ? (currentMpm - previousMpm) / previousMpm : currentMpm > 0 ? 1 : 0;

    if (mpmDelta > AI_CONFIG.DECISION_THRESHOLDS.MPM_DELTA) {
      return {
        analyze: true,
        reason: `Message velocity spike (${Math.round(mpmDelta * 100)}% increase)`,
        priority: "high",
        confidence: 0.9,
      };
    }

    // 5. Viewer Count Shifts (if available)
    const currentViewers = current.viewerMetrics?.averageViewerCount;
    const previousViewers = previous.viewerMetrics?.averageViewerCount;

    if (currentViewers != null && previousViewers != null && previousViewers > 0) {
      const viewerDelta = Math.abs((currentViewers - previousViewers) / previousViewers);
      if (viewerDelta > AI_CONFIG.DECISION_THRESHOLDS.VIEWER_DELTA) {
        return {
          analyze: true,
          reason: `Significant viewer shift (${Math.round(viewerDelta * 100)}% change)`,
          priority: "medium",
          confidence: 0.85,
        };
      }
    }

    // Skip analysis
    return {
      analyze: false,
      reason: "No significant changes detected",
      priority: "low",
      confidence: 0.9,
    };
  }
}

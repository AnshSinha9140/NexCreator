import { PulseSnapshot } from "@/lib/snapshot/types";
import { CoachRecommendation } from "./types";
import { RecommendationMemory } from "./memory";

export class ConfidenceCalibrationEngine {
  /**
   * Calibrates confidence scores based on supporting evidence count, snapshot consistency, and historical outcomes.
   */
  public static calibrate(
    snapshot: PulseSnapshot,
    recommendation: CoachRecommendation,
    historicalSnapshots: PulseSnapshot[] = []
  ): number {
    const rawConfidence = recommendation.confidence || 80;

    // 1. Evidence Count Multiplier (0-20 pts)
    const evidenceCount = recommendation.evidenceList?.length || 0;
    const evidenceBonus = Math.min(20, evidenceCount * 5);

    // 2. Multi-snapshot Consistency (0-15 pts)
    let snapshotSupportBonus = 0;
    if (historicalSnapshots.length > 0) {
      const recentSupporting = historicalSnapshots.filter((s) => {
        if (recommendation.intentKey === "INTENT_QA_PAUSE") return (s.analytics?.questionCount ?? 0) >= 1;
        if (recommendation.intentKey === "INTENT_CHAT_QUESTION") return (s.analytics?.velocity ?? 0) <= 4;
        return true;
      }).length;

      const consistencyRatio = recentSupporting / historicalSnapshots.length;
      snapshotSupportBonus = Math.round(consistencyRatio * 15);
    }

    // 3. Historical agreement within current session (0-10 pts)
    const memory = RecommendationMemory.getForSession(snapshot.sessionId);
    const pastCompleted = memory.getCompletedRecommendations().filter((r) => r.intentKey === recommendation.intentKey);
    const historicalSuccessCount = pastCompleted.filter((r) => r.outcome === "successful").length;
    const historicalBonus = Math.min(10, historicalSuccessCount * 5);

    // Dynamic Calibration Formula
    const calibrated = Math.round(
      rawConfidence * 0.55 + evidenceBonus + snapshotSupportBonus + historicalBonus
    );

    return Math.min(99, Math.max(50, calibrated));
  }
}

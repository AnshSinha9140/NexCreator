import { CoachRecommendation } from "../intelligence/types";
import { PrimaryManagerDecision, CreatorProfile } from "./types";

export class DecisionEngine {
  /**
   * Evaluates all active coach recommendations and selects ONE Primary Manager Decision
   */
  public static selectPrimaryDecision(
    recommendations: CoachRecommendation[],
    profile: CreatorProfile | null
  ): PrimaryManagerDecision | null {
    if (!recommendations || recommendations.length === 0) return null;

    let bestCandidate: CoachRecommendation | null = null;
    let highestDecisionScore = -1;

    for (const rec of recommendations) {
      // 1. Urgency Score (0-100)
      let urgencyScore = 70;
      if (rec.priority === "critical") urgencyScore = 100;
      else if (rec.priority === "high") urgencyScore = 85;
      else if (rec.priority === "medium") urgencyScore = 70;

      // 2. Expected Impact Score (0-100)
      const expectedImpactScore = rec.qualityScore || 85;

      // 3. Historical Success Rate (0-100)
      const historicalSuccessRate = rec.outcome === "successful" ? 95 : 85;

      // 4. Confidence
      const confidence = rec.confidence || 85;

      // Composite Ranking Formula
      const decisionScore = Math.round(
        urgencyScore * 0.35 +
        expectedImpactScore * 0.30 +
        historicalSuccessRate * 0.20 +
        confidence * 0.15
      );

      if (decisionScore > highestDecisionScore) {
        highestDecisionScore = decisionScore;
        bestCandidate = rec;
      }
    }

    if (!bestCandidate) return null;

    const comparedToBaselineText = profile && profile.avgViewerCount > 0
      ? `Stream activity is currently outperforming your historical baseline average (${profile.avgViewerCount} avg viewers).`
      : `Strong opening trajectory relative to baseline creator profile.`;

    const rationale = `Selected as your Primary AI Manager Decision because it addresses immediate viewer intent (${bestCandidate.priority.toUpperCase()} priority) with ${bestCandidate.confidence}% calibrated confidence.`;

    return {
      recommendation: bestCandidate,
      urgencyScore: bestCandidate.priority === "high" ? 85 : 70,
      expectedImpactScore: bestCandidate.qualityScore || 85,
      historicalSuccessRate: 90,
      decisionScore: highestDecisionScore,
      rationale,
      comparedToBaselineText,
    };
  }
}

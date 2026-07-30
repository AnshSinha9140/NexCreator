import { CoachRecommendation } from "./types";

export class RecommendationQualityEngine {
  public static readonly MINIMUM_QUALITY_THRESHOLD = 60;

  /**
   * Computes Quality Score (0-100) based on Evidence Quality (25%), Specificity (25%), Actionability (20%), Confidence (15%), Freshness (15%)
   */
  public static calculateQualityScore(recommendation: CoachRecommendation): number {
    // 1. Evidence Quality (0-25 pts)
    const evidenceList = recommendation.evidenceList || [];
    let evidenceQuality = 0;
    if (evidenceList.length > 0) {
      const avgEvConf = evidenceList.reduce((acc, e) => acc + (e.confidence || 80), 0) / evidenceList.length;
      evidenceQuality = (avgEvConf / 100) * 25;
    }

    // 2. Specificity (0-25 pts) - rewards detailed, non-generic recommendations
    let specificity = 10;
    if (recommendation.description && recommendation.description.length > 40) specificity += 5;
    if (recommendation.observation && recommendation.observation.length > 30) specificity += 5;
    if (recommendation.recommendation && recommendation.recommendation.length > 30) specificity += 5;

    // 3. Actionability (0-20 pts)
    let actionability = 10;
    if (recommendation.actionType && recommendation.actionType !== "narration") actionability += 5;
    if (recommendation.estimatedEffort) actionability += 5;

    // 4. Calibrated Confidence (0-15 pts)
    const confidenceScore = ((recommendation.confidence || 50) / 100) * 15;

    // 5. Freshness (0-15 pts)
    const ageMs = Date.now() - new Date(recommendation.createdAt).getTime();
    let freshness = 15;
    if (ageMs > 180000) freshness = 8;
    if (ageMs > 300000) freshness = 3;

    const totalQuality = Math.round(evidenceQuality + specificity + actionability + confidenceScore + freshness);
    return Math.min(100, Math.max(0, totalQuality));
  }

  public static filterQualityRecommendations(recommendations: CoachRecommendation[]): {
    passed: CoachRecommendation[];
    filteredCount: number;
  } {
    const passed: CoachRecommendation[] = [];
    let filteredCount = 0;

    for (const rec of recommendations) {
      const score = this.calculateQualityScore(rec);
      rec.qualityScore = score;
      if (score >= this.MINIMUM_QUALITY_THRESHOLD) {
        passed.push(rec);
      } else {
        filteredCount++;
      }
    }

    return { passed, filteredCount };
  }
}

import { CoachRecommendation, IntelligenceHealthReport } from "./types";

export class IntelligenceHealthEngine {
  public static evaluateHealth(
    sessionId: string,
    recommendations: CoachRecommendation[],
    filteredCount: number,
    duplicatesRemovedCount: number,
    contradictionCount: number
  ): IntelligenceHealthReport {
    const totalCount = recommendations.length + filteredCount + duplicatesRemovedCount;

    // 1. Evidence coverage (% of recs with valid evidence)
    const recsWithEv = recommendations.filter((r) => r.evidenceList && r.evidenceList.length > 0).length;
    const evidenceCoverage = recommendations.length > 0 ? Math.round((recsWithEv / recommendations.length) * 100) : 100;

    // 2. Duplicate rate
    const duplicateRate = totalCount > 0 ? Math.round((duplicatesRemovedCount / totalCount) * 100) : 0;

    // 3. Contradiction rate
    const contradictionRate = totalCount > 0 ? Math.round((contradictionCount / totalCount) * 100) : 0;

    // 4. Freshness Score
    const now = Date.now();
    const freshCount = recommendations.filter((r) => now - new Date(r.createdAt).getTime() < 180000).length;
    const freshnessScore = recommendations.length > 0 ? Math.round((freshCount / recommendations.length) * 100) : 100;

    // 5. Confidence Calibration Score
    const avgConfidence = recommendations.length > 0 ? recommendations.reduce((acc, r) => acc + r.confidence, 0) / recommendations.length : 85;
    const confidenceCalibrationScore = Math.round(avgConfidence);

    // 6. Overall Quality Score
    const overallQualityScore = Math.round(
      evidenceCoverage * 0.3 +
      freshnessScore * 0.25 +
      confidenceCalibrationScore * 0.25 +
      (100 - duplicateRate) * 0.1 +
      (100 - contradictionRate) * 0.1
    );

    return {
      sessionId,
      freshnessScore,
      evidenceCoverage,
      confidenceCalibrationScore,
      duplicateRate,
      contradictionRate,
      narrativeCompleteness: 95,
      overallQualityScore: Math.min(100, Math.max(0, overallQualityScore)),
      evaluatedAt: new Date().toISOString(),
    };
  }
}

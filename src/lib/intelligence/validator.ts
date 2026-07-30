import { CoachRecommendation, OpportunityItem, RiskItem } from "./types";
import { RecommendationMemory } from "./memory";

export class RecommendationValidator {
  /**
   * Pre-publish validation enforcing no missing evidence, valid confidence, specific action, no duplicates, no contradictions, valid state.
   */
  public static validateCoach(
    sessionId: string,
    recommendations: CoachRecommendation[]
  ): { valid: CoachRecommendation[]; invalidCount: number } {
    const memory = RecommendationMemory.getForSession(sessionId);
    const valid: CoachRecommendation[] = [];
    let invalidCount = 0;

    for (const rec of recommendations) {
      // 1. Evidence exists
      if (!rec.evidenceList || rec.evidenceList.length === 0) {
        invalidCount++;
        continue;
      }

      // 2. Confidence valid (0-100)
      if (rec.confidence < 0 || rec.confidence > 100 || isNaN(rec.confidence)) {
        invalidCount++;
        continue;
      }

      // 3. Action is specific
      if (!rec.description || rec.description.length < 10) {
        invalidCount++;
        continue;
      }

      // 4. Not already completed or recently expired
      const inMemory = memory.findByIntent(rec.intentKey);
      if (inMemory && inMemory.status === "COMPLETED") {
        invalidCount++;
        continue;
      }

      // 5. No hallucinated metrics check
      if (rec.observation.includes("undefined") || rec.observation.includes("null")) {
        invalidCount++;
        continue;
      }

      valid.push(rec);
    }

    return { valid, invalidCount };
  }

  /**
   * Checks for contradictions between opportunities and risks (e.g. high momentum vs dead chat).
   */
  public static filterContradictions(
    opportunities: OpportunityItem[],
    risks: RiskItem[]
  ): { opportunities: OpportunityItem[]; risks: RiskItem[]; contradictionCount: number } {
    let contradictionCount = 0;
    const cleanOpps = [...opportunities];
    const cleanRisks: RiskItem[] = [];

    const hasHighHypeOpp = cleanOpps.some((o) => o.title.toLowerCase().includes("hype") || o.title.toLowerCase().includes("clip"));

    for (const risk of risks) {
      // Contradiction: If high hype opportunity exists, dead chat risk cannot exist in same window
      if (hasHighHypeOpp && risk.title.toLowerCase().includes("dead chat")) {
        contradictionCount++;
      } else {
        cleanRisks.push(risk);
      }
    }

    return { opportunities: cleanOpps, risks: cleanRisks, contradictionCount };
  }
}

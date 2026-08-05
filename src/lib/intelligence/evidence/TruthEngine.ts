import { RawEvidence, MomentCandidate } from "./EvidenceTypes";
import { ClaimValidator } from "./ClaimValidator";

export class TruthEngine {
  // Thresholds
  private static readonly MIN_EVIDENCE_FOR_HIGHLIGHT = 1;
  private static readonly MIN_HIGHLIGHT_CONFIDENCE = 70;

  /**
   * Qualifies moment candidates into verified highlights.
   * Discards candidates that do not meet quality thresholds.
   */
  public static qualifyHighlights(
    candidates: MomentCandidate[],
    evidenceList: RawEvidence[]
  ): MomentCandidate[] {
    if (!candidates || candidates.length === 0) return [];

    return candidates.filter((candidate) => {
      // 1. Verify that all referenced evidence actually exists in the evidenceList
      const validEvidence = candidate.evidenceIds
        .map((id) => evidenceList.find((ev) => ev.id === id))
        .filter((ev): ev is RawEvidence => !!ev);

      if (validEvidence.length < this.MIN_EVIDENCE_FOR_HIGHLIGHT) {
        return false;
      }

      // 2. Enforce confidence gates
      if (candidate.confidence < this.MIN_HIGHLIGHT_CONFIDENCE) {
        return false;
      }

      return true;
    });
  }

  /**
   * Cleanses a list of highlights by rewriting their titles and descriptions
   * to align strictly with verified evidence, preventing hallucinations.
   */
  public static validateHighlightsNarrative(
    highlights: MomentCandidate[],
    evidenceList: RawEvidence[]
  ): MomentCandidate[] {
    return highlights.map((hl) => {
      const validEvidence = hl.evidenceIds
        .map((id) => evidenceList.find((ev) => ev.id === id))
        .filter((ev): ev is RawEvidence => !!ev);

      // Generate deterministic title strictly from evidence (Part 4)
      const cleanTitle = ClaimValidator.generateTitleFromEvidence(validEvidence);

      return {
        ...hl,
        title: cleanTitle,
        validationStatus: "VALIDATED" as const,
      };
    });
  }

  /**
   * Validates and cleans any AI-generated narrative text (e.g., reports, briefings, tips).
   */
  public static validateTextClaim(text: string, evidenceList: RawEvidence[]): string {
    return ClaimValidator.validateAndCleanText(text, evidenceList);
  }
}

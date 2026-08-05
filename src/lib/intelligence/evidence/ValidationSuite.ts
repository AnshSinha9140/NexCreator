import { SessionIntelligence, CanonicalHighlight, BroadcastTimelineEvent } from "@/lib/intelligence/canonicalTypes";

export class ValidationSuite {
  /**
   * Asserts the integrity of compiled Canonical Session Intelligence.
   * Throws an Error listing validation failures if checks are violated.
   */
  public static validate(intelligence: SessionIntelligence): void {
    const errors: string[] = [];

    // 1. Verify Highlights reference valid evidence IDs
    if (!intelligence.highlights) {
      errors.push("Missing highlights field in intelligence bundle.");
    } else {
      intelligence.highlights.forEach((hl: CanonicalHighlight, idx: number) => {
        if (!hl.highlightId) {
          errors.push(`Highlight at index ${idx} is missing a unique ID.`);
        }
        if (!hl.evidenceRefs || hl.evidenceRefs.length === 0) {
          errors.push(`Highlight '${hl.highlightId || idx}' is missing supporting evidence references.`);
        }
        if (hl.durationSeconds !== undefined && hl.durationSeconds < 0) {
          errors.push(`Highlight '${hl.highlightId}' has an invalid duration (${hl.durationSeconds}s).`);
        }

        // Gameplay fabrication check (Part 11)
        const lowerTitle = (hl.title || "").toLowerCase();
        const lowerDesc = (hl.editorSummary || "").toLowerCase();
        const forbiddenKeywords = ["1v4 clutch", "lmao lost his mind", "epic kill", "streamer raged"];
        forbiddenKeywords.forEach((kw) => {
          if (lowerTitle.includes(kw) || lowerDesc.includes(kw)) {
            errors.push(`Highlight '${hl.highlightId}' contains forbidden unverified narrative keyword: '${kw}'.`);
          }
        });
      });
    }

    // 2. Timeline validation
    if (!intelligence.timeline || !intelligence.timeline.events || intelligence.timeline.events.length === 0) {
      errors.push("Session timeline must contain at least one verified event.");
    } else {
      intelligence.timeline.events.forEach((event: BroadcastTimelineEvent, idx: number) => {
        if (!event.timestamp || !event.title) {
          errors.push(`Timeline event at index ${idx} is missing timestamp or title.`);
        }
      });
    }

    // 3. Publishing strategy matches canonical highlights
    if (intelligence.publishing?.assets) {
      intelligence.publishing.assets.forEach((pubHl: any, idx: number) => {
        const canonicalMatch = intelligence.highlights?.find((h: CanonicalHighlight) => h.highlightId === pubHl.highlightId);
        if (!canonicalMatch) {
          errors.push(`Publishing strategy reference highlight '${pubHl.highlightId}' which does not exist in the canonical highlights.`);
        }
      });
    }

    // 4. Editor briefings are populated (Part 11)
    if (!intelligence.publishing?.executiveBrief?.summaryText) {
      errors.push("Senior Editor Executive Brief summary text is empty or missing.");
    }

    // 5. Recommendations cite evidence
    if (intelligence.recommendations) {
      intelligence.recommendations.forEach((rec: any, idx: number) => {
        if (!rec.evidenceIds || rec.evidenceIds.length === 0) {
          errors.push(`Report recommendation at index ${idx} fails to cite supporting evidence.`);
        }
      });
    }

    if (errors.length > 0) {
      throw new Error(`[ValidationSuite] Intelligence validation FAILED:\n${errors.map((e) => ` - ${e}`).join("\n")}`);
    }

    console.log(`[ValidationSuite] ✓ Canonical Session Intelligence successfully validated for session: ${intelligence.sessionId}`);
  }
}

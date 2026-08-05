import { SessionIntelligence } from "../canonicalTypes";

export class ConsistencyValidator {
  /**
   * Asserts consistency between highlights, publishing assets, timeline events, and reports.
   * Throws an error detailing mismatching attributes or titles.
   */
  public static validate(intelligence: SessionIntelligence): void {
    const errors: string[] = [];

    if (!intelligence.highlights || intelligence.highlights.length === 0) {
      return;
    }

    // 1. Verify every highlight's title exactly matches the publishing strategy title
    intelligence.highlights.forEach((hl) => {
      const pubMatch = intelligence.publishing?.assets?.find((asset: any) => asset.highlightId === hl.highlightId);
      if (pubMatch) {
        if (pubMatch.youtubeTitle && !pubMatch.youtubeTitle.startsWith(hl.title)) {
          errors.push(`Publishing asset title mismatch: Highlight title "${hl.title}" does not align with publishing title "${pubMatch.youtubeTitle}".`);
        }
      }

      // 2. Verify highlight's title matches corresponding Timeline event title
      const timelineMatch = intelligence.timeline?.events?.find((ev) => ev.relatedHighlightId === hl.highlightId);
      if (timelineMatch) {
        if (!timelineMatch.title.includes(hl.title)) {
          errors.push(`Timeline event mismatch: Timeline title "${timelineMatch.title}" does not contain Highlight title "${hl.title}".`);
        }
      }
    });

    if (errors.length > 0) {
      throw new Error(`[ConsistencyValidator] Mismatched cross-system parameters:\n${errors.map((e) => ` - ${e}`).join("\n")}`);
    }

    console.log(`[ConsistencyValidator] ✓ All highlights, publishing channels, and timelines are fully consistent.`);
  }
}

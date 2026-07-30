import { CoachRecommendation } from "./types";

export class RecommendationDeduplicator {
  /**
   * Merges recommendations with similar intent into a single recommendation with highest calibrated confidence.
   */
  public static deduplicate(recommendations: CoachRecommendation[]): {
    deduplicated: CoachRecommendation[];
    duplicatesRemovedCount: number;
  } {
    const groups = new Map<string, CoachRecommendation[]>();

    for (const rec of recommendations) {
      const key = rec.intentKey || this.extractIntentKey(rec.title);
      if (!groups.has(key)) {
        groups.set(key, []);
      }
      groups.get(key)!.push(rec);
    }

    const deduplicated: CoachRecommendation[] = [];
    let duplicatesRemovedCount = 0;

    for (const [intentKey, group] of groups.entries()) {
      if (group.length === 1) {
        deduplicated.push(group[0]);
      } else {
        duplicatesRemovedCount += group.length - 1;
        // Sort by confidence descending
        group.sort((a, b) => b.confidence - a.confidence);
        const primary = { ...group[0] };

        // Merge evidence lists from redundant versions
        const mergedEvidenceMap = new Map();
        for (const item of group) {
          for (const ev of item.evidenceList || []) {
            mergedEvidenceMap.set(ev.id, ev);
          }
        }
        primary.evidenceList = Array.from(mergedEvidenceMap.values());
        primary.intentKey = intentKey;
        deduplicated.push(primary);
      }
    }

    return { deduplicated, duplicatesRemovedCount };
  }

  public static extractIntentKey(title: string): string {
    const lower = title.toLowerCase();
    if (lower.includes("q&a") || lower.includes("question") || lower.includes("answer")) {
      return "INTENT_QA_PAUSE";
    }
    if (lower.includes("chat") || lower.includes("velocity") || lower.includes("open-ended")) {
      return "INTENT_CHAT_QUESTION";
    }
    if (lower.includes("clip") || lower.includes("hype") || lower.includes("moment")) {
      return "INTENT_CLIP_MOMENT";
    }
    if (lower.includes("narrate") || lower.includes("pacing") || lower.includes("commentary")) {
      return "INTENT_NARRATION";
    }
    return `INTENT_${lower.replace(/[^a-z0-9]/g, "_").toUpperCase()}`;
  }
}

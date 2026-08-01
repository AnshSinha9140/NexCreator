import { CreatorMissionData } from "./types";

/**
 * Contradiction Engine
 * Analyzes gaps between intent and action.
 */
export class ContradictionEngine {
  static getContradictionsSummary(data: CreatorMissionData) {
    const active = data.contradictions.filter(c => c.status === "Still True" || c.status === "Needs Attention");
    return {
      activeCount: active.length,
      active,
      primaryFocus: active[0] || null
    };
  }
}

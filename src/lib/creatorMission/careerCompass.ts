import { CreatorMissionData } from "./types";
import { CreatorKnowledgeGraph } from "../creatorKnowledge/types";

/**
 * Career Compass Advice Engine
 * Evaluates default tips against mission, contradictions, and decision values.
 */
export class CareerCompass {
  static getCoachingCompassAdvice(
    missionData: CreatorMissionData | null,
    knowledgeGraph: CreatorKnowledgeGraph | null,
    defaultTip: string
  ): string {
    if (!missionData) return defaultTip;

    // Consult mission statement
    const prefersCommunity = missionData.decisionFramework.priorities.includes("Community");
    
    // Check contradictions
    const activeContradiction = missionData.contradictions.find(c => c.status === "Still True");

    if (defaultTip.toLowerCase().includes("stream shorter")) {
      return `You've told me your mission is: "${missionData.mission.statement}". Instead of generic shorter streams, let's preserve one long weekly community stream while making the others highly structured.`;
    }

    if (activeContradiction) {
      if (activeContradiction.id === "contra_1" && defaultTip.toLowerCase().includes("chat")) {
        return `Observation: ${activeContradiction.description} Let's address this gap directly in your pacing.`;
      }
    }

    return defaultTip;
  }
}

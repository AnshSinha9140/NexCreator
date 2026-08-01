import { CreatorKnowledgeGraph } from "./types";

/**
 * Relationship Insights
 * Generates personalized advice by checking values, fears, and conflicts first.
 */
export class RelationshipInsights {
  static getCoachingAdvice(graph: CreatorKnowledgeGraph, defaultTip: string): string {
    // Consult values
    const prefersCommunity = graph.creatorValues.values.some(v => v.value === "Community");
    
    // Check conflicts
    const activeConflicts = graph.creativeConflicts.filter(c => c.status === "Active");

    if (defaultTip.toLowerCase().includes("stream shorter") && prefersCommunity) {
      return "I would keep the long streams occasionally because they matter deeply to your community connection. However, let's structure them into clearer chapters to retain pacing.";
    }

    if (activeConflicts.length > 0) {
      return `Priority: ${activeConflicts[0].managerPriority} (Addressing divergence between technical focus and personality).`;
    }

    return defaultTip;
  }
}

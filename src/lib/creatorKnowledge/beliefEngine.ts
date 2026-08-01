import { CreatorKnowledgeGraph } from "./types";

/**
 * Belief Engine
 * Evaluates creator and AI belief divergence.
 */
export class BeliefEngine {
  static getBeliefDivergence(graph: CreatorKnowledgeGraph) {
    const creator = graph.audienceBeliefs.creatorBelief;
    const ai = graph.audienceBeliefs.aiBelief;
    const isDivergent = creator !== ai;

    return {
      isDivergent,
      creatorPerspective: creator,
      aiPerspective: ai,
      confidence: graph.audienceBeliefs.confidence,
      reconciliationAdvice: isDivergent
        ? "Run a short 10-minute conversational check-in to test if viewers respond more to gameplay or host dialogue."
        : "Audience understanding is fully aligned. Leverage personality anchors."
    };
  }
}

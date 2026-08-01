import { CreatorKnowledgeGraph } from "./types";

/**
 * Confidence Engine
 * Computes and updates confidence scores based on validation history.
 */
export class ConfidenceEngine {
  static calculateValidationScore(graph: CreatorKnowledgeGraph): number {
    const totalHypotheses = graph.managerHypotheses.length;
    if (totalHypotheses === 0) return 100;

    const confirmed = graph.managerHypotheses.filter(h => h.status === "Confirmed").length;
    return Math.round((confirmed / totalHypotheses) * 100);
  }
}

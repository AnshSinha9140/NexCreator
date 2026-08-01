import { CreatorKnowledgeGraph } from "./types";

/**
 * Growth Evolution Engine
 * Tracks career evolution checkpoints (e.g. Month 1, Month 3, Month 6).
 */
export class GrowthEvolution {
  static getEvolutionMilestones(graph: CreatorKnowledgeGraph) {
    const history = graph.evolutionHistory || [];
    return [
      {
        month: 1,
        title: "Initial Alignment Setup",
        description: "Merged Deep Research with direct onboarding reflections.",
        date: graph.evidenceTimeline[0]?.timestamp || new Date().toISOString()
      },
      ...history.map((h, idx) => ({
        month: idx + 2,
        title: `Observation Milestone: ${h.field}`,
        description: h.reason,
        date: h.timestamp
      }))
    ];
  }
}

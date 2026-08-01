import { CreatorKnowledgeGraph, EvolutionEvent, EvidenceSource } from "./types";
import { saveKnowledgeGraph } from "./knowledgeGraph";

/**
 * Updates the knowledge graph with a new observation / live stream event.
 */
export async function registerKnowledgeObservation(
  graph: CreatorKnowledgeGraph,
  update: {
    field: string;
    newValue: any;
    reason: string;
    origin: string;
    details: string;
  }
): Promise<CreatorKnowledgeGraph> {
  const now = new Date().toISOString();
  
  const evidence: EvidenceSource = {
    origin: update.origin,
    timestamp: now,
    details: update.details
  };

  const oldVal = (graph as any)[update.field];

  const evolution: EvolutionEvent = {
    timestamp: now,
    field: update.field,
    oldValue: oldVal,
    newValue: update.newValue,
    reason: update.reason,
    evidence: [update.origin]
  };

  // Mutate graph fields
  (graph as any)[update.field] = update.newValue;
  graph.evolutionHistory.push(evolution);
  graph.evidenceTimeline.push(evidence);
  graph.updatedAt = now;

  await saveKnowledgeGraph(graph);
  return graph;
}

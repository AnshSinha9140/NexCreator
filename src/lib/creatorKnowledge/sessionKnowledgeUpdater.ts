import { SessionIntelligence } from "@/lib/intelligence/canonicalTypes";
import { getKnowledgeGraph, saveKnowledgeGraph } from "./knowledgeGraph";

/** Appends verified-session provenance to the graph without replacing existing beliefs. */
export async function updateKnowledgeGraphFromVerifiedSession(creatorId: string, session: SessionIntelligence): Promise<void> {
  const graph = await getKnowledgeGraph(creatorId);
  const reliability = session.sessionReliability?.overallReliability ?? 0;
  if (!graph || !session.evidenceGraph || reliability < 40) return;
  const marker = `session:${session.sessionId}`;
  if (graph.evolutionHistory.some((event) => event.field === marker)) return;
  const now = new Date().toISOString();
  const evidence = session.evidenceGraph.evidence.map((item) => ({
    origin: "Verified Session Intelligence",
    timestamp: item.isoTimestamp,
    details: item.description,
  }));
  graph.evidenceTimeline = [...graph.evidenceTimeline, ...evidence].slice(-200);
  graph.evolutionHistory = [...graph.evolutionHistory, {
    timestamp: now,
    field: marker,
    oldValue: null,
    newValue: { sessionId: session.sessionId, reliability },
    reason: "Canonical evidence validation completed for this monitoring session.",
    evidence: session.evidenceGraph.evidence.map((item) => item.id),
  }].slice(-100);
  await saveKnowledgeGraph(graph);
}

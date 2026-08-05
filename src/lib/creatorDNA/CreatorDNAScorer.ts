import { SessionIntelligence } from "@/lib/intelligence/canonicalTypes";
import { CreatorDNAEvidence } from "./CreatorDNATypes";

export interface DNASessionSignals {
  evidence: CreatorDNAEvidence[];
  interactionEvidence: number;
  pacingEvidence: number;
  energyEvidence: number;
  communityEvidence: number;
}

/** Converts only validated canonical evidence into DNA-safe observations. */
export function scoreSessionForDNA(session: SessionIntelligence): DNASessionSignals | null {
  const reliability = session.sessionReliability?.overallReliability ?? 0;
  const graph = session.evidenceGraph;
  if (!graph || reliability < 40) return null;

  const validated = graph.evidence.filter((item) => item.confidence >= 50);
  if (validated.length === 0) return null;

  const evidence = validated.map((item) => ({
    sessionId: session.sessionId,
    source: "verified_session" as const,
    observedAt: item.isoTimestamp,
    detail: item.description,
    confidence: Math.min(item.confidence, reliability),
    evidenceIds: [item.id],
  }));
  const count = (types: string[]) => validated.filter((item) => types.includes(item.type)).length;

  return {
    evidence,
    interactionEvidence: count(["QUESTION_WAVE", "CONVERSATION_BURST"]),
    pacingEvidence: count(["MOMENTUM_SHIFT", "SILENCE", "AUDIENCE_EXIT"]),
    energyEvidence: count(["REACTION_BURST", "SENTIMENT_SHIFT", "CHAT_EXPLOSION"]),
    communityEvidence: count(["CONVERSATION_BURST", "AUDIENCE_ARRIVAL", "QUESTION_WAVE"]),
  };
}

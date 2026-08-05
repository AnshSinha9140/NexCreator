import { SessionIntelligence } from "@/lib/intelligence/canonicalTypes";

export function calculateMissionAlignment(session: SessionIntelligence): { score: number; helped: string[]; slowed: string[]; evidenceIds: string[] } {
  const evidence = session.evidenceGraph?.evidence ?? [];
  const helpful = evidence.filter((item) => ["CHAT_EXPLOSION", "CONVERSATION_BURST", "VIEWER_SPIKE", "SENTIMENT_SHIFT"].includes(item.type));
  const slowing = evidence.filter((item) => ["SILENCE", "AUDIENCE_EXIT"].includes(item.type));
  const reliability = session.sessionReliability?.overallReliability ?? 0;
  const score = Math.max(0, Math.min(100, Math.round(reliability + helpful.length * 4 - slowing.length * 5)));
  return {
    score,
    helped: helpful.map((item) => item.description),
    slowed: slowing.map((item) => item.description),
    evidenceIds: evidence.map((item) => item.id),
  };
}

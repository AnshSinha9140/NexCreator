import { CreatorDNAEvidence } from "./CreatorDNATypes";

export function calculateDNAConfidence(evidence: CreatorDNAEvidence[], creatorFeedback = 0): number {
  if (evidence.length === 0) return 0;
  const evidenceWeight = evidence.reduce((total, item) => total + item.confidence, 0) / evidence.length;
  const sourceDiversity = new Set(evidence.map((item) => item.source)).size * 3;
  return Math.max(0, Math.min(100, Math.round(evidenceWeight + sourceDiversity + creatorFeedback)));
}

export function appendEvidence<T extends { supportingEvidence?: CreatorDNAEvidence[]; evidence?: CreatorDNAEvidence[] }>(
  target: T,
  evidence: CreatorDNAEvidence,
  maxItems = 12,
): T {
  const key = "supportingEvidence" in target ? "supportingEvidence" : "evidence";
  const current = target[key] ?? [];
  return { ...target, [key]: [...current, evidence].slice(-maxItems) } as T;
}

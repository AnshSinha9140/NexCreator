import { SessionIntelligence } from "@/lib/intelligence/canonicalTypes";

export function deriveMissionStrategy(session: SessionIntelligence) {
  const experiments = session.actionPlan.slice(0, 3).map((item) => ({
    id: item.id,
    title: item.title,
    rationale: item.rationale,
    evidenceIds: item.evidenceIds ?? [],
    confidence: session.confidence.overallConfidence,
  }));
  const risks = session.executiveSummary.missedOpportunities.slice(0, 3).map((item, index) => ({
    id: `${session.sessionId}-risk-${index}`,
    title: item.title,
    severity: "medium" as const,
    confidence: session.confidence.overallConfidence,
    recommendation: item.recommendation || session.coaching.nextAdvice.recommendation,
    evidenceIds: session.evidenceGraph?.evidence.map((evidence) => evidence.id) ?? [],
  }));
  const opportunities = session.executiveSummary.biggestWins.slice(0, 3).map((item, index) => ({
    id: `${session.sessionId}-opportunity-${index}`,
    title: item.title,
    expectedImpact: "medium" as const,
    confidence: session.confidence.overallConfidence,
    reason: item.explanation,
    evidenceIds: item.relatedEvidenceIds ?? session.evidenceGraph?.evidence.map((evidence) => evidence.id) ?? [],
  }));
  return { experiments, risks, opportunities };
}

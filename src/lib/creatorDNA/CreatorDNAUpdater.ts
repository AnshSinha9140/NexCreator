import { SessionIntelligence } from "@/lib/intelligence/canonicalTypes";
import { calculateDNAConfidence } from "./CreatorDNAConfidence";
import { CreatorDNA, CreatorDNAEvidence, CreatorDNAEvolutionEvent, CreatorDNAFeedback } from "./CreatorDNATypes";
import { scoreSessionForDNA } from "./CreatorDNAScorer";

const cap = (value: number) => Math.max(0, Math.min(100, Math.round(value)));

function averageConfidence(evidence: CreatorDNAEvidence[]): number {
  return evidence.length ? Math.round(evidence.reduce((total, item) => total + item.confidence, 0) / evidence.length) : 0;
}

function updateSkill(skill: CreatorDNA["naturalStrengths"][number], delta: number, evidence: CreatorDNAEvidence[]): typeof skill {
  const nextEvidence = [...skill.evidence, ...evidence].slice(-12);
  return { ...skill, score: cap(skill.score + delta), confidence: calculateDNAConfidence(nextEvidence), trend: delta > 0 ? "improving" : "steady", evidence: nextEvidence };
}

export function evolveCreatorDNAFromSession(dna: CreatorDNA, session: SessionIntelligence): CreatorDNA {
  if (dna.evolution.some((event) => event.id === `${session.sessionId}:dna`)) return dna;
  const signals = scoreSessionForDNA(session);
  if (!signals) return dna;

  const evidence = signals.evidence;
  const sessionHours = Math.max(0, session.session.durationMinutes) / 60;
  const evidenceCount = evidence.length;
  const sessionConfidence = averageConfidence(evidence);
  const bump = (value: number, count: number) => cap(value + Math.min(10, count * 2));
  const evolveScalar = (field: keyof CreatorDNA["personality"], count: number) => ({
    ...dna.personality[field],
    value: bump(dna.personality[field].value, count),
    confidence: calculateDNAConfidence([...dna.personality[field].supportingEvidence, ...evidence]),
    observationCount: dna.personality[field].observationCount + count,
    supportingEvidence: [...dna.personality[field].supportingEvidence, ...evidence].slice(-12),
    lastUpdated: new Date().toISOString(),
  });

  const strengthTerms = signals.interactionEvidence ? /interaction|community|conversation|chat/i : signals.pacingEvidence ? /pacing|retention|structure/i : /energy|reaction|humor/i;
  const skillDelta = signals.interactionEvidence + signals.communityEvidence + signals.energyEvidence - signals.pacingEvidence;
  const naturalStrengths = dna.naturalStrengths.map((skill) => strengthTerms.test(skill.name) ? updateSkill(skill, skillDelta, evidence) : skill);
  const developingAreas = dna.developingAreas.map((skill) => /pacing|retention/i.test(skill.name) && signals.pacingEvidence > 0 ? updateSkill(skill, -signals.pacingEvidence, evidence) : skill);
  const event: CreatorDNAEvolutionEvent = {
    id: `${session.sessionId}:dna`,
    timestamp: new Date().toISOString(),
    field: "Session intelligence",
    previousBelief: `${dna.observedStreams} verified stream observations`,
    currentBelief: `${dna.observedStreams + 1} verified stream observations`,
    evidence,
    confidence: sessionConfidence,
  };

  return {
    ...dna,
    version: dna.version + 1,
    observedStreams: dna.observedStreams + 1,
    hoursWatched: Math.round((dna.hoursWatched + sessionHours) * 100) / 100,
    messagesAnalyzed: dna.messagesAnalyzed + session.telemetry.totalMessages,
    personality: {
      ...dna.personality,
      interactionStyle: evolveScalar("interactionStyle", signals.interactionEvidence),
      energyLevel: evolveScalar("energyLevel", signals.energyEvidence),
      creativeStyle: evolveScalar("creativeStyle", signals.communityEvidence),
      decisionMakingStyle: evolveScalar("decisionMakingStyle", signals.pacingEvidence),
    },
    naturalStrengths,
    developingAreas,
    evolution: [...dna.evolution, event].slice(-100),
    updatedAt: new Date().toISOString(),
  };
}

export function applyCreatorFeedback(dna: CreatorDNA, feedback: CreatorDNAFeedback): CreatorDNA {
  const adjustment = feedback.response === "agree" ? 5 : feedback.response === "disagree" ? -15 : -5;
  const next = { ...dna, feedback: [...dna.feedback, feedback].slice(-100) };

  const field = feedback.field;

  if (field === "uniqueCreatorAdvantage") {
    next.uniqueCreatorAdvantage = { ...next.uniqueCreatorAdvantage, confidence: cap(next.uniqueCreatorAdvantage.confidence + adjustment) };
  } else if (field === "audienceRelationship") {
    next.audienceRelationship = { ...next.audienceRelationship, confidence: cap(next.audienceRelationship.confidence + adjustment) };
  } else if (field.startsWith("identity.")) {
    const subKey = field.split(".")[1] as keyof CreatorDNA["identity"];
    if (next.identity[subKey]) {
      next.identity[subKey] = {
        ...next.identity[subKey],
        confidence: cap(next.identity[subKey].confidence + adjustment),
      };
    }
  } else if (field.startsWith("personality.")) {
    const subKey = field.split(".")[1] as keyof CreatorDNA["personality"];
    if (next.personality[subKey]) {
      next.personality[subKey] = {
        ...next.personality[subKey],
        confidence: cap(next.personality[subKey].confidence + adjustment),
      };
    }
  } else if (field.startsWith("contentPillars.")) {
    const pillarName = field.split(".")[1];
    next.contentPillars = next.contentPillars.map((p) =>
      p.name === pillarName ? { ...p, confidence: cap(p.confidence + adjustment) } : p
    );
  } else if (field.startsWith("naturalStrengths.")) {
    const strengthName = field.split(".")[1];
    next.naturalStrengths = next.naturalStrengths.map((s) =>
      s.name === strengthName ? { ...s, confidence: cap(s.confidence + adjustment) } : s
    );
  } else if (field.startsWith("developingAreas.")) {
    const areaName = field.split(".")[1];
    next.developingAreas = next.developingAreas.map((s) =>
      s.name === areaName ? { ...s, confidence: cap(s.confidence + adjustment) } : s
    );
  }

  return next;
}


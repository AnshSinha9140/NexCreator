import { CreatorIntelligenceAudit } from "../creatorAudit/types";
import { CreatorKnowledgeGraph, EvidenceSource } from "./types";

/**
 * Builds the initial CreatorKnowledgeGraph from Deep Research Audit + Alignment Answers.
 */
export function buildInitialKnowledgeGraph(
  creatorId: string,
  audit: CreatorIntelligenceAudit,
  alignmentAnswers: any
): CreatorKnowledgeGraph {
  const now = new Date().toISOString();
  const researchEvidence: EvidenceSource = {
    origin: "Deep Research",
    timestamp: audit.generatedAt || now,
    details: "Imported from Deep Research Audit data."
  };
  const alignmentEvidence: EvidenceSource = {
    origin: "Alignment Session",
    timestamp: now,
    details: "Inferred from creator's replies in the Alignment Session."
  };

  const reflection = alignmentAnswers?.reflectionAnswers || {};
  const hypothesesAnswers = alignmentAnswers?.hypothesesAnswers || {};

  // Infer Primary and Secondary Identity
  const primaryIdentity = audit.creatorIdentity?.coreStyle || "Engaging Broadcaster";
  const secondaryIdentity = audit.creatorIdentity?.category || "Content Creator";
  const hiddenIdentity = reflection["2"] // "What do viewers misunderstand about you?"
    ? `Wants to be seen as: ${reflection["2"]}`
    : "Seeks recognition as a high-value storyteller.";

  // Infer Motivations
  const primaryMotivation = reflection["4"]?.toLowerCase().includes("yes") ? "Creative Freedom" : "Community";
  const secondaryMotivation = reflection["5"] // "Why do they love you?"
    ? "Legacy & Audience Connection"
    : "Recognition";

  // Infer Fears and Hidden Fears
  const fears = [
    {
      fear: reflection["3"] || "Losing connection with viewers",
      hiddenFear: "Losing identity as the main attraction or becoming irrelevant.",
      confidence: 85,
      evidence: [alignmentEvidence]
    }
  ];

  // Under the hood mapping for values
  const values = [
    { value: "Community", confidence: 90, evidence: [researchEvidence] },
    { value: "Authenticity", confidence: 85, evidence: [alignmentEvidence] }
  ];

  // Hypotheses
  const managerHypotheses = Object.keys(hypothesesAnswers).map((key, idx) => {
    const ans = hypothesesAnswers[key];
    return {
      id: `hyp_${idx + 1}`,
      belief: `Hypothesis ${idx + 1} regarding creator content focus.`,
      confidence: ans.response === "Very Accurate" ? 95 : ans.response === "Mostly" ? 80 : 40,
      evidence: ["Alignment Session Response"],
      creatorAgreement: (ans.response === "Very Accurate" || ans.response === "Mostly" ? "Confirmed" : "Rejected") as any,
      futureValidation: "Analyze stream engagement patterns over next 5 live broadcasts.",
      status: (ans.response === "Very Accurate" || ans.response === "Mostly" ? "Confirmed" : "Rejected") as any
    };
  });

  return {
    creatorId,
    version: "1.0",
    updatedAt: now,
    creatorIdentity: {
      primaryIdentity,
      secondaryIdentity,
      hiddenIdentity,
      confidence: 90,
      evidence: [researchEvidence, alignmentEvidence]
    },
    creatorMotivations: {
      primaryMotivation,
      secondaryMotivation,
      confidence: 85,
      evidence: [alignmentEvidence]
    },
    creatorValues: {
      values
    },
    creatorFears: {
      fears
    },
    creativeEnergy: {
      feelsAliveWhen: [reflection["7"] || "Connecting directly with chat in conversation sessions"],
      evidence: [alignmentEvidence]
    },
    successDefinition: {
      definition: reflection["0"] || "Building long-term meaningful memories with community",
      confidence: 90,
      evidence: [alignmentEvidence]
    },
    audienceBeliefs: {
      creatorBelief: alignmentAnswers?.challengeAnswer === "skill" ? "Audience stays for technical skill" : "Audience stays for community & vibes",
      aiBelief: "Audience stays for personality and direct human connection",
      confidence: 88,
      evidence: [researchEvidence, alignmentEvidence]
    },
    blindSpots: {
      blindSpots: [
        alignmentAnswers?.challengeAnswer === "skill"
          ? "Underestimating the power of personality over raw gameplay"
          : "Failing to segment high-pace gaming vs chat interaction chapters"
      ],
      evidence: [researchEvidence]
    },
    creativeConflicts: [
      {
        conflict: "Desire to show high skill vs viewers wanting conversational personality.",
        managerPriority: "Guide content pacing to block out dedicated chat segments.",
        status: "Active"
      }
    ],
    growthPriorities: [
      "Transition towards primary storyteller",
      "Structure broadcast pacing into distinct chapters",
      "Develop unique community-driven formats"
    ],
    sensitiveTopics: [
      "Imposter syndrome during viewer count fluctuations",
      "Fear of becoming a side character"
    ],
    communicationStyle: "Thoughtful, collaborative, and evidence-first",
    decisionStyle: "Value-centric and community-protective",
    coachingStyle: "Empathetic challenge & structured roadmapping",
    managerHypotheses,
    evidenceTimeline: [researchEvidence, alignmentEvidence],
    evolutionHistory: [],
    futureQuestions: [
      "How are viewers responding to our newly structured chat segments?",
      "Are you feeling more aligned as the main attraction on stream?"
    ]
  };
}

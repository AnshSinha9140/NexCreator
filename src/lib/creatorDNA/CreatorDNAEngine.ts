import { CreatorIntelligenceAudit } from "@/lib/creatorAudit/types";
import { CreatorKnowledgeGraph } from "@/lib/creatorKnowledge/types";
import { CreatorDNA, CreatorDNAEvidence, DNAAttribute } from "./CreatorDNATypes";

const attribute = <T,>(value: T, evidence: CreatorDNAEvidence, confidence = 70): DNAAttribute<T> => ({
  value,
  confidence,
  observationCount: 1,
  supportingEvidence: [evidence],
  lastUpdated: evidence.observedAt,
});

const unique = (values: string[]) => [...new Set(values.map((value) => value.trim()).filter(Boolean))];

/** Builds the one initial DNA record from verified research and creator alignment. */
export function buildInitialCreatorDNA(
  creatorId: string,
  audit: CreatorIntelligenceAudit,
  knowledgeGraph?: CreatorKnowledgeGraph | null,
): CreatorDNA {
  const now = new Date().toISOString();
  const research: CreatorDNAEvidence = {
    source: "deep_research",
    observedAt: audit.generatedAt || now,
    detail: `Verified research audit ${audit.auditId}`,
    confidence: 70,
  };
  const primary = audit.creatorIdentity?.coreStyle || audit.creatorIdentity?.category || "";
  const secondary = audit.creatorIdentity?.category || audit.creatorIdentity?.brandTone || "";
  const strengths = audit.strengthsAndWeaknesses?.strengths ?? [];
  const weaknesses = audit.strengthsAndWeaknesses?.weaknesses ?? [];
  const pillarNames = unique([audit.creatorIdentity?.category, audit.creatorIdentity?.coreStyle, ...audit.contentStrategy?.communityWishes ?? []]);
  const expectations = unique(audit.audiencePsychology?.audienceExpectations ?? []);
  const audienceRelationship = unique([audit.audiencePsychology?.communityCulture, audit.audiencePsychology?.sentimentSummary]).join(" · ");

  return {
    creatorId,
    version: 1,
    createdAt: now,
    updatedAt: now,
    observedStreams: 0,
    hoursWatched: 0,
    messagesAnalyzed: 0,
    identity: {
      primaryCreatorType: attribute(primary, research),
      secondaryCreatorType: attribute(secondary, research),
      creatorArchetype: attribute(audit.creatorIdentity?.primaryHook || "", research),
      brandPersonality: attribute(audit.creatorIdentity?.brandTone || "", research),
      communicationStyle: attribute(knowledgeGraph?.communicationStyle || "", research),
      humorStyle: attribute("", research, 0),
      storytellingStyle: attribute(audit.creatorIdentity?.coreStyle || "", research),
      editingStyle: attribute("", research, 0),
    },
    personality: {
      energyLevel: attribute(50, research, 0),
      interactionStyle: attribute(50, research, 0),
      creativeStyle: attribute(50, research, 0),
      decisionMakingStyle: attribute(50, research, 0),
      riskTolerance: attribute(50, research, 0),
    },
    contentPillars: pillarNames.map((name) => ({ name, strength: 0, confidence: 70, growth: "emerging", evidence: [research] })),
    naturalStrengths: strengths.map((item) => ({ name: item.title, score: 0, confidence: 70, trend: "developing", evidence: [research] })),
    developingAreas: weaknesses.map((item) => ({ name: item.title, score: 0, confidence: 70, trend: "developing", recommendation: item.reasoning, evidence: [research] })),
    uniqueCreatorAdvantage: attribute(unique(audit.strengthsAndWeaknesses?.uniqueAdvantages ?? []).join(" · "), research),
    audienceRelationship: attribute(audienceRelationship, research),
    viewerExpectations: attribute(expectations, research),
    contentIdentity: attribute(primary, research),
    evolution: [],
    feedback: [],
  };
}

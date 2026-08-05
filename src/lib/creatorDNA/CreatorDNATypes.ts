export type CreatorFeedbackResponse = "agree" | "disagree" | "needs_more_evidence";

export interface CreatorDNAEvidence {
  sessionId?: string;
  source: "deep_research" | "alignment" | "verified_session" | "creator_feedback";
  observedAt: string;
  detail: string;
  confidence: number;
  evidenceIds?: string[];
}

export interface DNAAttribute<T> {
  value: T;
  confidence: number;
  observationCount: number;
  supportingEvidence: CreatorDNAEvidence[];
  lastUpdated: string;
  // Explainability (Part 4)
  reason?: string;
  evidence?: string[];
}

export interface CreatorDNAPillar {
  name: string;
  strength: number;
  confidence: number;
  growth: "rising" | "steady" | "emerging";
  evidence: CreatorDNAEvidence[];
}

export interface CreatorDNASkill {
  name: string;
  score: number;
  confidence: number;
  trend: "improving" | "steady" | "developing";
  recommendation?: string;
  evidence: CreatorDNAEvidence[];
}

export interface CreatorDNAEvolutionEvent {
  id: string;
  timestamp: string;
  field: string;
  previousBelief: string;
  currentBelief: string;
  evidence: CreatorDNAEvidence[];
  confidence: number;
}

export interface CreatorDNAFeedback {
  id: string;
  field: string;
  response: CreatorFeedbackResponse;
  note?: string;
  createdAt: string;
}

export interface IdentityMetadata {
  version: number;
  generatedFrom: string[]; // ["creatorProfile", "deepResearch", "alignmentSession"]
  generatedAt: string;
  lastUpdated: string;
  generatedBy: string; // "IdentityInitializationService"
  futureVersion: number;
}

export interface DomainConfidence {
  mission: number;
  missionReason: string;
  creatorIdentity: number;
  creatorIdentityReason: string;
  audienceUnderstanding: number;
  audienceUnderstandingReason: string;
  humorStyle: number;
  humorStyleReason: string;
  editingStyle: number;
  editingStyleReason: string;
  relationshipConfidence: number;
  relationshipConfidenceReason: string;
}

export interface CreatorDNA {
  creatorId: string;
  version: number;
  createdAt: string;
  updatedAt: string;
  observedStreams: number;
  hoursWatched: number;
  messagesAnalyzed: number;
  identity: {
    primaryCreatorType: DNAAttribute<string>;
    secondaryCreatorType: DNAAttribute<string>;
    creatorArchetype: DNAAttribute<string>;
    brandPersonality: DNAAttribute<string>;
    communicationStyle: DNAAttribute<string>;
    humorStyle: DNAAttribute<string>;
    storytellingStyle: DNAAttribute<string>;
    editingStyle: DNAAttribute<string>;
  };
  personality: {
    energyLevel: DNAAttribute<number>;
    interactionStyle: DNAAttribute<number>;
    creativeStyle: DNAAttribute<number>;
    decisionMakingStyle: DNAAttribute<number>;
    riskTolerance: DNAAttribute<number>;
  };
  contentPillars: CreatorDNAPillar[];
  naturalStrengths: CreatorDNASkill[];
  developingAreas: CreatorDNASkill[];
  uniqueCreatorAdvantage: DNAAttribute<string>;
  audienceRelationship: DNAAttribute<string>;
  viewerExpectations: DNAAttribute<string[]>;
  contentIdentity: DNAAttribute<string>;
  evolution: CreatorDNAEvolutionEvent[];
  feedback: CreatorDNAFeedback[];
  metadata?: IdentityMetadata;
  domainConfidence?: DomainConfidence;
}

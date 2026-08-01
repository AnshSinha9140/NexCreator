export interface EvidenceSource {
  origin: "Alignment Session" | "Deep Research" | string;
  timestamp: string;
  details: string;
}

export interface ConfidenceScore {
  score: number; // 0 to 100
  evidenceCount: number;
  lastUpdated: string;
}

export interface ManagerHypothesis {
  id: string;
  belief: string;
  confidence: number; // 0-100
  evidence: string[];
  creatorAgreement: "Confirmed" | "Rejected" | "Still observing";
  futureValidation: string;
  status: "Confirmed" | "Rejected" | "Still observing";
}

export interface EvolutionEvent {
  timestamp: string;
  field: string;
  oldValue: any;
  newValue: any;
  reason: string;
  evidence: string[];
}

export interface CreatorKnowledgeGraph {
  creatorId: string;
  version: string;
  updatedAt: string;

  creatorIdentity: {
    primaryIdentity: string;
    secondaryIdentity: string;
    hiddenIdentity: string;
    confidence: number;
    evidence: EvidenceSource[];
  };

  creatorMotivations: {
    primaryMotivation: string;
    secondaryMotivation: string;
    confidence: number;
    evidence: EvidenceSource[];
  };

  creatorValues: {
    values: Array<{
      value: string;
      confidence: number;
      evidence: EvidenceSource[];
    }>;
  };

  creatorFears: {
    fears: Array<{
      fear: string;
      hiddenFear: string;
      confidence: number;
      evidence: EvidenceSource[];
    }>;
  };

  creativeEnergy: {
    feelsAliveWhen: string[];
    evidence: EvidenceSource[];
  };

  successDefinition: {
    definition: string;
    confidence: number;
    evidence: EvidenceSource[];
  };

  audienceBeliefs: {
    creatorBelief: string;
    aiBelief: string;
    confidence: number;
    evidence: EvidenceSource[];
  };

  blindSpots: {
    blindSpots: string[];
    evidence: EvidenceSource[];
  };

  creativeConflicts: Array<{
    conflict: string;
    managerPriority: string;
    status: "Active" | "Resolved";
  }>;

  growthPriorities: string[]; // Max 3

  sensitiveTopics: string[]; // Empathy anchors

  communicationStyle: string;
  decisionStyle: string;
  coachingStyle: string;

  managerHypotheses: ManagerHypothesis[];
  evidenceTimeline: EvidenceSource[];
  evolutionHistory: EvolutionEvent[];
  futureQuestions: string[];
}

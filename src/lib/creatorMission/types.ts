import { EvidenceSource } from "../creatorKnowledge/types";
import { IdentityMetadata, DomainConfidence } from "../creatorDNA/CreatorDNATypes";

export interface CreatorMissionData {
  creatorId: string;
  version: string;
  updatedAt: string;

  mission: {
    statement: string;
    reason: string;
    confidence: number; // 0-100
    origin: string;
    createdAt: string;
    updatedAt: string;
  };

  successDefinition: {
    creatorDefinition: string;
    aiDefinition: string;
    confidence: number;
    evidence: EvidenceSource[];
  };

  contradictions: Array<{
    id: string;
    title: string;
    description: string;
    creatorStatement: string;
    observedBehaviour: string;
    evidence: string[];
    confidence: number; // 0-100
    sensitivity: "High" | "Medium" | "Low";
    lastReviewed: string;
    status: "Still True" | "Improving" | "Resolved" | "Needs Attention" | "False Assumption";
  }>;

  decisionFramework: {
    priorities: string[]; // e.g. ["Community", "Creativity", "Entertainment"]
    tradeoffs: string[];  // e.g. ["Longer stream time vs rest", "Brand deals vs audience trust"]
    knownSacrifices: string[];
  };

  careerCompass: {
    biggestOpportunity: string;
    protectThing: string;
    longTermReminder: string;
  };

  evolutionTimeline: Array<{
    timestamp: string;
    oldMission: string;
    newMission: string;
    reasonForChange: string;
    causedBy: string;
  }>;

  vision: string;
  longTermGoal: string;
  currentGoal: string;
  currentPhase: string;
  missionProgress: number;
  missionConfidence: number;
  primaryKpi: string;
  secondaryKpi?: string;
  estimatedTimeline?: string;
  currentStrategy: {
    focus: string[];
    intentionallyIgnoring: string[];
    rationale: string;
  };
  milestones: Array<{
    id: string;
    title: string;
    status: "complete" | "current" | "upcoming";
    evidence: string[];
  }>;
  currentExperiments: Array<{
    id: string;
    title: string;
    rationale: string;
    evidenceIds: string[];
    confidence: number;
  }>;
  risks: Array<{
    id: string;
    title: string;
    severity: "low" | "medium" | "high";
    confidence: number;
    recommendation: string;
    evidenceIds: string[];
  }>;
  opportunities: Array<{
    id: string;
    title: string;
    expectedImpact: "low" | "medium" | "high";
    confidence: number;
    reason: string;
    evidenceIds: string[];
  }>;
  alignmentHistory: Array<{
    sessionId: string;
    score: number;
    helped: string[];
    slowed: string[];
    evidenceIds: string[];
    createdAt: string;
  }>;

  metadata?: IdentityMetadata;
  domainConfidence?: DomainConfidence;
}

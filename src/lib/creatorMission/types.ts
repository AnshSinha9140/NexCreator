import { EvidenceSource } from "../creatorKnowledge/types";

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
}

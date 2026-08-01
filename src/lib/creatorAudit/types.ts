/**
 * Sprint 20.0 — Creator Intelligence Audit & Relationship Foundation Types
 * Schema for CreatorManagerProfile, Master Audit Prompts, and Executive Letter.
 * Zero AI API costs. Human-in-the-loop admin workflow.
 */

export interface ExecutiveLetter {
  creatorName: string;
  opening: string;
  bodyParagraphs: string[];
  closingCommitment: string;
}

export interface CreatorIdentity {
  category: string;
  coreStyle: string;
  primaryHook: string;
  brandTone: string;
}

export interface AudiencePsychology {
  demographicsSummary: string;
  primaryMotivations: string[];
  audienceExpectations: string[];
  communityCulture: string;
  sentimentSummary: string;
}

export interface StrengthsAndWeaknesses {
  strengths: Array<{ title: string; reasoning: string }>;
  weaknesses: Array<{ title: string; reasoning: string }>;
  uniqueAdvantages: string[];
  biggestRisks: string[];
}

export interface ContentStrategyAudit {
  evolutionPastVsPresent: string;
  communityWishes: string[];
  similarCreators: string[];
  monetizationOpportunities: string[];
}

export interface GrowthRoadmap {
  ninetyDayPlan: string[];
  oneYearVision: string;
}

export interface ManagerImpression {
  firstImpression: string;
  nextConversationTopics: string[];
}

export interface CreatorIntelligenceAudit {
  auditId: string;
  creatorId: string;
  creatorName: string;
  generatedAt: string;
  executiveLetter: ExecutiveLetter;
  creatorIdentity: CreatorIdentity;
  audiencePsychology: AudiencePsychology;
  strengthsAndWeaknesses: StrengthsAndWeaknesses;
  contentStrategy: ContentStrategyAudit;
  growthRoadmap: GrowthRoadmap;
  managerImpression: ManagerImpression;
}

export type CreatorValue =
  | "Community"
  | "Entertainment"
  | "Competition"
  | "Education"
  | "Creativity"
  | "Business"
  | "Family Friendly";

export interface CreatorMission {
  primaryGoal: string; // e.g. "I want streaming to become my career"
  personalVision: string;
  values: CreatorValue[];
  successDefinition: string;
}

export interface CreatorManagerProfile {
  creatorId: string;
  audit: CreatorIntelligenceAudit;
  mission?: CreatorMission;
  onboardingCompleted: boolean;
  onboardingCompletedAt?: string;
  createdAt: string;
  updatedAt: string;
}

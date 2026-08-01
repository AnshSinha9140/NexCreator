/**
 * Sprint 20.0 — Creator Intelligence Audit & Relationship Foundation Types
 * Sprint 20.6 — Extended with CreatorHistoryEvent, OnboardingState, HydrationDiagnostics
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

export type DeepResearchPipelineStage =
  | "research_prompt"
  | "research_imported"
  | "audit_prompt"
  | "audit_parsed"
  | "approved";

export interface CreatorResearchDocument {
  creatorId: string;
  creatorName: string;
  importedAt: string;
  rawMarkdown: string;
  evidenceSourcesCount: number;
  confidenceScore: number; // e.g. 85%
  missingSections: string[];
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

// ============================================================
// Sprint 20.6 — New Collection Types
// All documents use creatorId = users._id.toString()
// ============================================================

/**
 * creator_history collection
 * Immutable append-only audit log of key creator lifecycle events.
 */
export interface CreatorHistoryEvent {
  _id?: string;
  creatorId: string;          // users._id.toString() — ALWAYS
  eventType: string;          // e.g. "Creator Verified", "Onboarding Completed"
  timestamp: string;          // ISO 8601
  verifiedBy?: string | null;        // admin email for verification events
  researchConfidence?: number | null; // 0-100 from Evidence JSON
  auditVersion?: string;      // e.g. "20.6"
  metadata?: Record<string, unknown>;
}

/**
 * onboarding_state collection
 * Tracks the creator onboarding flow state independently of creator_profile.
 * Source of truth for whether creator has seen the onboarding experience.
 */
export interface OnboardingState {
  _id?: string;
  creatorId: string;          // users._id.toString() — ALWAYS
  completed: boolean;
  currentStep: number;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * relationship_memory collection (full shape)
 * Initialized at verification, grown over time by the AI manager.
 */
export interface RelationshipMemory {
  _id?: string;
  creatorId: string;          // users._id.toString() — ALWAYS
  firstConversationDate: string;
  growthJournal: string[];
  milestones: Array<{ title: string; date: string; notes?: string }>;
  creatorHabits: string[];
  recurringStrengths: string[];
  recurringWeaknesses: string[];
  managerNotes: string[];
  adviceHistory: Array<{ advice: string; givenAt: string; context?: string }>;
  storyTimeline: Array<{ event: string; timestamp: string }>;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Hydration diagnostics — returned when dashboard hydration is incomplete.
 * Used by GET /api/creator/hydration and GET /api/debug/verification/:creatorId
 */
export interface HydrationDiagnostics {
  hydrationReady: boolean;
  missingCollections: string[];
  creatorId: string;
  userStatus: string | null;
  collectionsFound: {
    creator_profile: boolean;
    relationship_memory: boolean;
    creator_history: boolean;
    onboarding_state: boolean;
  };
  diagnosticMessage: string;
}

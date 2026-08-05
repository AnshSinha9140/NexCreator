import { CoachRecommendation, PriorityLevel } from "../intelligence/types";

export interface CreatorSessionHistoryItem {
  sessionId: string;
  creatorId: string;
  platform: string;
  game: string;
  durationMinutes: number;
  peakViewers: number;
  averageViewers: number;
  totalMessages: number;
  avgSentiment: number;
  peakHype: number;
  peakMomentum: number;
  questionsCount: number;
  broadcastScore: number;
  broadcastGrade: string;
  primaryMood: string;
  recommendationsCount: number;
  completedRecommendationsCount: number;
  completedAt: string;
}

export interface CreatorProfile {
  creatorId: string;
  totalStreamsAnalyzed: number;
  avgDurationMinutes: number;
  avgViewerCount: number;
  avgPeakViewers: number;
  avgMessagesPerMinute: number;
  avgSentiment: number;
  avgBroadcastScore: number;
  mostStreamedGames: string[];
  bestPerformingCategory: string;
  typicalAudienceMood: string;
  commonQuestions: string[];
  commonRisks: string[];
  updatedAt: string;
}

export interface PersonalBenchmarks {
  viewersDeltaPct: number; // e.g. +14
  messagesDeltaPct: number; // e.g. +22
  engagementDeltaPct: number; // e.g. +17
  scoreDelta: number; // e.g. +9
  clipOpportunitiesDelta: number; // e.g. +3
  comparisonSummary: string;
}

export interface PatternDetection {
  id: string;
  patternText: string;
  confidence: number;
  supportingSessionsCount: number;
  category: "engagement" | "duration" | "gameplay" | "pacing";
  evidenceDescription: string;
  createdAt: string;
}

export interface PlaybookStrength {
  title: string;
  stars: number; // 1-5
  explanation: string;
}

export interface CreatorPlaybook {
  creatorId: string;
  strengths: PlaybookStrength[];
  weaknesses: string[];
  recommendedPlaybookActions: string[];
  updatedAt: string;
}

export interface PrimaryManagerDecision {
  recommendation: CoachRecommendation;
  urgencyScore: number;
  expectedImpactScore: number;
  historicalSuccessRate: number;
  decisionScore: number;
  rationale: string;
  comparedToBaselineText: string;
}

// ---------------------------------------------------------------------------
// Sprint 24.5 — Longitudinal Creator Skill Memory
// ---------------------------------------------------------------------------

export type CreatorSkillName =
  | "humor"
  | "conversation"
  | "energy"
  | "pacing"
  | "storytelling"
  | "audienceInteraction"
  | "communityBuilding"
  | "retention"
  | "consistency";

export interface CreatorSkillEntry {
  sessionId: string;
  value: number;       // 0-100
  recordedAt: string;  // ISO timestamp
}

export interface CreatorSkillDimension {
  skillName: CreatorSkillName;
  current: number;
  history: CreatorSkillEntry[]; // append-only, capped at 30
  trend: "IMPROVING" | "STABLE" | "DECLINING" | "INSUFFICIENT_DATA";
  lastUpdated: string;
}

export interface CreatorSkillProfile {
  creatorId: string;
  skills: { [K in CreatorSkillName]: CreatorSkillDimension };
  streamsAnalyzed: number;
  lastUpdated: string;
}

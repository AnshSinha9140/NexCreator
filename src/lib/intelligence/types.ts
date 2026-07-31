import { IntelligenceEvidence } from "./evidence";
import {
  PrimaryManagerDecision,
  PersonalBenchmarks,
  PatternDetection,
  CreatorPlaybook,
  CreatorProfile,
} from "../memory/types";

export type MoodType =
  | "Excited"
  | "Curious"
  | "Hyped"
  | "Relaxed"
  | "Waiting"
  | "Confused"
  | "Frustrated"
  | "Bored"
  | "Toxic";

export type TrendDirection = "rising" | "falling" | "stable";
export type PriorityLevel = "critical" | "high" | "medium" | "low";
export type RiskSeverity = "critical" | "high" | "medium" | "low";

export type RecommendationLifecycleStatus =
  | "NEW"
  | "ACTIVE"
  | "ACKNOWLEDGED"
  | "COMPLETED"
  | "EXPIRED"
  | "SUPERSEDED";

export interface CoachRecommendation {
  id: string;
  sessionId: string;
  snapshotId: string;
  intentKey: string;
  title: string;
  observation: string;
  evidenceList: IntelligenceEvidence[];
  reasoning: string;
  recommendation: string;
  description: string;
  evidence: string;
  expectedImpact: string;
  estimatedEffort?: string;
  priority: PriorityLevel;
  confidence: number; // Calibrated score 0-100
  rawConfidence?: number;
  qualityScore?: number; // Quality engine score 0-100
  status: RecommendationLifecycleStatus;
  actionType: string;
  createdAt: string;
  updatedAt?: string;
  expiresAt?: string;
  completedAt?: string;
  outcome?: "successful" | "unsuccessful" | "pending";
}

export interface MoodTransition {
  timestamp: string;
  snapshotId: string;
  fromMood: MoodType;
  toMood: MoodType;
  reason: string;
  confidence: number;
}

export interface AudienceMood {
  sessionId: string;
  snapshotId: string;
  primaryMood: MoodType;
  confidence: number; // 0-100
  evidence: string;
  explanation: string;
  contributingAnalytics: {
    sentimentScore: number;
    hypeScore: number;
    momentumIndex: number;
    questionCount: number;
  };
  moodTimeline?: MoodTransition[];
  createdAt: string;
}

export interface TopicCluster {
  topic: string;
  percentage: number;
  messageCount: number;
  trend: TrendDirection;
  representativeMessages: string[];
}

export interface TopicDetectionDoc {
  sessionId: string;
  snapshotId: string;
  topics: TopicCluster[];
  createdAt: string;
}

export type OpportunityCategory =
  | "clutch_gameplay"
  | "funny_reaction"
  | "question_surge"
  | "sub_celebration"
  | "viewer_spike"
  | "meme_moment"
  | "unexpected_event"
  | "perfect_callout"
  | "victory_moment"
  | "emotional_moment"
  | "viewer_growth"
  | "gameplay_highlight";

export interface OpportunityItem {
  id: string;
  sessionId: string;
  snapshotId: string;
  category: OpportunityCategory;
  categoryLabel: string;
  timestamp: string; // e.g. "14:22"
  clipWindow: {
    startTime: string; // e.g. "14:18"
    endTime: string; // e.g. "14:58"
    durationSeconds: number; // e.g. 40
  };
  title: string;
  dynamicTitle: string;
  reason: string;
  whyDetected: string[];
  recommendedAction: string;
  expectedBenefit: string;
  priority: PriorityLevel;
  confidence: number;
  confidenceLabel?: "Very High" | "High" | "Medium";
  confidenceJustification?: string[];
  scores: {
    virality: number; // 0-100
    entertainment: number; // 0-100
    communityImpact: number; // 0-100
    replayValue: number; // 0-100
    overallAiScore: number; // 0-100
  };
  bestPlatform: "TikTok" | "YouTube Shorts" | "Instagram Reels";
  recommendedNextStep: string;
  rankTag?: "Top Opportunity" | "Runner Up" | "Additional Opportunity";
  urgencyScore?: number;
  expectedImpactScore?: number;
  rankScore?: number;
  supportingEvidence?: IntelligenceEvidence[];
  createdAt: string;
}


export interface RiskItem {
  id: string;
  sessionId: string;
  snapshotId: string;
  title: string;
  cause: string;
  mitigationRecommendation: string;
  severity: RiskSeverity;
  confidence: number;
  probabilityScore?: number;
  impactScore?: number;
  recoveryDifficultyScore?: number;
  rankScore?: number;
  rootCause?: string;
  resolutionStatus?: "detected" | "recovering" | "resolved";
  supportingEvidence?: IntelligenceEvidence[];
  createdAt: string;
}

export interface CategoryScoreExplanation {
  score: number;
  explanation: string;
}

export interface BroadcastScoreDoc {
  sessionId: string;
  snapshotId: string;
  overallScore: number; // 0-100
  overallGrade: "A+" | "A" | "B+" | "B" | "C+" | "C" | "D" | "F";
  breakdown: {
    entertainment: number;
    interaction: number;
    energy: number;
    consistency: number;
    audienceHealth: number;
    responsiveness: number;
  };
  categoryExplanations?: {
    entertainment: string;
    interaction: string;
    energy: string;
    consistency: string;
    audienceHealth: string;
    responsiveness: string;
  };
  createdAt: string;
}

export type BroadcastPhase = "beginning" | "growth" | "peak" | "recovery" | "ending";

export interface SessionStoryMilestone {
  timestamp: string;
  title: string;
  narrative: string;
  snapshotId: string;
  phase?: BroadcastPhase;
  isTurningPoint?: boolean;
}

export interface SessionStoryDoc {
  sessionId: string;
  milestones: SessionStoryMilestone[];
  summaryNarrative: string;
  currentPhase?: BroadcastPhase;
  updatedAt: string;
}

export interface CreatorActionItem {
  id: string;
  sessionId: string;
  title: string;
  reason: string;
  estimatedImpact: string;
  priority: PriorityLevel;
  completed: boolean;
  createdAt: string;
}

export interface IntelligenceHealthReport {
  sessionId: string;
  freshnessScore: number; // 0-100
  evidenceCoverage: number; // 0-100 % of recs with valid evidence
  confidenceCalibrationScore: number; // 0-100
  duplicateRate: number; // % 0-100
  contradictionRate: number; // % 0-100
  narrativeCompleteness: number; // 0-100
  overallQualityScore: number; // 0-100
  evaluatedAt: string;
}

export interface DeveloperDiagnostics {
  recommendationsGenerated: number;
  recommendationsFiltered: number;
  duplicatesRemoved: number;
  recommendationsExpired: number;
  recommendationsCompleted: number;
  confidenceDistribution: {
    high: number; // >= 80
    medium: number; // 60-79
    low: number; // < 60
  };
  qualityScores: number[];
  recommendationHistory: CoachRecommendation[];
  intelligenceHealth: IntelligenceHealthReport;
}

export interface CreatorIntelligenceBundle {
  coach: CoachRecommendation[];
  historyCoach?: CoachRecommendation[];
  completedCoach?: CoachRecommendation[];
  dismissedCoach?: CoachRecommendation[];
  currentRecommendation?: CoachRecommendation | null;
  previousRecommendation?: CoachRecommendation | null;
  mood: AudienceMood | null;
  topics: TopicCluster[];
  opportunities: OpportunityItem[];
  risks: RiskItem[];
  score: BroadcastScoreDoc | null;
  story: SessionStoryDoc | null;
  actions: CreatorActionItem[];
  health?: IntelligenceHealthReport | null;
  diagnostics?: DeveloperDiagnostics | null;
  // Sprint 18.7 Memory Extensions
  primaryDecision?: PrimaryManagerDecision | null;
  personalBenchmarks?: PersonalBenchmarks | null;
  detectedPatterns?: PatternDetection[];
  creatorPlaybook?: CreatorPlaybook | null;
  creatorProfile?: CreatorProfile | null;
}



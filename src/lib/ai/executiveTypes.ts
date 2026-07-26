// Executive Report types — Sprint 15: AI Executive Producer

export type StreamGrade = "A+" | "A" | "A-" | "B+" | "B" | "B-" | "C+" | "C" | "C-" | "D" | "F";

export interface StreamScores {
  overallGrade: StreamGrade;
  overall: number;        // 0-100
  content: number;
  audience: number;
  retention: number;
  energy: number;
  interaction: number;
  consistency: number;
  communityResponse: number;
}

export interface BiggestWinItem {
  id: string;
  title: string;
  category: "best_topic" | "best_segment" | "highest_engagement" | "best_reaction" | "best_growth" | "best_conversation" | "other";
  timestamp?: string;
  confidence: number;
  explanation: string;
}

export interface MissedOpportunityItem {
  id: string;
  title: string;
  category: "ignored_questions" | "dead_air" | "engagement_drop" | "topic_change" | "viewer_exit" | "other";
  timestamp?: string;
  whatHappened: string;
  whyItMatters: string;
  recommendation: string;
}

export interface StoryMilestone {
  id: string;
  title: string;
  timestamp?: string;
  description: string;
  type: "start" | "momentum_up" | "peak" | "drop" | "recovery" | "raid" | "end" | "highlight";
  snapshotId?: string;
  insightId?: string;
}

export interface AudienceIntelligence {
  overallMood: "very_positive" | "positive" | "neutral" | "negative" | "mixed";
  moodExplanation: string;
  mostDiscussedTopics: string[];
  frequentlyAskedQuestions: string[];
  topKeywords: string[];
  positiveMoments: string[];
  negativeMoments: string[];
  communityInterests: string[];
  viewerParticipationRate: number; // 0-100
}

export interface BestMomentItem {
  id: string;
  timestamp: string;
  title: string;
  confidence: number;
  reason: string;
  supportingMetrics: string[];
  recommendation: string;
}

export interface ClipOpportunityItem {
  id: string;
  timestamp: string;
  durationSeconds: number;
  confidence: number;
  reason: string;
  suggestedTitle: string;
  suggestedHook: string;
  suggestedThumbnailIdea: string;
}

export interface CoachingInsightItem {
  id: string;
  comparisonLabel: string; // e.g. "Compared to your previous 10 streams"
  insight: string;
  improvement: "better" | "worse" | "same" | "new";
  recommendation: string;
  confidence: number;
}

export interface ActionItem {
  id: string;
  text: string;
  isCompleted: boolean;
  priority: "high" | "medium" | "low";
  relatedTimestamp?: string;
}

export interface ExecutiveSummaryData {
  narrative: string;       // AI-generated producer narrative
  generatedAt: string;
  modelUsed: string;
  confidence: number;
}

export interface AIReportMetadata {
  provider: string;
  model: string;
  latencyMs: number;
  fallbackUsed: boolean;
  generatedAt: string;
  snapshotsAnalyzed: number;
  insightsAnalyzed: number;
  totalMessagesAnalyzed: number;
}

export interface ExecutiveReport {
  id: string;
  sessionId: string;
  creatorId: string;       // email / userId

  // Stream context
  streamTitle?: string;
  platform?: string;
  streamDurationSeconds?: number;
  startedAt?: string;
  completedAt?: string;

  // Content
  executiveSummary: ExecutiveSummaryData;
  scores: StreamScores;
  biggestWins: BiggestWinItem[];
  missedOpportunities: MissedOpportunityItem[];
  streamStory: StoryMilestone[];
  audienceIntelligence: AudienceIntelligence;
  bestMoments: BestMomentItem[];
  clipOpportunities: ClipOpportunityItem[];
  coaching: CoachingInsightItem[];
  actionPlan: ActionItem[];

  // Meta
  isFavorited: boolean;
  isExported: boolean;
  aiMetadata: AIReportMetadata;
  createdAt: string;
  updatedAt: string;
}

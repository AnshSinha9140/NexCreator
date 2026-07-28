import { SupportedPlatform } from "@/types";

export type SessionLifecycleState =
  | "WAITING"
  | "DETECTING"
  | "LIVE"
  | "STOPPING"
  | "FINALIZING"
  | "COMPLETED"
  | "ARCHIVED"
  | "FAILED";

export interface FinalAIReport {
  biggestAudienceSpike: string;
  mostAskedQuestions: string[];
  bestEngagementWindow: string;
  suggestedShorts: string[];
  recommendedStreamLength: string;
  recommendedNextStreamTime: string;
  topViewerTopics: string[];
}

export interface FinalSessionSummary {
  sessionId: string;
  creatorId: string;
  platform: SupportedPlatform;
  platformDisplayName: string;
  streamTitle: string;
  streamCategory: string;
  durationMinutes: number;
  startedAt: string | null;
  endedAt: string;
  completedAt: string;

  // Key Performance Metrics
  peakViewers: number;
  averageViewers: number;
  totalMessagesCollected: number;
  snapshotsGeneratedCount: number;
  aiRecommendationsCount: number;
  highlightsGeneratedCount: number;

  // Engagement & Sentiment Averages
  avgSentiment: number;
  peakMomentum: number;
  peakHype: number;
  questionsDetectedCount: number;
  uniqueChattersCount: number;
  healthScore: number;
  quotaUsedYoutube?: number;

  finalAIReport?: FinalAIReport;
}

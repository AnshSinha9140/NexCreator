import { SupportedPlatform } from "@/types";
import { CanonicalAnalytics } from "@/lib/analytics/engine";

export type RepresentativeMessageCategory =
  | "question"
  | "reaction_emoji"
  | "hype_moment"
  | "long_form"
  | "repeated_spam"
  | "general";

export interface RepresentativeMessage {
  messageId: string;
  timestamp: Date | string;
  author: {
    username: string;
    displayName: string;
    badges: string[];
  };
  text: string;
  category: RepresentativeMessageCategory;
}

export type EngagementSignal =
  | "high_activity"
  | "medium_activity"
  | "low_activity"
  | "question_heavy"
  | "emoji_heavy"
  | "spam_spike"
  | "hype_moment";

export interface PulseSnapshotMetrics {
  totalMessages: number;
  messagesPerMinute: number;
  peakMessagesPerMinute: number;
  uniqueChattersCount: number;
  avgMessageLength: number;
  questionCount: number;
  replyCount: number;
  topEmojis: Array<{ emoji: string; count: number }>;
  topWords: Array<{ word: string; count: number }>;
}

export interface PulseSnapshotViewerMetrics {
  averageViewerCount: number | null;
  peakViewerCount: number | null;
  minimumViewerCount: number | null;
}

export interface PulseSnapshotStreamMeta {
  title: string;
  category: string;
  language: string | null;
}

export interface PulseSnapshotIngestionHealth {
  messagesProcessed: number;
  messagesDropped: number;
  duplicateMessagesIgnored: number;
  reconnectCount: number;
}

export interface PulseSnapshot {
  snapshotVersion: number; // Schema version (Default 1)
  snapshotId: string;
  sessionId: string;
  creatorId: string;
  platform: SupportedPlatform;
  windowStart: Date | string;
  windowEnd: Date | string;
  durationSeconds: number;
  viewerMetrics?: PulseSnapshotViewerMetrics;
  streamMetadata?: PulseSnapshotStreamMeta;
  ingestionHealth?: PulseSnapshotIngestionHealth;
  metrics: PulseSnapshotMetrics;
  representativeMessages: RepresentativeMessage[];
  engagementSignals: EngagementSignal[];
  analytics?: CanonicalAnalytics;
  isFinalPartial: boolean;
  createdAt: Date | string;
}

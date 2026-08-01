/**
 * Sprint 19.3 — Creator Manager Memory & Narrative Types
 * Shared interfaces for session runtime memory, advice lifecycle, and story progression.
 * Zero MongoDB persistence. Zero AI requests. Pure runtime memory types.
 */

export type StreamNarrativePhase =
  | "Beginning"
  | "Warm-up"
  | "Momentum Building"
  | "Peak"
  | "Stable"
  | "Cooling Down"
  | "Ending";

export type AdviceStatus = "SUGGESTED" | "FOLLOWED" | "IGNORED";

export interface AdviceMemoryRecord {
  id: string;
  intentKey: string;
  adviceText: string;
  headline: string;
  snapshotId: string;
  createdAt: string;
  status: AdviceStatus;
  followedAtSnapshotId?: string;
  outcomeText?: string;
}

export interface MoodTransitionRecord {
  timestamp: string;
  snapshotId: string;
  fromMood: string;
  toMood: string;
}

export interface HighlightMemoryRecord {
  id: string;
  title: string;
  timestamp: string;
  mentionedInConversation: boolean;
}

export interface CreatorManagerMemoryState {
  sessionId: string;
  startedAt: string;
  updatedAt: string;
  narrativePhase: StreamNarrativePhase;
  adviceHistory: AdviceMemoryRecord[];
  moodHistory: MoodTransitionRecord[];
  currentMood: string;
  previousMood: string | null;
  dominantTopic: string | null;
  highlightHistory: HighlightMemoryRecord[];
  mentionedClips: string[];
  suggestedActionsHistory: string[];
  confidenceTrend: number[];
  conversationLog: Array<{
    id: string;
    snapshotId: string;
    statement: string;
    priority: string;
    timestamp: string;
  }>;
}

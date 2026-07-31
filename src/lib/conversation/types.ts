/**
 * Sprint 19 & 19.1 — Conversational Intelligence Engine
 * Core types for the CreatorManagerConversation layer.
 */

export type ManagerTone = "observing" | "praising" | "concerned" | "advising" | "reviewing";
export type BriefingType = "live_update" | "mid_stream" | "critical_alert" | "end_of_stream";
export type ConfidenceLevel = "extreme" | "high" | "reasonable" | "watching" | "insufficient";

// Sprint 19.1 Part 8: Unified Message Types
export type ConversationMessageType = 
  | "Observation" 
  | "Advice" 
  | "Warning" 
  | "Praise" 
  | "Decision" 
  | "Reflection";

// Priority Categories for Topic Matrix (Sprint 19.1 Part 3)
export type ConversationPriority =
  | "CRITICAL_RISK"
  | "HIGH_PRIORITY_REC"
  | "MAJOR_OPPORTUNITY"
  | "MOOD_SHIFT"
  | "STRATEGY_UPDATE"
  | "POSITIVE_OBSERVATION";

// Sprint 19.1 Part 1 & 11: Single Unified Conversation Entry per snapshot
export interface ConversationEntry {
  id: string;
  snapshotId?: string;
  timestamp: string;               // e.g. "22:37"
  messageType: ConversationMessageType;
  priority: ConversationPriority;
  headline: string;                // Short punchy title
  statement: string;              // Target 60–90 words, max 120 words
  reasoning?: string;              // "Why does it matter?"
  actions?: string;                // "What would I do?"
  expectedOutcome?: string;        // "What happens next?"
  supportingEvidence: string[];   // Bullet points merged from secondary subsystem signals
  confidenceLevel: ConfidenceLevel;
  confidencePhrase: string;        // e.g. "High confidence"
  intentKey: string;              // For deduplication & cooldown tracking
  createdEpochMs: number;
}

// Legacy backward-compatible thought for cards
export interface ManagerThought {
  id: string;
  timestamp: string;            // e.g. "22:14"
  tone: ManagerTone;
  headline: string;             // One sentence summary
  body: string;                 // The full natural-language explanation
  why: string;                  // Why I'm noticing this
  whatToDo?: string;            // What I'd recommend
  expectedResult?: string;      // What will happen if acted on
  ifIgnored?: string;           // What will happen if not acted on
  confidencePhrase: string;     // "I'm reasonably confident", etc.
  confidenceLevel: ConfidenceLevel;
  memoryNote?: string;          // "I mentioned this earlier..."
  isNew: boolean;               // False if re-surfaced from memory
  intentKey?: string;           // For dedup tracking
}

// A concern the manager is watching
export interface ManagerConcern {
  id: string;
  headline: string;
  body: string;
  severity: "watching" | "concerned" | "urgent";
}

// Something going well
export interface ManagerPraise {
  id: string;
  headline: string;
  body: string;
}

// The opening briefing paragraph
export interface ManagerBriefing {
  type: BriefingType;
  headline: string;
  body: string;
  memoryContext?: string;        // What happened earlier in the session
}

// Legacy timeline entry maintained for backwards compatibility if needed
export interface ConversationTimelineEntry {
  timestamp: string;
  statement: string;
  tone: ManagerTone;
}

// The full conversation object produced per snapshot
export interface CreatorManagerConversation {
  sessionId: string;
  snapshotId?: string;
  generatedAt: string;
  briefing: ManagerBriefing;
  primaryAdvice: ManagerThought | null;    // The single most important action
  thoughts: ManagerThought[];              // All active observations
  praise: ManagerPraise[];
  concerns: ManagerConcern[];
  timeline: ConversationTimelineEntry[];   // Legacy text timeline
  entries: ConversationEntry[];            // Sprint 19.1: Structured unified timeline entries (max 15 visible)
}

// Used for the completed stream review
export interface EndOfStreamReview {
  openingStatement: string;       // "If I were your manager, here's what I'd tell you."
  whatImpressedMe: string[];
  whatHurtPerformance: string[];
  whatToRepeat: string[];
  whatToNeverRepeat: string[];
  oneThingToImprove: string;
  mostValuableClip: string | null;
  biggestMissedOpportunity: string | null;
  closingStatement: string;
}

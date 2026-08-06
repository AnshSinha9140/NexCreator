// =============================================================================
// canonicalTypes.ts — Sprint 24.5 (Evidence Intelligence Architecture)
// =============================================================================

import type {
  EvidenceScorecard,
  BroadcastAct,
  SessionReliability,
  EvidenceGraph,
  ValidationResult,
} from "./evidence/EvidenceTypes";

// Re-export evidence types for consumers
export type {
  EvidenceScorecard,
  EvidenceScorecardDimension,
  BroadcastAct,
  SessionReliability,
  EvidenceGraph,
  RawEvidence,
  MomentCandidate,
  ValidationResult,
} from "./evidence/EvidenceTypes";

// ---------------------------------------------------------------------------
// Broadcast Timeline
// ---------------------------------------------------------------------------

export type BroadcastTimelineEventType =
  | "STREAM_STARTED"
  | "AUDIENCE_ARRIVAL"
  | "CONVERSATION_STARTED"
  | "VIEWER_SPIKE"
  | "FUNNY_MOMENT"
  | "QUESTION_WAVE"
  | "EMOTIONAL_REACTION"
  | "PEAK_ENGAGEMENT"
  | "CLIP_CANDIDATE"
  | "STRONG_FINISH"
  | "STREAM_ENDED";

export interface BroadcastTimelineEvent {
  eventId: string;
  timestamp: string;             // HH:MM:SS
  isoTimestamp: string;
  title: string;
  description: string;
  eventType: BroadcastTimelineEventType;
  confidence: number;
  relatedHighlightId?: string;
  relatedSnapshotId?: string;
  relatedEvidenceIds?: string[]; // Sprint 24.5 — links into EvidenceGraph
  jumpToVodUrl?: string;
  severity: "info" | "success" | "warning" | "error";
  evidence: {
    viewerCount?: number;
    viewerDelta?: number;
    messageCount?: number;
    sentiment?: number;
    velocity?: number;
    note?: string;
  };
}

// ---------------------------------------------------------------------------
// Session Metadata
// ---------------------------------------------------------------------------

export interface CanonicalSessionMeta {
  id: string;
  creatorId: string;
  platform: string;
  platformDisplayName: string;
  streamTitle: string;
  streamCategory: string;
  streamUrl?: string;
  vodUrl?: string;
  startedAt: string;
  endedAt: string;
  durationMinutes: number;
}

// ---------------------------------------------------------------------------
// Telemetry
// ---------------------------------------------------------------------------

export interface CanonicalTelemetry {
  totalMessages: number;
  uniqueChatters: number;
  peakViewers: number;
  averageViewers: number;
  avgSentiment: number;
  peakMomentum: number;
  peakHype: number;
  questionsDetected: number;
  messagesPerMinute: number;
  sessionType: "EMPTY" | "NORMAL" | "HIGH_PERFORMANCE" | string;
  integrityFlags: {
    aiValid: boolean;
    highlightsValid: boolean;
    healthScoreValid: boolean;
    timelineValid: boolean;
  };
  healthScore: number;
}

// ---------------------------------------------------------------------------
// Audience
// ---------------------------------------------------------------------------

export interface CanonicalAudience {
  overallMood: string;
  moodExplanation: string;
  topKeywords: string[];
  mostDiscussedTopics: string[];
  frequentlyAskedQuestions: string[];
  positiveMoments: string[];
  negativeMoments: string[];
  viewerParticipationRate: number;
  chatVelocitySurge: number;
}

// ---------------------------------------------------------------------------
// Highlight Evidence Sub-Objects
// ---------------------------------------------------------------------------

export interface CanonicalHighlightViewerEvidence {
  peakViewers: number;
  viewerDelta: number;
  description: string;
}

export interface CanonicalHighlightChatEvidence {
  velocity: number;
  topEmotes: string[];           // Derived from actual snapshot emoji data — not hardcoded
  representativeMessages: string[]; // Real chat messages only
  description: string;
}

export interface CanonicalHighlightSentimentEvidence {
  sentimentScore: number;
  dominantEmotion: string;
  description: string;
}

// ---------------------------------------------------------------------------
// Clip Window
// ---------------------------------------------------------------------------

export interface CanonicalClipWindow {
  startFormatted: string;
  endFormatted: string;
  startSeconds: number;
  endSeconds: number;
  hookTimestamp: string;
  peakTimestamp: string;
  durationSeconds: number;
}

// ---------------------------------------------------------------------------
// Publishing Package — Sprint 24.5 extended with editor-ready blueprint
// ---------------------------------------------------------------------------

export interface CanonicalPublishingPackage {
  highlightId: string;
  youtubeTitle: string;
  tiktokTitle: string;
  instagramTitle: string;
  seoTitle: string;              // Sprint 24.5
  hook: string;
  description: string;
  caption: string;               // Sprint 24.5
  thumbnailIdea: {
    frameTimestamp: string;
    expression: string;
    overlayText: string;
    reason: string;
  };
  hashtags: string[];
  callToAction: string;
  bestPlatform: "YouTube Shorts" | "TikTok" | "Instagram Reels" | "YouTube Longform";
  priority: "Critical" | "High" | "Medium";
  checklist: string[];
  viralScores: {
    virality: number;
    replay: number;
    retention: number;
    ctrPrediction: number;
    communityInterest: number;
    overallPublishScore: number;
  };
  // Sprint 24.5 — Editor-ready blueprint
  zoomPoints?: Array<{ atSecond: number; zoomLevel: number; reason: string }>;
  subtitleTiming?: { style: string; speed: string; position: string };
  reactionCrop?: { enabled: boolean; peakSecond: number; cropDuration: number };
  facecamSuggestions?: string[];
  editingDifficulty: "Easy" | "Moderate" | "Complex";
  estimatedEditMinutes: number;
  expectedRetentionPct: number;
}

// ---------------------------------------------------------------------------
// Canonical Highlight — Sprint 24.5 extended with evidence references
// ---------------------------------------------------------------------------

export interface CanonicalHighlight {
  highlightId: string;
  momentId: string;              // Sprint 24.5 — links to MomentCandidate
  rank: "GOLD" | "SILVER" | "BRONZE" | "ADDITIONAL";
  rankTitle: string;
  badgeIcon: string;
  title: string;
  timestamp: string;             // HH:MM:SS
  durationSeconds: number;
  durationFormatted: string;
  category: string;
  confidence: number;
  score: number;                 // Flat score for backward compatibility
  scorecard: EvidenceScorecard;  // Sprint 24.5 — full multi-dimensional scorecard
  evidenceRefs: string[];        // Sprint 24.5 — IDs into EvidenceGraph.evidence
  triggerReason: string;
  editorSummary: string;
  viewerEvidence: CanonicalHighlightViewerEvidence;
  chatEvidence: CanonicalHighlightChatEvidence;
  sentimentEvidence: CanonicalHighlightSentimentEvidence;
  clipWindow: CanonicalClipWindow;
  publishingPackage: CanonicalPublishingPackage;
}

// ---------------------------------------------------------------------------
// Publishing Strategy
// ---------------------------------------------------------------------------

export interface CanonicalPublishingStrategy {
  executiveBrief: {
    summaryText: string;
    shortsCount: number;
    highlightsCount: number;
    thumbnailCandidatesCount: number;
    longFormRecommended: boolean;
    highestPriorityAction: string;
  };
  assets: CanonicalPublishingPackage[];
  calendar: Array<{
    day: string;
    time: string;
    assetTitle: string;
    platform: string;
    notes: string;
  }>;
}

// ---------------------------------------------------------------------------
// Discoveries & Wins
// ---------------------------------------------------------------------------

export interface CanonicalDiscovery {
  id: string;
  discovery: string;
  evidence: string;
  confidence: number;
  timestamp: string;
  relatedHighlightId?: string;
  relatedEvidenceIds?: string[]; // Sprint 24.5
}

export interface CanonicalBiggestWin {
  id: string;
  title: string;
  category: string;
  timestamp: string;
  confidence: number;
  explanation: string;
  evidence: string;
  relatedHighlightId?: string;
  relatedEvidenceIds?: string[]; // Sprint 24.5
}

export interface CanonicalMissedOpportunity {
  id: string;
  title: string;
  category: string;
  timestamp: string;
  whatHappened: string;
  whyItMatters: string;
  recommendation: string;
  evidence: string;
}

// ---------------------------------------------------------------------------
// Executive Summary
// ---------------------------------------------------------------------------

export type CanonicalStreamGrade = "A+" | "A" | "A-" | "B+" | "B" | "B-" | "C+" | "C" | "C-" | "D" | "F";

export interface CanonicalExecutiveSummary {
  narrative: string;
  streamGrade: CanonicalStreamGrade;
  overallScore: number;
  scores: {
    overall: number;
    content: number;
    audience: number;
    retention: number;
    energy: number;
    interaction: number;
    consistency: number;
    communityResponse: number;
  };
  biggestWins: CanonicalBiggestWin[];
  missedOpportunities: CanonicalMissedOpportunity[];
  experiment: {
    title: string;
    hypothesis: string;
    testInstruction: string;
    expectedImprovement: string;
  };
}

// ---------------------------------------------------------------------------
// Coaching
// ---------------------------------------------------------------------------

export interface CanonicalCoachingItem {
  id: string;
  title: string;
  category: string;
  whyItMatters: string;
  specificAction: string;
  confidence: number;
  evidence: string;
  evidenceIds?: string[];       // Sprint 24.5 — references to RawEvidence.id
  timestampRef?: string;
}

export interface CanonicalCoaching {
  managerJournal: {
    entryText: string;
    signedBy: string;
    date: string;
    mood: string;
    creatorReflection: string;
    whatImpressedMe?: string;
    whatHeldYouBack?: string;
    oneThingToRepeat?: string;
    oneThingToStop?: string;
    nextStreamPriority?: string;
    longTermReminder?: string;
  };
  personalizedCoaching: CanonicalCoachingItem[];
  nextAdvice: {
    primaryFocus: string;
    recommendation: string;
    actionSteps: string[]
  };
  missionProgress: {
    currentPhase: string;
    progressPercent: number;
    keyTakeaway: string;
    nextMilestone: string;
  };
}

// ---------------------------------------------------------------------------
// Action Items
// ---------------------------------------------------------------------------

export interface CanonicalActionItem {
  id: string;
  actionId?: string;
  title: string;
  priority: "Critical" | "High" | "Medium" | "Low" | "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | string;
  impact: string;
  timeToComplete: string;
  estimatedMinutes?: number;
  completed: boolean;
  category: string;
  rationale: string;
  evidenceIds?: string[];        // Sprint 24.5
  timestampRef?: string;
}

// ---------------------------------------------------------------------------
// Creator Memory
// ---------------------------------------------------------------------------

export interface CanonicalCreatorMemory {
  creatorProfile: any;
  personalBenchmarks: any;
  strengthsIdentified: string[];
  growthAreas: string[];
  recurringPatterns: string[];
  playbookInsights: string[];
}

// ---------------------------------------------------------------------------
// Patterns & Knowledge
// ---------------------------------------------------------------------------

export interface CanonicalPattern {
  id: string;
  title: string;
  description: string;
  frequency: string;
  impact: "Positive" | "Neutral" | "Negative";
  evidence: string;
  supportingSessionCount?: number; // Sprint 24.5
}

export interface CanonicalKnowledgeUpdate {
  id: string;
  topic: string;
  update: string;
  confidence: number;
  sourceSessionId: string;
}

// ---------------------------------------------------------------------------
// Confidence — Sprint 24.5 extended with session-count calibration
// ---------------------------------------------------------------------------

export type ConfidenceBand = "LOW" | "MEDIUM" | "HIGH" | "VERY_HIGH";

export interface CanonicalConfidence {
  overallConfidence: number;
  calibrationReason: string;
  telemetryCoverage: number;
  sampleSizeMessageCount: number;
  // Sprint 24.5
  observedSessionCount: number;
  confidenceBand: ConfidenceBand;
  canShowPercentage: boolean;
  displayLabel: string;
}

// ---------------------------------------------------------------------------
// Session Diagnostics
// ---------------------------------------------------------------------------

export interface SessionDiagnostics {
  llmCalls: number;
  providerUsed: string;
  modelUsed: string;
  tokensUsed: number;
  latencyMs: number;
  fallbackUsed: boolean;
  retries: number;
  processingTimeMs: number;
  generatedAt: string;
  // Sprint 24.5
  evidenceCount?: number;
  momentCandidatesDetected?: number;
  momentCandidatesValidated?: number;
  momentCandidatesRejected?: number;
  validationResult?: ValidationResult;
}

// ---------------------------------------------------------------------------
// Recommendations
// ---------------------------------------------------------------------------

export interface CanonicalRecommendation {
  id: string;
  title: string;
  category: string;
  description: string;
  evidence: string;
  evidenceIds?: string[];         // Sprint 24.5
  confidence: number;
  priority: string;
  timestamp?: string;
  relatedHighlightId?: string;    // Sprint 24.5
  relatedDiscoveryId?: string;    // Sprint 24.5
}

// ---------------------------------------------------------------------------
// Root Document — SessionIntelligence (Sprint 24.5)
// ---------------------------------------------------------------------------

export interface SessionIntelligence {
  sessionId: string;
  creatorId: string;
  version: number;
  createdAt: string;
  processingState?: "live_monitoring" | "finalized"; // Sprint 24.5 — state flag

  session: CanonicalSessionMeta;
  telemetry: CanonicalTelemetry;
  audience: CanonicalAudience;
  timeline: {
    events: BroadcastTimelineEvent[];
  };
  acts?: BroadcastAct[];             // Sprint 24.5 — story-based broadcast acts
  discoveries: CanonicalDiscovery[];
  highlights: CanonicalHighlight[];
  publishing: CanonicalPublishingStrategy;
  recommendations: CanonicalRecommendation[];
  actionPlan: CanonicalActionItem[];
  executiveSummary: CanonicalExecutiveSummary;
  coaching: CanonicalCoaching;
  creatorMemory: CanonicalCreatorMemory;
  patterns: CanonicalPattern[];
  knowledgeUpdates: CanonicalKnowledgeUpdate[];
  confidence: CanonicalConfidence;
  diagnostics: SessionDiagnostics;
  // Sprint 24.5 — Evidence Trust Layer
  evidenceGraph?: EvidenceGraph;
  sessionReliability?: SessionReliability;
  certificate?: any;
}

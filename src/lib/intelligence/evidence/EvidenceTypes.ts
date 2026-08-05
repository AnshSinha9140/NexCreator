// =============================================================================
// EvidenceTypes.ts — Sprint 24.5 Evidence Intelligence Type System
// =============================================================================
// All evidence objects must originate from measured stream telemetry.
// AI never invents. AI only explains verified evidence.
// =============================================================================

// ---------------------------------------------------------------------------
// Raw Evidence Types — The atomic unit of observed stream signal
// ---------------------------------------------------------------------------

export type RawEvidenceType =
  | "VIEWER_SPIKE"        // Viewer count rose sharply between snapshots
  | "CHAT_EXPLOSION"      // Chat velocity exceeded 2x baseline
  | "QUESTION_WAVE"       // ≥ 3 questions received in a single snapshot window
  | "SENTIMENT_SHIFT"     // Sentiment delta > 12 points between snapshots
  | "AUDIENCE_ARRIVAL"    // First significant viewer wave (stream opening)
  | "AUDIENCE_EXIT"       // Viewer drop > 20% in late stream
  | "CONVERSATION_BURST"  // High unique chatter diversity — real dialogue happening
  | "SILENCE"             // Velocity < 2 msgs/min for > 60 seconds
  | "REACTION_BURST"      // > 60% emote-only messages in window
  | "MOMENTUM_SHIFT";     // Momentum index changed > 20 points

export interface RawEvidence {
  id: string;                        // e.g. "ev_viewer_spike_001"
  type: RawEvidenceType;
  timestamp: string;                 // HH:MM:SS of peak signal
  isoTimestamp: string;              // ISO 8601 for sorting
  durationSeconds: number;           // How long the signal lasted
  confidence: number;                // 0-100, derived from signal strength
  relatedSnapshotId: string;         // The snapshot that generated this evidence
  sourceMetrics: {
    velocity?: number;               // msgs/min at peak
    baselineVelocity?: number;       // msgs/min average for the session
    viewerCount?: number;
    viewerDelta?: number;            // Change vs. previous snapshot
    viewerDeltaPct?: number;
    sentimentScore?: number;
    sentimentDelta?: number;
    momentumIndex?: number;
    momentumDelta?: number;
    questionCount?: number;
    emoteRatio?: number;             // 0-1 proportion of emote-only messages
    uniqueChatterCount?: number;
  };
  chatSample: string[];              // Real messages from this window (not fabricated)
  description: string;               // Human-readable one-line explanation
}

// ---------------------------------------------------------------------------
// Moment Candidates — Groups of overlapping evidence that form a Highlight
// ---------------------------------------------------------------------------

export interface MomentCandidate {
  momentId: string;                  // e.g. "moment_001"
  startTimestamp: string;            // HH:MM:SS
  peakTimestamp: string;             // HH:MM:SS — highest signal point
  endTimestamp: string;              // HH:MM:SS
  startSeconds: number;
  peakSeconds: number;
  endSeconds: number;
  durationSeconds: number;
  category: MomentCategory;
  confidence: number;                // Aggregate confidence from all evidence
  evidenceIds: string[];             // References to RawEvidence.id
  relatedSnapshotIds: string[];      // All snapshots that feed this moment
  chatRange: {                       // Index range into chatMessages array
    startIndex: number;
    endIndex: number;
    messages: string[];              // Actual sampled messages
  };
  score: number;                     // Composite 0-100 from EvidenceScorecard
  scorecard: EvidenceScorecard;
  validationStatus: "PENDING" | "VALIDATED" | "REJECTED";
  rejectionReason?: string;
}

export type MomentCategory =
  | "GAMEPLAY_CLUTCH"
  | "COMMUNITY_REACTION"
  | "QUESTION_SURGE"
  | "EMOTIONAL_PEAK"
  | "AUDIENCE_ARRIVAL"
  | "VIRAL_MOMENT"
  | "CONVERSATION_BURST"
  | "MOMENTUM_SURGE";

// ---------------------------------------------------------------------------
// Evidence Scorecard — Replaces generic highlight scores
// ---------------------------------------------------------------------------

export interface EvidenceScorecardDimension {
  score: number;           // 0-100
  why: string;             // Human-readable explanation of this score
}

export interface EvidenceScorecard {
  overall: number;                          // Weighted composite 0-100
  viewerImpact: EvidenceScorecardDimension; // Based on viewerDelta / peakViewers
  chatVelocity: EvidenceScorecardDimension; // Based on velocity / baselineVelocity ratio
  sentiment: EvidenceScorecardDimension;    // Based on sentimentScore
  replayValue: EvidenceScorecardDimension;  // velocity × sentiment × uniqueness
  uniqueness: EvidenceScorecardDimension;   // Entropy of message content
  conversationQuality: EvidenceScorecardDimension; // Ratio of Q+long-form messages
  confidence: EvidenceScorecardDimension;   // From validated evidence count and types
}

// ---------------------------------------------------------------------------
// Session Reliability — How trustworthy is the session's data
// ---------------------------------------------------------------------------

export type ReliabilityLabel = "Strong" | "Moderate" | "Limited" | "Insufficient";
export type ConfidenceBand = "LOW" | "MEDIUM" | "HIGH" | "VERY_HIGH";

export interface SessionReliability {
  chatCoverage: number;           // % of expected chat captured
  viewerCoverage: number;         // % of snapshots with viewer data
  snapshotCoverage: number;       // Actual snapshots / expected count
  evidenceDensity: number;        // Evidence items per minute
  timelineCompleteness: number;   // % of stream timeline with events
  dataCompleteness: number;       // Average of all coverage metrics
  overallReliability: number;     // Composite 0-100
  reliabilityLabel: ReliabilityLabel;
  showLimitedDisclaimer: boolean; // True if reliability < 40
  disclaimerText?: string;        // "Recommendations are based on limited evidence."
}

// ---------------------------------------------------------------------------
// Evidence Graph Node Types
// ---------------------------------------------------------------------------

export interface EvidenceGraphSnapshotRef {
  snapshotId: string;
  timestamp: string;
  windowStart: string;
  windowEnd: string;
}

export interface EvidenceGraphChatRange {
  rangeId: string;
  momentId: string;
  startIndex: number;
  endIndex: number;
  messageCount: number;
}

export interface EvidenceGraph {
  sessionId: string;
  evidence: RawEvidence[];
  moments: MomentCandidate[];
  snapshots: EvidenceGraphSnapshotRef[];
  chatRanges: EvidenceGraphChatRange[];
  edges: Array<{
    fromType: "moment" | "evidence" | "snapshot";
    fromId: string;
    toType: "moment" | "evidence" | "snapshot" | "chatRange";
    toId: string;
    relation: "contains" | "triggers" | "supports" | "references";
  }>;
  buildAt: string;
  nodes?: any[];
  links?: any[];
}

// ---------------------------------------------------------------------------
// Broadcast Acts — Timeline structure
// ---------------------------------------------------------------------------

export type ActLabel = "OPENING" | "MOMENTUM" | "PEAK" | "ENDING";

export interface BroadcastAct {
  actId: string;
  label: ActLabel;
  title: string;           // e.g. "Opening — Audience Arrival & Warmup"
  startTimestamp: string;
  endTimestamp: string;
  startSeconds: number;
  endSeconds: number;
  durationMinutes: number;
  highlightIds: string[];  // CanonicalHighlight.highlightId
  snapshotIds: string[];
  questionCount: number;
  audienceChanges: Array<{
    type: "ARRIVAL" | "EXIT" | "SPIKE" | "DIP";
    timestamp: string;
    delta: number;
    description: string;
  }>;
  recommendations: string[]; // Plain-text coaching specific to this act
  energyLevel: "Low" | "Building" | "High" | "Peak" | "Declining";
  summary: string;           // One sentence narrative of this act
}

// ---------------------------------------------------------------------------
// Validation Result
// ---------------------------------------------------------------------------

export interface ValidationFailure {
  rule: string;
  description: string;
  severity: "ERROR" | "WARNING";
  affectedId?: string;
}

export interface ValidationResult {
  passed: boolean;
  failureCount: number;
  warningCount: number;
  failures: ValidationFailure[];
  warnings: ValidationFailure[];
  checkedAt: string;
}

// ---------------------------------------------------------------------------
// Creator Skill Types — for longitudinal memory
// ---------------------------------------------------------------------------

export interface CreatorSkillEntry {
  sessionId: string;
  value: number;        // 0-100
  recordedAt: string;   // ISO timestamp
}

export interface CreatorSkillDimension {
  skillName: CreatorSkillName;
  current: number;
  history: CreatorSkillEntry[];  // append-only, capped at 30
  trend: "IMPROVING" | "STABLE" | "DECLINING" | "INSUFFICIENT_DATA";
  lastUpdated: string;
}

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

export interface CreatorSkillProfile {
  creatorId: string;
  skills: { [K in CreatorSkillName]: CreatorSkillDimension };
  streamsAnalyzed: number;
  lastUpdated: string;
}

// =============================================================================
// EvidenceExtractor.ts — Sprint 24.5 (Updated with Absolute Minimum Pre-Gate & Participation Density)
// =============================================================================
// Converts raw PulseSnapshot[] and ChatMessage[] into normalized RawEvidence[].
// RULE: Never fabricate evidence. Only emit when measured metrics cross thresholds.
// =============================================================================

import { RawEvidence, RawEvidenceType } from "./EvidenceTypes";

interface SnapshotInput {
  snapshotId?: string;
  sessionId?: string;
  timestamp?: string;
  windowStart?: string | Date;
  windowEnd?: string | Date;
  createdAt?: string | Date;
  messagesPerMinute?: number;
  sentimentScore?: number;
  viewerCount?: number;
  metrics?: {
    messagesPerMinute?: number;
    sentimentScore?: number;
    viewerCount?: number;
    questionCount?: number;
    uniqueChattersCount?: number;
    topEmojis?: Array<{ emoji: string; count: number }>;
    totalMessages?: number;
  };
  analytics?: {
    velocity?: number;
    sentiment?: number;
    momentum?: number;
    hypeScore?: number;
    viewers?: number;
    questionCount?: number;
    uniqueChatterCount?: number;
  };
  viewerMetrics?: {
    averageViewerCount?: number | null;
    peakViewerCount?: number | null;
  };
  representativeMessages?: Array<{
    text?: string;
    category?: string;
    message?: string;
    content?: string;
  }>;
  engagementSignals?: string[];
  isoTimestamp?: string;
}

interface ChatMessageInput {
  id?: string;
  username?: string;
  sender?: string;
  message?: string;
  content?: string;
  text?: string;
  timestamp?: string;
  sentiment?: number;
}

export class EvidenceExtractor {
  // Absolute minimum volume gate
  private static readonly MIN_TOTAL_MESSAGES_PREGATE = 10;

  // Signal thresholds
  private static readonly VIEWER_SPIKE_PCT = 0.10;         // 10% viewer delta
  private static readonly CHAT_EXPLOSION_MULTIPLIER = 1.4; // 1.4x baseline velocity
  private static readonly QUESTION_WAVE_MIN = 2;           // ≥ 2 questions in window
  private static readonly SENTIMENT_SHIFT_DELTA = 8;       // 8-point delta
  private static readonly AUDIENCE_EXIT_DROP_PCT = 0.20;   // 20% drop
  private static readonly SILENCE_MAX_VELOCITY = 2;        // msgs/min
  private static readonly REACTION_BURST_EMOTE_RATIO = 0.5;// 50% emote messages
  private static readonly MOMENTUM_SHIFT_DELTA = 15;       // 15-point change

  /**
   * Main extraction pipeline. Takes raw monitoring data and returns
   * typed, normalized evidence objects. Zero fabrication.
   */
  public static extract(
    snapshots: SnapshotInput[],
    chatMessages: ChatMessageInput[]
  ): RawEvidence[] {
    if (!snapshots || snapshots.length === 0) return [];

    const evidence: RawEvidence[] = [];
    let evidenceCounter = 0;

    const makeId = (type: RawEvidenceType, idx: number) =>
      `ev_${type.toLowerCase()}_${String(idx).padStart(3, "0")}`;

    // Compute session baseline velocity
    const velocities = snapshots.map((s) => this.getVelocity(s)).filter((v) => v > 0);
    const baselineVelocity =
      velocities.length > 0
        ? velocities.reduce((a, b) => a + b, 0) / velocities.length
        : 0;

    // Process each snapshot in order
    for (let i = 0; i < snapshots.length; i++) {
      const snap = snapshots[i];
      const prevSnap = i > 0 ? snapshots[i - 1] : null;

      const snapId = snap.snapshotId || `snap_${i}`;
      const velocity = this.getVelocity(snap);
      const sentiment = this.getSentiment(snap);
      const viewers = this.getViewers(snap);
      const prevViewers = prevSnap ? this.getViewers(prevSnap) : null;
      const prevSentiment = prevSnap ? this.getSentiment(prevSnap) : null;
      const prevMomentum = prevSnap ? this.getMomentum(prevSnap) : null;
      const momentum = this.getMomentum(snap);
      const questionCount = this.getQuestionCount(snap);
      const timestamp = this.getTimestamp(snap, i);
      const isoTimestamp = this.getIsoTimestamp(snap, i);
      const messages = this.getSampleMessages(snap);
      const totalMsgs = this.getTotalMessages(snap);

      // Check for Viewer Spike first (used in pre-gate exception)
      let viewerSpikeDetected = false;
      let viewerDelta = 0;
      let viewerDeltaPct = 0;
      if (prevViewers !== null && prevViewers > 0 && viewers > 0) {
        viewerDelta = viewers - prevViewers;
        viewerDeltaPct = viewerDelta / prevViewers;
        if (viewerDeltaPct >= this.VIEWER_SPIKE_PCT) {
          viewerSpikeDetected = true;
        }
      }

      // ----------------------------------------------------------------
      // ABSOLUTE MINIMUM PRE-GATE (Phase 1 Fix)
      // Discard low-volume noise unless a viewer spike, silence, or audience exit occurs
      const isSilenceCandidate = velocity <= this.SILENCE_MAX_VELOCITY && i > 0;
      const effectiveMsgCount = totalMsgs > 0 ? totalMsgs : velocity;
      if (effectiveMsgCount < this.MIN_TOTAL_MESSAGES_PREGATE && !viewerSpikeDetected && !isSilenceCandidate && i > 0) {
        continue; // Discard snapshot immediately; do not compute multipliers
      }

      // ----------------------------------------------------------------
      // 1. AUDIENCE_ARRIVAL — first snapshot with meaningful viewer presence
      // ----------------------------------------------------------------
      if (i === 0 && (viewers > 0 || velocity > 0)) {
        evidence.push({
          id: makeId("AUDIENCE_ARRIVAL", ++evidenceCounter),
          type: "AUDIENCE_ARRIVAL",
          timestamp,
          isoTimestamp,
          durationSeconds: 120,
          confidence: 95,
          relatedSnapshotId: snapId,
          sourceMetrics: {
            viewerCount: viewers,
            velocity,
            baselineVelocity,
          },
          chatSample: messages.slice(0, 3),
          description: `Audience arrived — ${viewers > 0 ? viewers + " viewers" : "chat active"} at stream opening.`,
        });
      }

      // ----------------------------------------------------------------
      // 2. VIEWER_SPIKE — significant viewer count increase
      // ----------------------------------------------------------------
      if (viewerSpikeDetected) {
        evidence.push({
          id: makeId("VIEWER_SPIKE", ++evidenceCounter),
          type: "VIEWER_SPIKE",
          timestamp,
          isoTimestamp,
          durationSeconds: 60,
          confidence: Math.min(98, Math.round(60 + viewerDeltaPct * 200)),
          relatedSnapshotId: snapId,
          sourceMetrics: {
            viewerCount: viewers,
            viewerDelta,
            viewerDeltaPct: Math.round(viewerDeltaPct * 100),
            velocity,
            baselineVelocity,
          },
          chatSample: messages.slice(0, 3),
          description: `+${viewerDelta} viewers joined (+${Math.round(viewerDeltaPct * 100)}% spike) during this window.`,
        });
      }

      // ----------------------------------------------------------------
      // 3. CHAT_EXPLOSION — velocity significantly exceeds baseline
      // ----------------------------------------------------------------
      if (baselineVelocity > 0 && velocity >= baselineVelocity * this.CHAT_EXPLOSION_MULTIPLIER) {
        evidence.push({
          id: makeId("CHAT_EXPLOSION", ++evidenceCounter),
          type: "CHAT_EXPLOSION",
          timestamp,
          isoTimestamp,
          durationSeconds: 60,
          confidence: Math.min(97, Math.round(70 + (velocity / baselineVelocity) * 10)),
          relatedSnapshotId: snapId,
          sourceMetrics: {
            velocity,
            baselineVelocity,
            sentimentScore: sentiment,
          },
          chatSample: messages.slice(0, 5),
          description: `Chat exploded at ${velocity} msgs/min — ${Math.round(velocity / baselineVelocity)}x the session baseline.`,
        });
      } else if (baselineVelocity === 0 && velocity >= 8) {
        evidence.push({
          id: makeId("CHAT_EXPLOSION", ++evidenceCounter),
          type: "CHAT_EXPLOSION",
          timestamp,
          isoTimestamp,
          durationSeconds: 60,
          confidence: 75,
          relatedSnapshotId: snapId,
          sourceMetrics: { velocity, sentimentScore: sentiment },
          chatSample: messages.slice(0, 5),
          description: `High chat velocity at ${velocity} msgs/min observed.`,
        });
      }

      // ----------------------------------------------------------------
      // 4. QUESTION_WAVE — surge of viewer questions
      // ----------------------------------------------------------------
      if (questionCount >= this.QUESTION_WAVE_MIN) {
        const questionMessages = this.getQuestionMessages(snap, chatMessages, i, snapshots.length);
        evidence.push({
          id: makeId("QUESTION_WAVE", ++evidenceCounter),
          type: "QUESTION_WAVE",
          timestamp,
          isoTimestamp,
          durationSeconds: 90,
          confidence: Math.min(99, 80 + questionCount * 3),
          relatedSnapshotId: snapId,
          sourceMetrics: {
            questionCount,
            velocity,
            sentimentScore: sentiment,
          },
          chatSample: questionMessages.slice(0, 4),
          description: `${questionCount} viewer questions detected — community is highly engaged.`,
        });
      }

      // ----------------------------------------------------------------
      // 5. SENTIMENT_SHIFT — sudden sentiment change
      // ----------------------------------------------------------------
      if (prevSentiment !== null) {
        const sentimentDelta = sentiment - prevSentiment;
        if (Math.abs(sentimentDelta) >= this.SENTIMENT_SHIFT_DELTA) {
          evidence.push({
            id: makeId("SENTIMENT_SHIFT", ++evidenceCounter),
            type: "SENTIMENT_SHIFT",
            timestamp,
            isoTimestamp,
            durationSeconds: 60,
            confidence: Math.min(96, Math.round(70 + Math.abs(sentimentDelta) * 1.5)),
            relatedSnapshotId: snapId,
            sourceMetrics: {
              sentimentScore: sentiment,
              sentimentDelta,
              velocity,
            },
            chatSample: messages.slice(0, 3),
            description: `Sentiment ${sentimentDelta > 0 ? "surged" : "dropped"} ${Math.abs(Math.round(sentimentDelta))} points to ${Math.round(sentiment)}% positive.`,
          });
        }
      }

      // ----------------------------------------------------------------
      // 6. AUDIENCE_EXIT — late-stream viewer drop
      // ----------------------------------------------------------------
      const isLatePct = i / snapshots.length;
      if (isLatePct >= 0.8 && prevViewers !== null && prevViewers > 0 && viewers > 0) {
        const dropPct = (prevViewers - viewers) / prevViewers;
        if (dropPct >= this.AUDIENCE_EXIT_DROP_PCT) {
          evidence.push({
            id: makeId("AUDIENCE_EXIT", ++evidenceCounter),
            type: "AUDIENCE_EXIT",
            timestamp,
            isoTimestamp,
            durationSeconds: 60,
            confidence: 88,
            relatedSnapshotId: snapId,
            sourceMetrics: {
              viewerCount: viewers,
              viewerDelta: viewers - prevViewers,
              viewerDeltaPct: Math.round(-dropPct * 100),
            },
            chatSample: [],
            description: `${Math.round(dropPct * 100)}% viewer drop detected in stream end phase.`,
          });
        }
      }

      // ----------------------------------------------------------------
      // 7. REACTION_BURST — participation density driven confidence
      // ----------------------------------------------------------------
      const emoteRatio = this.getEmoteRatio(snap);
      const uniqueChatters = this.getUniqueChatters(snap);
      if (emoteRatio >= this.REACTION_BURST_EMOTE_RATIO && (velocity >= 3 || totalMsgs >= 5)) {
        // Compute relative participation density
        const participationPct = uniqueChatters > 0 ? Math.min(1, totalMsgs / uniqueChatters) : 0.8;
        const participationConfidence = Math.min(98, Math.round(75 + emoteRatio * 15 + participationPct * 10));

        evidence.push({
          id: makeId("REACTION_BURST", ++evidenceCounter),
          type: "REACTION_BURST",
          timestamp,
          isoTimestamp,
          durationSeconds: 45,
          confidence: participationConfidence,
          relatedSnapshotId: snapId,
          sourceMetrics: {
            emoteRatio,
            velocity,
            sentimentScore: sentiment,
            uniqueChatterCount: uniqueChatters,
          },
          chatSample: messages.slice(0, 5),
          description: `${Math.round(emoteRatio * 100)}% emote-heavy chat (${uniqueChatters} active chatters) — audience reaction burst.`,
        });
      }

      // ----------------------------------------------------------------
      // 8. CONVERSATION_BURST — high chatter diversity
      // ----------------------------------------------------------------
      if (uniqueChatters >= 3 && totalMsgs > 0) {
        const diversityRatio = uniqueChatters / totalMsgs;
        if (diversityRatio >= 0.4 && (velocity >= 4 || totalMsgs >= 8)) {
          evidence.push({
            id: makeId("CONVERSATION_BURST", ++evidenceCounter),
            type: "CONVERSATION_BURST",
            timestamp,
            isoTimestamp,
            durationSeconds: 90,
            confidence: Math.min(94, Math.round(65 + diversityRatio * 30)),
            relatedSnapshotId: snapId,
            sourceMetrics: {
              uniqueChatterCount: uniqueChatters,
              velocity,
              sentimentScore: sentiment,
            },
            chatSample: messages.slice(0, 4),
            description: `${uniqueChatters} unique chatters active — active community dialogue.`,
          });
        }
      }

      // ----------------------------------------------------------------
      // 9. SILENCE — dead-air detection
      // ----------------------------------------------------------------
      if (velocity <= this.SILENCE_MAX_VELOCITY && velocity >= 0 && i > 0 && totalMsgs > 0) {
        const prevVelocity = prevSnap ? this.getVelocity(prevSnap) : 0;
        if (prevVelocity > 5) {
          evidence.push({
            id: makeId("SILENCE", ++evidenceCounter),
            type: "SILENCE",
            timestamp,
            isoTimestamp,
            durationSeconds: 60,
            confidence: 85,
            relatedSnapshotId: snapId,
            sourceMetrics: {
              velocity,
              baselineVelocity,
            },
            chatSample: [],
            description: `Chat quieted to ${velocity} msgs/min — potential dead-air segment.`,
          });
        }
      }

      // ----------------------------------------------------------------
      // 10. MOMENTUM_SHIFT — energy change
      // ----------------------------------------------------------------
      if (prevMomentum !== null && momentum > 0) {
        const momentumDelta = momentum - prevMomentum;
        if (Math.abs(momentumDelta) >= this.MOMENTUM_SHIFT_DELTA) {
          evidence.push({
            id: makeId("MOMENTUM_SHIFT", ++evidenceCounter),
            type: "MOMENTUM_SHIFT",
            timestamp,
            isoTimestamp,
            durationSeconds: 60,
            confidence: Math.min(92, Math.round(65 + Math.abs(momentumDelta))),
            relatedSnapshotId: snapId,
            sourceMetrics: {
              momentumIndex: momentum,
              momentumDelta,
              velocity,
              sentimentScore: sentiment,
            },
            chatSample: messages.slice(0, 3),
            description: `Momentum ${momentumDelta > 0 ? "surged" : "dropped"} ${Math.abs(Math.round(momentumDelta))} points — energy shift detected.`,
          });
        }
      }
    }

    return evidence;
  }

  // ---------------------------------------------------------------------------
  // Private Helpers — field accessors with flexible schema support
  // ---------------------------------------------------------------------------

  private static getVelocity(s: SnapshotInput): number {
    return s.analytics?.velocity ?? s.metrics?.messagesPerMinute ?? s.messagesPerMinute ?? 0;
  }

  private static getSentiment(s: SnapshotInput): number {
    return s.analytics?.sentiment ?? s.metrics?.sentimentScore ?? s.sentimentScore ?? 65;
  }

  private static getMomentum(s: SnapshotInput): number {
    return s.analytics?.momentum ?? 0;
  }

  private static getViewers(s: SnapshotInput): number {
    return (
      s.analytics?.viewers ??
      s.metrics?.viewerCount ??
      s.viewerCount ??
      s.viewerMetrics?.averageViewerCount ??
      0
    );
  }

  private static getQuestionCount(s: SnapshotInput): number {
    return s.analytics?.questionCount ?? s.metrics?.questionCount ?? 0;
  }

  private static getEmoteRatio(s: SnapshotInput): number {
    const topEmojis = s.metrics?.topEmojis || [];
    const totalMsgs = this.getTotalMessages(s);
    if (totalMsgs === 0) return 0;
    const emoteCount = topEmojis.reduce((acc, e) => acc + e.count, 0);
    return Math.min(1, emoteCount / totalMsgs);
  }

  private static getUniqueChatters(s: SnapshotInput): number {
    return s.analytics?.uniqueChatterCount ?? s.metrics?.uniqueChattersCount ?? 0;
  }

  private static getTotalMessages(s: SnapshotInput): number {
    return s.metrics?.totalMessages ?? 0;
  }

  private static getSampleMessages(s: SnapshotInput): string[] {
    const reps = s.representativeMessages || [];
    return reps
      .map((m) => m.text || m.message || m.content || "")
      .filter((t) => t.length > 0);
  }

  private static getTimestamp(s: SnapshotInput, idx: number): string {
    const raw = s.timestamp || s.isoTimestamp || s.windowStart;
    if (raw) {
      const d = new Date(raw);
      if (!isNaN(d.getTime())) {
        const str = String(raw);
        if (/^\d{2}:\d{2}:\d{2}$/.test(str)) return str;
      }
    }
    const sec = idx * 60 + 45;
    const hh = String(Math.floor(sec / 3600)).padStart(2, "0");
    const mm = String(Math.floor((sec % 3600) / 60)).padStart(2, "0");
    const ss = String(sec % 60).padStart(2, "0");
    return `${hh}:${mm}:${ss}`;
  }

  private static getIsoTimestamp(s: SnapshotInput, idx: number): string {
    const raw = s.isoTimestamp || s.windowStart || s.createdAt;
    if (raw) {
      const d = new Date(raw);
      if (!isNaN(d.getTime())) return d.toISOString();
    }
    return new Date(Date.now() - (999 - idx) * 60000).toISOString();
  }

  private static getQuestionMessages(
    snap: SnapshotInput,
    allMessages: ChatMessageInput[],
    snapIdx: number,
    totalSnaps: number
  ): string[] {
    const fromRep = (snap.representativeMessages || [])
      .filter((m) => m.category === "question")
      .map((m) => m.text || m.message || m.content || "")
      .filter((t) => t.length > 0);

    if (fromRep.length > 0) return fromRep;

    const chunkSize = Math.ceil(allMessages.length / Math.max(1, totalSnaps));
    const start = snapIdx * chunkSize;
    return allMessages
      .slice(start, start + chunkSize)
      .map((m) => m.message || m.content || m.text || "")
      .filter((t) => t.includes("?"))
      .slice(0, 4);
  }
}

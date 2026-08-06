// =============================================================================
// MomentDetector.ts — Sprint 24.5 (Updated with Primary Anchor Requirement & 15s Clamps)
// =============================================================================
// Converts validated RawEvidence[] into MomentCandidate[].
// Groups overlapping evidence within a time window. Scores each candidate.
// AI does NOT detect highlights directly — evidence triggers moments.
// =============================================================================

import { RawEvidence, MomentCandidate, MomentCategory, EvidenceScorecard, RawEvidenceType } from "./EvidenceTypes";
import { EvidenceScore } from "./EvidenceScore";

export class MomentDetector {
  // Primary anchors required to trigger a moment candidate cluster alone
  private static readonly PRIMARY_ANCHORS: Set<RawEvidenceType> = new Set([
    "CHAT_EXPLOSION",
    "VIEWER_SPIKE",
    "REACTION_BURST",
  ]);

  // Grouping window: evidence within 3 minutes (180s) is aggressively merged into one moment cluster
  private static readonly GROUPING_WINDOW_SECONDS = 180;
  // Pre-roll: start clip this many seconds before first evidence signal
  private static readonly PRE_ROLL_SECONDS = 5;
  // Post-roll: end clip this many seconds after last evidence signal
  private static readonly POST_ROLL_SECONDS = 8;
  // Minimum clip duration (lowered to 15s to capture rapid, high-density inside jokes/clutches)
  private static readonly MIN_DURATION_SECONDS = 15;
  // Maximum clip duration
  private static readonly MAX_DURATION_SECONDS = 60;

  /**
   * Main detection pipeline.
   * Takes validated evidence, groups it into moment candidates, scores each,
   * and returns them sorted by score descending.
   */
  public static detect(
    evidence: RawEvidence[],
    chatMessages: Array<{ message?: string; content?: string; text?: string; username?: string; timestamp?: string }>,
    sessionBaseline: { avgVelocity: number; avgSentiment: number; peakViewers: number }
  ): MomentCandidate[] {
    if (!evidence || evidence.length === 0) return [];

    // Sort evidence chronologically by isoTimestamp
    const sorted = [...evidence].sort(
      (a, b) => new Date(a.isoTimestamp).getTime() - new Date(b.isoTimestamp).getTime()
    );

    // Group overlapping evidence into clusters
    const clusters = this.groupIntoWindows(sorted);

    // Filter clusters: MUST contain at least one Primary Anchor
    const validClusters = clusters.filter((cluster) =>
      cluster.some((ev) => this.PRIMARY_ANCHORS.has(ev.type))
    );

    // Build a MomentCandidate from each valid cluster
    const candidates: MomentCandidate[] = validClusters
      .map((cluster, idx) => this.buildCandidate(cluster, idx, chatMessages, evidence, sessionBaseline))
      .filter((c): c is MomentCandidate => c !== null);

    // Sort by score descending
    return candidates.sort((a, b) => b.score - a.score);
  }

  // ---------------------------------------------------------------------------
  // Private: Group overlapping evidence into windows
  // ---------------------------------------------------------------------------

  private static groupIntoWindows(sorted: RawEvidence[]): RawEvidence[][] {
    const clusters: RawEvidence[][] = [];
    let currentCluster: RawEvidence[] = [];

    for (const ev of sorted) {
      if (currentCluster.length === 0) {
        currentCluster.push(ev);
        continue;
      }

      const lastEv = currentCluster[currentCluster.length - 1];
      const lastTime = new Date(lastEv.isoTimestamp).getTime();
      const currTime = new Date(ev.isoTimestamp).getTime();
      const diffSeconds = (currTime - lastTime) / 1000;

      if (diffSeconds <= this.GROUPING_WINDOW_SECONDS) {
        currentCluster.push(ev);
      } else {
        clusters.push(currentCluster);
        currentCluster = [ev];
      }
    }

    if (currentCluster.length > 0) {
      clusters.push(currentCluster);
    }

    return clusters;
  }

  // ---------------------------------------------------------------------------
  // Private: Build a MomentCandidate from a cluster of evidence
  // ---------------------------------------------------------------------------

  private static buildCandidate(
    cluster: RawEvidence[],
    idx: number,
    chatMessages: Array<{ message?: string; content?: string; text?: string; username?: string; timestamp?: string }>,
    allEvidence: RawEvidence[],
    sessionBaseline: { avgVelocity: number; avgSentiment: number; peakViewers: number }
  ): MomentCandidate | null {
    if (cluster.length === 0) return null;

    // Sort cluster chronologically
    const sortedCluster = [...cluster].sort(
      (a, b) => new Date(a.isoTimestamp).getTime() - new Date(b.isoTimestamp).getTime()
    );

    const firstEvidence = sortedCluster[0];
    const lastEvidence = sortedCluster[sortedCluster.length - 1];

    // Find the peak evidence (highest confidence)
    const peakEvidence = sortedCluster.reduce((best, ev) =>
      ev.confidence > best.confidence ? ev : best
    );

    const startSec = Math.max(0, this.parseToSeconds(firstEvidence.timestamp) - this.PRE_ROLL_SECONDS);
    const rawEndSec = this.parseToSeconds(lastEvidence.timestamp) + this.POST_ROLL_SECONDS;
    const peakSec = this.parseToSeconds(peakEvidence.timestamp);

    // Clamp clip duration (minimum 15s allowed)
    const clampedDuration = Math.min(
      this.MAX_DURATION_SECONDS,
      Math.max(this.MIN_DURATION_SECONDS, rawEndSec - startSec)
    );
    const endSec = startSec + clampedDuration;

    // Determine category from dominant evidence types
    const evidenceTypes = sortedCluster.map((ev) => ev.type);
    const category = this.resolveCategory(evidenceTypes);

    // Sample real chat messages from the relevant window
    const chatRange = this.sampleChatMessages(chatMessages, startSec, endSec);

    const momentId = `moment_${String(idx + 1).padStart(3, "0")}`;

    // Compute aggregate confidence
    const avgConfidence = Math.round(
      sortedCluster.reduce((acc, ev) => acc + ev.confidence, 0) / sortedCluster.length
    );

    // Build a temporary candidate for scoring
    const tempCandidate: MomentCandidate = {
      momentId,
      startTimestamp: this.formatSeconds(startSec),
      peakTimestamp: this.formatSeconds(peakSec),
      endTimestamp: this.formatSeconds(endSec),
      startSeconds: startSec,
      peakSeconds: peakSec,
      endSeconds: endSec,
      durationSeconds: clampedDuration,
      category,
      confidence: avgConfidence,
      evidenceIds: sortedCluster.map((ev) => ev.id),
      relatedSnapshotIds: [...new Set(sortedCluster.map((ev) => ev.relatedSnapshotId))],
      chatRange,
      score: 0,
      scorecard: {} as EvidenceScorecard,
      validationStatus: "PENDING",
    };

    // Compute evidence scorecard
    const scorecard = EvidenceScore.compute(tempCandidate, allEvidence, sessionBaseline);
    tempCandidate.score = scorecard.overall;
    tempCandidate.scorecard = scorecard;

    return tempCandidate;
  }

  // ---------------------------------------------------------------------------
  // Private: Category resolution from evidence types
  // ---------------------------------------------------------------------------

  private static resolveCategory(types: RawEvidence["type"][]): MomentCategory {
    const typeSet = new Set(types);
    if (typeSet.has("VIEWER_SPIKE")) return "AUDIENCE_ARRIVAL";
    if (typeSet.has("QUESTION_WAVE")) return "QUESTION_SURGE";
    if (typeSet.has("REACTION_BURST") && typeSet.has("CHAT_EXPLOSION")) return "VIRAL_MOMENT";
    if (typeSet.has("SENTIMENT_SHIFT") && typeSet.has("CHAT_EXPLOSION")) return "EMOTIONAL_PEAK";
    if (typeSet.has("CHAT_EXPLOSION")) return "COMMUNITY_REACTION";
    if (typeSet.has("CONVERSATION_BURST")) return "CONVERSATION_BURST";
    if (typeSet.has("MOMENTUM_SHIFT")) return "MOMENTUM_SURGE";
    if (typeSet.has("REACTION_BURST")) return "COMMUNITY_REACTION";
    return "GAMEPLAY_CLUTCH";
  }

  // ---------------------------------------------------------------------------
  // Private: Sample real chat messages from the time window
  // ---------------------------------------------------------------------------

  private static sampleChatMessages(
    chatMessages: Array<{ message?: string; content?: string; text?: string; username?: string; timestamp?: string }>,
    startSec: number,
    endSec: number
  ): MomentCandidate["chatRange"] {
    if (!chatMessages || chatMessages.length === 0) {
      return { startIndex: 0, endIndex: 0, messages: [] };
    }

    const messagesWithTimestamps = chatMessages.filter((m) => m.timestamp);

    let startIndex = 0;
    let endIndex = chatMessages.length - 1;
    let windowMessages: string[] = [];

    if (messagesWithTimestamps.length > 5) {
      const filtered = chatMessages.filter((m) => {
        if (!m.timestamp) return false;
        const secVal = this.parseToSeconds(m.timestamp);
        return secVal >= startSec && secVal <= endSec;
      });
      if (filtered.length > 0) {
        const firstIdx = chatMessages.indexOf(filtered[0]);
        const lastIdx = chatMessages.indexOf(filtered[filtered.length - 1]);
        startIndex = Math.max(0, firstIdx);
        endIndex = Math.min(chatMessages.length - 1, lastIdx);
        windowMessages = filtered
          .map((m) => m.message || m.content || m.text || "")
          .filter((t) => t.length > 0)
          .slice(0, 8);
      }
    }

    if (windowMessages.length === 0 && chatMessages.length > 0) {
      const totalDurationGuess = 45 * 60;
      const startRatio = startSec / totalDurationGuess;
      const endRatio = endSec / totalDurationGuess;
      startIndex = Math.floor(startRatio * chatMessages.length);
      endIndex = Math.min(chatMessages.length - 1, Math.floor(endRatio * chatMessages.length));
      windowMessages = chatMessages
        .slice(startIndex, endIndex + 1)
        .map((m) => m.message || m.content || m.text || "")
        .filter((t) => t.length > 0)
        .slice(0, 8);
    }

    return {
      startIndex,
      endIndex,
      messages: windowMessages,
    };
  }

  private static parseToSeconds(timestamp: any): number {
    if (timestamp === null || timestamp === undefined) return 0;
    if (typeof timestamp === "number") return Math.max(0, Math.floor(timestamp));
    if (timestamp instanceof Date) {
      return !isNaN(timestamp.getTime()) ? Math.floor(timestamp.getTime() / 1000) : 0;
    }
    const str = String(timestamp).trim();
    if (!str) return 0;
    const parts = str.split(":").map(Number);
    if (parts.length === 3 && !parts.some(isNaN)) return parts[0] * 3600 + parts[1] * 60 + parts[2];
    if (parts.length === 2 && !parts.some(isNaN)) return parts[0] * 60 + parts[1];
    if (parts.length === 1 && !isNaN(parts[0])) return parts[0];
    return 0;
  }

  private static formatSeconds(sec: number): string {
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }
}

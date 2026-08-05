// =============================================================================
// ActBuilder.ts — Sprint 24.5
// =============================================================================
// Builds the Act-based broadcast timeline structure.
// Timeline is a story — not a developer log.
// Acts: OPENING → MOMENTUM → PEAK → ENDING
// Act boundaries are evidence-peak–driven, not fixed time percentages.
// =============================================================================

import { BroadcastAct, RawEvidence, MomentCandidate } from "./EvidenceTypes";

export class ActBuilder {
  /**
   * Builds 4 broadcast acts from evidence and moment data.
   * Act boundaries are placed based on evidence density peaks.
   */
  public static build(params: {
    sessionId: string;
    durationSeconds: number;
    evidence: RawEvidence[];
    moments: MomentCandidate[];
    highlightIds: string[];      // parallel array matching moments order
    snapshotIds: string[];       // all snapshot IDs for the session
    streamCategory: string;
  }): BroadcastAct[] {
    const { durationSeconds, evidence, moments, highlightIds, snapshotIds, streamCategory } = params;
    if (durationSeconds <= 0) return [];

    // Sort evidence chronologically for density analysis
    const sortedEvidence = [...evidence].sort(
      (a, b) => new Date(a.isoTimestamp).getTime() - new Date(b.isoTimestamp).getTime()
    );

    // Find peak evidence moment (highest combined confidence)
    const peakMoment = moments.length > 0
      ? moments.reduce((best, m) => m.score > best.score ? m : best)
      : null;
    const peakSec = peakMoment ? peakMoment.peakSeconds : Math.floor(durationSeconds * 0.6);

    // Evidence-driven act boundaries
    const openingEnd = this.findFirstMajorCluster(sortedEvidence, durationSeconds) || Math.floor(durationSeconds * 0.25);
    const momentumEnd = peakSec > openingEnd ? Math.floor((openingEnd + peakSec) / 2) : Math.floor(durationSeconds * 0.55);
    const peakEnd = Math.min(Math.floor(peakSec + durationSeconds * 0.15), Math.floor(durationSeconds * 0.85));

    const actBounds = [
      { start: 0, end: openingEnd },
      { start: openingEnd, end: momentumEnd },
      { start: momentumEnd, end: peakEnd },
      { start: peakEnd, end: durationSeconds },
    ];

    const actLabels: BroadcastAct["label"][] = ["OPENING", "MOMENTUM", "PEAK", "ENDING"];
    const actTitles = [
      `Opening — Audience Arrival & Warmup`,
      `Momentum — Chat Acceleration`,
      `Peak — Highest Engagement`,
      `Ending — Community Wind-Down`,
    ];
    const actEnergy: BroadcastAct["energyLevel"][] = ["Low", "Building", "Peak", "Declining"];

    return actBounds.map((bounds, i) => {
      const label = actLabels[i];
      const actEvidence = sortedEvidence.filter(
        (ev) => this.parseToSeconds(ev.timestamp) >= bounds.start && this.parseToSeconds(ev.timestamp) < bounds.end
      );

      const actMoments = moments.filter(
        (m) => m.peakSeconds >= bounds.start && m.peakSeconds < bounds.end
      );
      const actHighlightIds = actMoments
        .map((m) => {
          const mIdx = moments.indexOf(m);
          return highlightIds[mIdx] || "";
        })
        .filter((id) => id.length > 0);

      const actSnapshotIds = snapshotIds.filter((_, sIdx) => {
        const estimatedSec = sIdx * (durationSeconds / Math.max(1, snapshotIds.length));
        return estimatedSec >= bounds.start && estimatedSec < bounds.end;
      });

      const questionCount = actEvidence
        .filter((ev) => ev.type === "QUESTION_WAVE")
        .reduce((acc, ev) => acc + (ev.sourceMetrics.questionCount ?? 0), 0);

      const audienceChanges = this.buildAudienceChanges(actEvidence);
      const recommendations = this.buildActRecommendations(label, actEvidence, actMoments, streamCategory);
      const summary = this.buildActSummary(label, actEvidence, actHighlightIds.length);

      return {
        actId: `act_${String(i + 1).padStart(2, "0")}`,
        label,
        title: actTitles[i],
        startTimestamp: this.formatSeconds(bounds.start),
        endTimestamp: this.formatSeconds(bounds.end),
        startSeconds: bounds.start,
        endSeconds: bounds.end,
        durationMinutes: Math.round((bounds.end - bounds.start) / 60),
        highlightIds: actHighlightIds,
        snapshotIds: actSnapshotIds,
        questionCount,
        audienceChanges,
        recommendations,
        energyLevel: actEnergy[i],
        summary,
      } satisfies BroadcastAct;
    });
  }

  /**
   * Finds the first major evidence cluster to use as the OPENING act boundary.
   */
  private static findFirstMajorCluster(evidence: RawEvidence[], durationSeconds: number): number | null {
    if (evidence.length === 0) return null;
    // Look for the first high-confidence evidence burst
    const highConfidence = evidence.filter(
      (ev) => ev.confidence >= 85 && ev.type !== "AUDIENCE_ARRIVAL"
    );
    if (highConfidence.length > 0) {
      const firstSec = this.parseToSeconds(highConfidence[0].timestamp);
      return Math.max(firstSec, Math.floor(durationSeconds * 0.15));
    }
    return null;
  }

  private static buildAudienceChanges(evidence: RawEvidence[]): BroadcastAct["audienceChanges"] {
    const changes: BroadcastAct["audienceChanges"] = [];
    for (const ev of evidence) {
      if (ev.type === "VIEWER_SPIKE" && (ev.sourceMetrics.viewerDelta ?? 0) > 0) {
        changes.push({
          type: "SPIKE",
          timestamp: ev.timestamp,
          delta: ev.sourceMetrics.viewerDelta ?? 0,
          description: ev.description,
        });
      } else if (ev.type === "AUDIENCE_ARRIVAL") {
        changes.push({
          type: "ARRIVAL",
          timestamp: ev.timestamp,
          delta: ev.sourceMetrics.viewerCount ?? 0,
          description: ev.description,
        });
      } else if (ev.type === "AUDIENCE_EXIT" && (ev.sourceMetrics.viewerDelta ?? 0) < 0) {
        changes.push({
          type: "EXIT",
          timestamp: ev.timestamp,
          delta: ev.sourceMetrics.viewerDelta ?? 0,
          description: ev.description,
        });
      }
    }
    return changes.slice(0, 4); // Cap at 4 per act
  }

  private static buildActRecommendations(
    label: BroadcastAct["label"],
    evidence: RawEvidence[],
    moments: MomentCandidate[],
    streamCategory: string
  ): string[] {
    const recs: string[] = [];
    const hasSilence = evidence.some((ev) => ev.type === "SILENCE");
    const hasHighVelocity = evidence.some((ev) => ev.type === "CHAT_EXPLOSION");
    const hasQuestions = evidence.some((ev) => ev.type === "QUESTION_WAVE");
    const hasReactionBurst = evidence.some((ev) => ev.type === "REACTION_BURST");

    switch (label) {
      case "OPENING":
        recs.push("Greet incoming viewers by name during the first 2 minutes — it anchors community loyalty.");
        if (!hasHighVelocity) {
          recs.push(`Ask chat a direct opening question about their ${streamCategory} experience to warm up engagement.`);
        }
        break;
      case "MOMENTUM":
        if (hasSilence) {
          recs.push("Fill quiet transitions with commentary — describe your strategy or ask chat for their prediction.");
        }
        if (hasQuestions) {
          recs.push("You had a question wave here — answering questions out loud during gameplay extends viewer dwell time.");
        }
        break;
      case "PEAK":
        if (moments.length > 0) {
          recs.push(`Your strongest moment of the stream landed here — export this clip for short-form content immediately.`);
        }
        if (hasReactionBurst) {
          recs.push("Emote-heavy chat is a strong signal — your reaction in this window is the clip's hook.");
        }
        break;
      case "ENDING":
        recs.push("Announce your next stream date and time before signing off — retention is highest in the final 5 minutes.");
        if (evidence.length === 0) {
          recs.push("Chat quieted in the stream end — a strong call-to-action (sub, follow, next stream) here drives return viewers.");
        }
        break;
    }

    return recs.slice(0, 3);
  }

  private static buildActSummary(
    label: BroadcastAct["label"],
    evidence: RawEvidence[],
    highlightCount: number
  ): string {
    const evidenceCount = evidence.length;
    switch (label) {
      case "OPENING":
        return evidenceCount > 0
          ? `Stream opened with ${evidenceCount} detected engagement signal${evidenceCount > 1 ? "s" : ""} — audience arrived and chat began warming up.`
          : "Stream opening captured with minimal early chat activity.";
      case "MOMENTUM":
        return evidenceCount > 0
          ? `Chat and viewer momentum built during this act with ${evidenceCount} signal${evidenceCount > 1 ? "s" : ""} — audience warmed to the broadcast.`
          : "Steady broadcast phase with moderate engagement.";
      case "PEAK":
        return highlightCount > 0
          ? `Peak broadcast window — ${highlightCount} top highlight moment${highlightCount > 1 ? "s" : ""} occurred here, driving maximum audience reaction.`
          : "Highest activity window of the stream — key moments concentrated in this act.";
      case "ENDING":
        return evidenceCount > 0
          ? `Stream concluded with ${evidenceCount} late signal${evidenceCount > 1 ? "s" : ""} — community remained engaged through the closing act.`
          : "Stream wound down — a closing CTA to follow or subscribe would have captured late viewers.";
    }
  }

  private static parseToSeconds(timestamp: any): number {
    if (!timestamp) return 0;
    if (typeof timestamp === "number") return timestamp;
    const str = String(timestamp).trim();
    const parts = str.split(":").map(Number);
    if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
    if (parts.length === 2) return parts[0] * 60 + parts[1];
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

// =============================================================================
// EvidenceScore.ts — Sprint 24.5
// =============================================================================
// Computes EvidenceScorecard from a MomentCandidate and its related evidence.
// Every score dimension must trace to a measured metric. No fabrication.
// =============================================================================

import {
  MomentCandidate,
  EvidenceScorecard,
  EvidenceScorecardDimension,
  RawEvidence,
} from "./EvidenceTypes";

export class EvidenceScore {
  /**
   * Computes a full EvidenceScorecard from a MomentCandidate and its evidence chain.
   * Returns the scorecard and a flat overall score for backward compatibility.
   */
  public static compute(
    candidate: MomentCandidate,
    evidence: RawEvidence[],
    sessionBaseline: { avgVelocity: number; avgSentiment: number; peakViewers: number }
  ): EvidenceScorecard {
    // Resolve only the evidence for this moment
    const momentEvidence = evidence.filter((ev) => candidate.evidenceIds.includes(ev.id));

    // Gather peak metrics from the evidence chain
    const peakVelocity = Math.max(0, ...momentEvidence.map((ev) => ev.sourceMetrics.velocity ?? 0));
    const peakViewerDelta = Math.max(0, ...momentEvidence.map((ev) => ev.sourceMetrics.viewerDelta ?? 0));
    const peakSentiment = Math.max(0, ...momentEvidence.map((ev) => ev.sourceMetrics.sentimentScore ?? 0));
    const questionCount = momentEvidence.reduce(
      (acc, ev) => acc + (ev.sourceMetrics.questionCount ?? 0),
      0
    );
    const emoteRatio = Math.max(0, ...momentEvidence.map((ev) => ev.sourceMetrics.emoteRatio ?? 0));
    const uniqueChatters = Math.max(
      0,
      ...momentEvidence.map((ev) => ev.sourceMetrics.uniqueChatterCount ?? 0)
    );

    const baseline = sessionBaseline;
    const evidenceTypes = new Set(momentEvidence.map((ev) => ev.type));

    // ----------------------------------------------------------------
    // 1. Viewer Impact — based on viewer delta relative to peak
    // ----------------------------------------------------------------
    const viewerImpact = this.computeViewerImpact(
      peakViewerDelta,
      baseline.peakViewers
    );

    // ----------------------------------------------------------------
    // 2. Chat Velocity — based on velocity relative to session baseline
    // ----------------------------------------------------------------
    const chatVelocity = this.computeChatVelocity(peakVelocity, baseline.avgVelocity);

    // ----------------------------------------------------------------
    // 3. Sentiment — based on measured sentiment score
    // ----------------------------------------------------------------
    const sentiment = this.computeSentiment(peakSentiment, baseline.avgSentiment);

    // ----------------------------------------------------------------
    // 4. Replay Value — composite of velocity × sentiment × uniqueness
    // ----------------------------------------------------------------
    const replayValue = this.computeReplayValue(
      chatVelocity.score,
      sentiment.score,
      emoteRatio,
      candidate.chatRange.messages
    );

    // ----------------------------------------------------------------
    // 5. Uniqueness — entropy of chat content
    // ----------------------------------------------------------------
    const uniqueness = this.computeUniqueness(candidate.chatRange.messages, emoteRatio);

    // ----------------------------------------------------------------
    // 6. Conversation Quality — ratio of questions and thoughtful messages
    // ----------------------------------------------------------------
    const conversationQuality = this.computeConversationQuality(
      questionCount,
      uniqueChatters,
      candidate.chatRange.messages
    );

    // ----------------------------------------------------------------
    // 7. Confidence — from evidence count and diversity
    // ----------------------------------------------------------------
    const confidence = this.computeConfidence(momentEvidence.length, evidenceTypes.size);

    // ----------------------------------------------------------------
    // Overall — weighted composite
    // ----------------------------------------------------------------
    const overall = Math.min(
      99,
      Math.round(
        viewerImpact.score * 0.20 +
        chatVelocity.score * 0.25 +
        sentiment.score * 0.20 +
        replayValue.score * 0.15 +
        uniqueness.score * 0.10 +
        conversationQuality.score * 0.05 +
        confidence.score * 0.05
      )
    );

    return {
      overall,
      viewerImpact,
      chatVelocity,
      sentiment,
      replayValue,
      uniqueness,
      conversationQuality,
      confidence,
    };
  }

  /**
   * Flat score accessor for backward compatibility with UI components that
   * read highlight.score as a number.
   */
  public static flatScore(scorecard: EvidenceScorecard): number {
    return scorecard.overall;
  }

  // ---------------------------------------------------------------------------
  // Dimension Computers
  // ---------------------------------------------------------------------------

  private static computeViewerImpact(
    viewerDelta: number,
    peakViewers: number
  ): EvidenceScorecardDimension {
    if (peakViewers === 0 && viewerDelta === 0) {
      return {
        score: 30,
        why: "No viewer count data available for this session.",
      };
    }
    if (peakViewers === 0) {
      return {
        score: 45,
        why: `${viewerDelta} viewers joined but peak session viewers unknown.`,
      };
    }
    const pct = (viewerDelta / peakViewers) * 100;
    const score = Math.min(99, Math.max(0, Math.round(pct * 2 + 40)));
    const why =
      viewerDelta > 0
        ? `+${viewerDelta} viewers joined (${Math.round(pct)}% of session peak) during this moment.`
        : "No viewer count change recorded during this moment.";
    return { score, why };
  }

  private static computeChatVelocity(
    peakVelocity: number,
    baselineVelocity: number
  ): EvidenceScorecardDimension {
    if (baselineVelocity === 0 && peakVelocity === 0) {
      return { score: 20, why: "No chat activity measured in this session." };
    }
    if (baselineVelocity === 0) {
      const score = Math.min(90, Math.round(40 + peakVelocity * 2));
      return { score, why: `Chat peaked at ${peakVelocity} msgs/min (no session baseline available).` };
    }
    const ratio = peakVelocity / baselineVelocity;
    const score = Math.min(99, Math.max(10, Math.round(ratio * 40 + 20)));
    const why = `Chat hit ${peakVelocity} msgs/min — ${ratio.toFixed(1)}x the ${Math.round(baselineVelocity)} msgs/min session average.`;
    return { score, why };
  }

  private static computeSentiment(
    peakSentiment: number,
    avgSentiment: number
  ): EvidenceScorecardDimension {
    if (peakSentiment === 0) {
      return { score: 50, why: "Sentiment data was not captured for this moment." };
    }
    const delta = peakSentiment - avgSentiment;
    const score = Math.min(99, Math.max(10, Math.round(peakSentiment * 0.7 + delta * 1.5)));
    const label = peakSentiment >= 85 ? "Euphoric" : peakSentiment >= 70 ? "Positive" : peakSentiment >= 50 ? "Neutral" : "Mixed";
    const why = `Audience sentiment registered ${Math.round(peakSentiment)}% positive (${label}) — ${delta >= 0 ? "+" : ""}${Math.round(delta)} vs. session average.`;
    return { score, why };
  }

  private static computeReplayValue(
    chatVelocityScore: number,
    sentimentScore: number,
    emoteRatio: number,
    messages: string[]
  ): EvidenceScorecardDimension {
    // High replay = fast chat + positive + distinct content (not pure spam)
    const uniquenessBoost = emoteRatio < 0.8 ? 15 : 0; // reward non-emote-only bursts
    const score = Math.min(99, Math.round(
      chatVelocityScore * 0.4 + sentimentScore * 0.4 + uniquenessBoost + (messages.length > 2 ? 10 : 0)
    ));
    const why =
      score >= 80
        ? "Strong replay potential — fast chat, positive audience, and authentic reactions combine for high rewatchability."
        : score >= 60
        ? "Moderate replay potential — some strong signals but missing peak combination of velocity and sentiment."
        : "Limited replay potential based on measured chat and sentiment signals.";
    return { score, why };
  }

  private static computeUniqueness(messages: string[], emoteRatio: number): EvidenceScorecardDimension {
    if (messages.length === 0) {
      return { score: 30, why: "No chat messages sampled for uniqueness analysis." };
    }
    // Measure content diversity — lower emote ratio = more unique conversational content
    const uniqueWords = new Set(
      messages.join(" ").toLowerCase().split(/\s+/).filter((w) => w.length > 2)
    ).size;
    const wordDensity = Math.min(1, uniqueWords / Math.max(1, messages.length * 3));
    const emoteBonus = emoteRatio < 0.4 ? 20 : emoteRatio < 0.6 ? 10 : 0;
    const score = Math.min(99, Math.max(20, Math.round(wordDensity * 80 + emoteBonus)));
    const why =
      emoteRatio > 0.7
        ? `Emote-heavy chat (${Math.round(emoteRatio * 100)}% emotes) — authentic reactions but lower content diversity.`
        : `Rich chat diversity — ${uniqueWords} unique terms across ${messages.length} messages.`;
    return { score, why };
  }

  private static computeConversationQuality(
    questionCount: number,
    uniqueChatters: number,
    messages: string[]
  ): EvidenceScorecardDimension {
    const questionInMessages = messages.filter((m) => m.includes("?")).length;
    const totalQuestions = Math.max(questionCount, questionInMessages);
    const longerMessages = messages.filter((m) => m.split(" ").length >= 4).length;
    const score = Math.min(
      99,
      Math.max(10, Math.round(totalQuestions * 12 + longerMessages * 8 + uniqueChatters * 3))
    );
    const why =
      totalQuestions > 0
        ? `${totalQuestions} viewer questions recorded — community is engaging with content, not just reacting.`
        : "Predominantly reaction-based chat — conversation quality moderate.";
    return { score, why };
  }

  private static computeConfidence(
    evidenceCount: number,
    evidenceTypeCount: number
  ): EvidenceScorecardDimension {
    const base = Math.min(80, evidenceCount * 15 + evidenceTypeCount * 10);
    const score = Math.min(99, Math.max(30, base));
    const why =
      evidenceCount >= 4
        ? `High confidence — ${evidenceCount} evidence signals across ${evidenceTypeCount} distinct types.`
        : evidenceCount >= 2
        ? `Moderate confidence — ${evidenceCount} supporting evidence items across ${evidenceTypeCount} type(s).`
        : `Low confidence — only ${evidenceCount} supporting evidence item(s). More data needed.`;
    return { score, why };
  }
}

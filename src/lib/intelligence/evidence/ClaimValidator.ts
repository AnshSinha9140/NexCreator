import { RawEvidence } from "./EvidenceTypes";

export class ClaimValidator {
  private static readonly GAMEPLAY_KEYWORDS = ["clutch", "1v4", "kill", "bug", "win", "death", "defeat"];
  private static readonly LAUGHTER_KEYWORDS = ["laugh", "funny", "kekw", "lol", "joke", "comedy", "hilarious"];
  private static readonly RAGE_KEYWORDS = ["rage", "mad", "angry", "screamed", "salty", "tilt"];

  /**
   * Scans a string (such as an AI-generated title, description, or coaching tip)
   * sentence by sentence. If a sentence asserts a claim that is unsupported by the
   * current session evidence, it is replaced with an evidence-backed statement.
   */
  public static validateAndCleanText(text: string, evidenceList: RawEvidence[]): string {
    if (!text) return "Not enough verified evidence to generate this insight.";

    const sentences = text.split(/(?<=[.!?])\s+/);
    const cleanedSentences = sentences.map((sentence) => {
      const lower = sentence.toLowerCase();

      // Check gameplay claims
      const hasGameplayClaim = this.GAMEPLAY_KEYWORDS.some((kw) => lower.includes(kw));
      if (hasGameplayClaim) {
        const hasGameplayEvidence = evidenceList.some((ev) =>
          ev.chatSample.some((msg) => {
            const mLower = msg.toLowerCase();
            return mLower.includes("gg") || mLower.includes("clutch") || mLower.includes("win") || mLower.includes("kill") || mLower.includes("nice");
          })
        );
        if (!hasGameplayEvidence) {
          return "Activity and viewer focus shifted significantly during this broadcast window.";
        }
      }

      // Check laughter claims
      const hasLaughterClaim = this.LAUGHTER_KEYWORDS.some((kw) => lower.includes(kw));
      if (hasLaughterClaim) {
        const hasLaughterEvidence = evidenceList.some((ev) =>
          ev.type === "REACTION_BURST" ||
          ev.chatSample.some((msg) => {
            const mLower = msg.toLowerCase();
            return mLower.includes("😂") || mLower.includes("kekw") || mLower.includes("lol") || mLower.includes("lmao") || mLower.includes("haha");
          })
        );
        if (!hasLaughterEvidence) {
          return "Chat message frequency rose, marking high viewer engagement.";
        }
      }

      // Check rage/anger claims
      const hasRageClaim = this.RAGE_KEYWORDS.some((kw) => lower.includes(kw));
      if (hasRageClaim) {
        const hasRageEvidence = evidenceList.some((ev) =>
          ev.type === "SENTIMENT_SHIFT" &&
          ev.sourceMetrics.sentimentDelta !== undefined &&
          ev.sourceMetrics.sentimentDelta < -10
        );
        if (!hasRageEvidence) {
          return "Viewer response patterns shifted in this segment.";
        }
      }

      return sentence;
    });

    return cleanedSentences.filter(Boolean).join(" ");
  }

  /**
   * Deterministically clean a title based strictly on the strongest evidence type.
   */
  public static generateTitleFromEvidence(evidenceList: RawEvidence[]): string {
    if (!evidenceList || evidenceList.length === 0) {
      return "Not enough verified evidence to generate this title.";
    }

    // Sort evidence by confidence descending
    const sorted = [...evidenceList].sort((a, b) => b.confidence - a.confidence);
    const primary = sorted[0];

    // Extract real sample text or emote triggers dynamically
    const sampleMsgs = primary.chatSample || [];
    const firstMsg = sampleMsgs.length > 0 ? sampleMsgs[0].replace(/[^\w\s!?]/gi, "").trim() : "";
    const firstWords = firstMsg ? `"${firstMsg.split(" ").slice(0, 4).join(" ")}..."` : "";

    // Extract velocity / metrics
    const vel = primary.sourceMetrics?.velocity ? `${primary.sourceMetrics.velocity} msgs/min` : "";
    const questions = primary.sourceMetrics?.questionCount ?? 0;

    switch (primary.type) {
      case "QUESTION_WAVE":
        return questions > 0
          ? `Viewer Q&A Surge: ${questions} Questions Asked in Chat`
          : `Community Q&A Discussion Wave`;

      case "CHAT_EXPLOSION":
        return firstWords
          ? `Chat Explosion: ${firstWords}`
          : vel
          ? `Community Velocity Spike at ${vel}`
          : `Massive Chat Velocity Explosion`;

      case "VIEWER_SPIKE":
        return primary.sourceMetrics?.viewerDelta && primary.sourceMetrics.viewerDelta > 0
          ? `Viewer Influx Surge (+${primary.sourceMetrics.viewerDelta} Viewers)`
          : `Broadcast Audience Arrival Spike`;

      case "SENTIMENT_SHIFT":
        return firstWords
          ? `Audience Sentiment Shift: ${firstWords}`
          : `Audience Reaction & Sentiment Outbreak`;

      case "CONVERSATION_BURST":
        return firstWords
          ? `Community Discussion: ${firstWords}`
          : `High Dialogue Diversity & Discussion Burst`;

      case "REACTION_BURST":
        return sampleMsgs.length > 0
          ? `Emote & Reaction Surge — Chat Reacts Live`
          : `Community Emote Expression Wave`;

      default:
        return firstWords
          ? `Stream Focus Window: ${firstWords}`
          : `Peak Broadcast Engagement Window`;
    }
  }
}

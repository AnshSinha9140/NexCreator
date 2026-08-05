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

    switch (primary.type) {
      case "QUESTION_WAVE":
        return `Viewer Questions Surge During Discussion (Confidence: ${primary.confidence}%)`;
      case "CHAT_EXPLOSION":
        return `Community Engagement Velocity Peaks (Confidence: ${primary.confidence}%)`;
      case "VIEWER_SPIKE":
        return `Broadcast Viewer Count Outbreak (Confidence: ${primary.confidence}%)`;
      case "SENTIMENT_SHIFT":
        return `Audience Sentiment Shift Detected (Confidence: ${primary.confidence}%)`;
      case "CONVERSATION_BURST":
        return `Audience Discussion Generates High Dialogue Diversity (Confidence: ${primary.confidence}%)`;
      case "REACTION_BURST":
        return `Community Emote Expression Wave (Confidence: ${primary.confidence}%)`;
      default:
        return `Audience Activity Focus Window (Confidence: ${primary.confidence}%)`;
    }
  }
}

import { AIInsight, AIInsightType, AIInsightSeverity } from "./types";
import { PulseSnapshot } from "@/lib/snapshot/types";

export class AIResponseParser {
  /**
   * Strictly parses raw LLM JSON response string.
   * Throws an Error if JSON is malformed or missing required fields.
   */
  static parseRawContent(
    rawContent: string,
    snapshot: PulseSnapshot
  ): Omit<AIInsight, "id" | "createdAt" | "snapshotVersion" | "sourceModel" | "modelVersion" | "promptVersion" | "provider" | "model" | "fallbackUsed"> {
    let cleaned = (rawContent || "").trim();
    if (cleaned.startsWith("```")) {
      const lines = cleaned.split("\n");
      if (lines[0].startsWith("```")) lines.shift();
      if (lines[lines.length - 1].startsWith("```")) lines.pop();
      cleaned = lines.join("\n").trim();
    }

    const parsed = JSON.parse(cleaned);

    // Validate required fields
    if (!parsed.type || !parsed.severity || !parsed.title || !parsed.summary || !parsed.recommendation) {
      throw new Error("Missing required fields in parsed LLM JSON response");
    }

    return {
      creatorId: snapshot.creatorId,
      sessionId: snapshot.sessionId,
      snapshotId: snapshot.snapshotId,
      platform: snapshot.platform,
      timestamp: new Date().toISOString(),
      type: parsed.type as AIInsightType,
      severity: parsed.severity as AIInsightSeverity,
      title: parsed.title,
      summary: parsed.summary,
      recommendation: parsed.recommendation,
      confidence: typeof parsed.confidence === "number" ? parsed.confidence : 0.8,
      topics: Array.isArray(parsed.topics) ? parsed.topics : [],
    };
  }

  /**
   * Parses LLM content, falling back gracefully to generateFallbackInsight if JSON parsing fails.
   */
  static parseInsight(
    rawContent: string,
    snapshot: PulseSnapshot
  ): Omit<AIInsight, "id" | "createdAt" | "snapshotVersion" | "sourceModel" | "modelVersion" | "promptVersion"> {
    try {
      return this.parseRawContent(rawContent, snapshot);
    } catch (error) {
      console.warn("[AIResponseParser] Failed to parse raw LLM JSON response, generating fallback insight.", error);
      return this.generateFallbackInsight(snapshot);
    }
  }

  /**
   * Generates deterministic Level 3 Rule-Based Insight from snapshot metrics.
   */
  static generateFallbackInsight(
    snapshot: PulseSnapshot
  ): Omit<AIInsight, "id" | "createdAt" | "snapshotVersion" | "sourceModel" | "modelVersion" | "promptVersion"> {
    const mpm = snapshot.metrics.messagesPerMinute;

    let type: AIInsightType = "stream_summary";
    let severity: AIInsightSeverity = "info";
    let title = "Stream Pacing Stable";
    let summary = `Chat velocity is steady at ${Math.round(mpm)} messages per minute.`;
    let recommendation = "Maintain your current pacing and interaction flow.";

    if (snapshot.engagementSignals?.includes("hype_moment")) {
      type = "engagement_opportunity";
      severity = "info";
      title = "Hype Moment Detected";
      summary = "Chat velocity spiked rapidly with high excitement.";
      recommendation = "Acknowledge the hype and interact with active chatters.";
    } else if (snapshot.engagementSignals?.includes("question_heavy")) {
      type = "content_recommendation";
      severity = "info";
      title = "Questions in Chat";
      summary = "Multiple audience questions detected in the current window.";
      recommendation = "Take a moment for a brief Q&A session to engage chat.";
    }

    return {
      creatorId: snapshot.creatorId,
      sessionId: snapshot.sessionId,
      snapshotId: snapshot.snapshotId,
      platform: snapshot.platform,
      timestamp: new Date().toISOString(),
      type,
      severity,
      title,
      summary,
      recommendation,
      confidence: 1.0,
      topics: ["rule_engine", "fallback"],
    };
  }
}

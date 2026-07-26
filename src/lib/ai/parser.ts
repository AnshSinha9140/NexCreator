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
      confidence: typeof parsed.confidence === "number" ? parsed.confidence : 0.85,
      topics: Array.isArray(parsed.topics) ? parsed.topics : [],
      sourceBadge: "ai_analysis",
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
   * Generates deterministic Level 3 Rule-Based Insight from snapshot metrics & events.
   */
  static generateFallbackInsight(
    snapshot: PulseSnapshot,
    events: any[] = []
  ): Omit<AIInsight, "id" | "createdAt" | "snapshotVersion" | "sourceModel" | "modelVersion" | "promptVersion"> {
    const mpm = snapshot.metrics?.messagesPerMinute || 0;
    const questions = snapshot.metrics?.questionCount || 0;
    const signals = snapshot.engagementSignals || [];
    const primaryEvent = events[0];

    let type: AIInsightType = "stream_summary";
    let severity: AIInsightSeverity = "info";
    let title = "Stream Pacing Stable";
    let summary = `Chat velocity is steady at ${Math.round(mpm)} messages per minute.`;
    let recommendation = "Maintain your current pacing and interaction flow.";

    if (primaryEvent?.type === "viewer_drop") {
      type = "retention_alert";
      severity = "warning";
      title = "Viewer Drop Detected";
      summary = primaryEvent.reason || "Viewer count dipped in current window.";
      recommendation = "Ask your audience a direct question or increase commentary energy to re-engage viewers.";
    } else if (primaryEvent?.type === "chat_velocity_spike" || signals.includes("hype_moment")) {
      type = "engagement_opportunity";
      severity = "info";
      title = "Hype Moment Detected";
      summary = `Chat velocity spiked to ${Math.round(mpm)} msg/min.`;
      recommendation = "Acknowledge the hype and interact with active chatters.";
    } else if (primaryEvent?.type === "question_surge" || questions >= 5) {
      type = "content_recommendation";
      severity = "info";
      title = "Question Surge in Chat";
      summary = `${questions} audience questions detected in current window.`;
      recommendation = "Pause briefly for a dedicated Q&A session to answer viewer questions.";
    } else if (primaryEvent?.type === "spam_detected" || signals.includes("spam_spike")) {
      type = "pacing_advice";
      severity = "warning";
      title = "Spam Surge Detected";
      summary = "High volume of repeated spam detected in chat.";
      recommendation = "Consider turning on chat slow mode or calling on moderators.";
    } else if (primaryEvent?.type === "stream_silence" || primaryEvent?.type === "energy_drop") {
      type = "pacing_advice";
      severity = "warning";
      title = "Quiet Period Detected";
      summary = "Chat activity dropped during quiet window.";
      recommendation = "Narrate your active gameplay thoughts or start a new topic.";
    } else if (primaryEvent?.type === "topic_shift") {
      type = "content_recommendation";
      severity = "info";
      title = "Stream Topic Shift";
      summary = primaryEvent.reason || "Category/topic changed.";
      recommendation = "Give a quick channel update explaining the new topic to incoming viewers.";
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
      topics: ["rule_engine"],
      sourceBadge: "instant_rule",
    };
  }
}

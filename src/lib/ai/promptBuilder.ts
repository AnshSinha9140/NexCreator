import { PulseSnapshot } from "@/lib/snapshot/types";
import { PromptPayload } from "./types";
import { AIInsight } from "./types";

export class PromptBuilder {
  static buildPrompt(
    currentSnapshot: PulseSnapshot,
    previousInsights: AIInsight[]
  ): PromptPayload {
    // Minimize payload to essential data
    const compactedSnapshot = {
      windowStart: currentSnapshot.windowStart,
      windowEnd: currentSnapshot.windowEnd,
      durationSeconds: currentSnapshot.durationSeconds,
      metrics: {
        totalMessages: currentSnapshot.metrics.totalMessages,
        messagesPerMinute: currentSnapshot.metrics.messagesPerMinute,
        uniqueChattersCount: currentSnapshot.metrics.uniqueChattersCount,
        topEmojis: currentSnapshot.metrics.topEmojis.slice(0, 5),
        topWords: currentSnapshot.metrics.topWords.slice(0, 5),
      },
      analytics: currentSnapshot.analytics || {
        velocity: currentSnapshot.metrics.messagesPerMinute,
        sentiment: 50,
        engagement: 0,
        momentum: 50,
        hypeScore: 0,
      },
      viewerMetrics: currentSnapshot.viewerMetrics,
      engagementSignals: currentSnapshot.engagementSignals,
      representativeMessages: currentSnapshot.representativeMessages.map(m => ({
        text: m.text,
        category: m.category,
      })),
    };

    const compactedInsights = previousInsights.slice(0, 3).map(i => ({
      type: i.type,
      severity: i.severity,
      summary: i.summary,
    }));

    const systemPrompt = `You are NexCreator AI, an expert stream analyst.
Analyze the provided PulseSnapshot of stream chat and viewer data.

CRITICAL CONSTRAINT: You are analyzing text chat telemetry only. You DO NOT have visual access to the video stream. Do not hallucinate or invent specific on-screen events (e.g., winning a game, clutching a match, or specific gameplay mechanics). Your suggested titles, summaries, and notes must be based strictly on the audience's reaction, the exact text/emotes used in chat, and the emotional sentiment provided. If the context is ambiguous, rely on general hype terms (e.g., 'Massive Viewer Reaction') rather than guessing the gameplay event.

Provide exactly ONE insight in strictly valid JSON format.
The output MUST adhere to the following schema:
{
  "type": "retention_alert" | "engagement_opportunity" | "content_recommendation" | "pacing_advice" | "stream_summary",
  "severity": "info" | "warning" | "critical",
  "title": "Brief title (under 50 chars)",
  "summary": "Clear, concise summary of what is happening",
  "recommendation": "Actionable advice for the creator",
  "confidence": number between 0 and 1,
  "topics": ["array", "of", "relevant", "keywords"]
}
Do not include markdown blocks, just the JSON string.`;

    const userPrompt = JSON.stringify({
      currentSnapshot: compactedSnapshot,
      recentInsights: compactedInsights,
    });

    return {
      systemPrompt,
      userPrompt,
      snapshotId: currentSnapshot.snapshotId,
      sessionId: currentSnapshot.sessionId,
      creatorId: currentSnapshot.creatorId,
    };
  }
}

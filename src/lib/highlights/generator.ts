import clientPromise from "@/lib/mongodb";
import { PulseSnapshot } from "@/lib/snapshot/types";
import { TimelinePublisher } from "@/lib/timeline/publisher";

export interface HighlightCandidate {
  id: string;
  sessionId: string;
  creatorId: string;
  platform: string;
  title: string;
  triggerReason: string;
  type: "velocity_spike" | "viewer_spike" | "momentum_spike" | "hype_spike" | "question_surge";
  score: number;
  windowStart: string;
  windowEnd: string;
  metrics: {
    messagesPerMinute: number;
    viewerCount: number | null;
    questionCount: number;
  };
  sampleMessages: string[];
  createdAt: string;
}

export class HighlightGenerator {
  public static async evaluateSnapshot(snapshot: PulseSnapshot): Promise<HighlightCandidate | null> {
    const { sessionId, creatorId, platform, metrics, viewerMetrics, representativeMessages, windowStart, windowEnd } = snapshot;

    let isSpike = false;
    let triggerReason = "";
    let type: HighlightCandidate["type"] = "velocity_spike";
    let score = 75;

    const mpm = metrics.messagesPerMinute || 0;
    const viewers = viewerMetrics?.averageViewerCount || 0;
    const questions = metrics.questionCount || 0;

    if (mpm > 20) {
      isSpike = true;
      type = "velocity_spike";
      triggerReason = `Chat Velocity Spike: High activity at ${mpm} messages/min.`;
      score = Math.min(98, 80 + Math.floor(mpm / 5));
    } else if (questions >= 5) {
      isSpike = true;
      type = "question_surge";
      triggerReason = `Audience Curiosity Surge: ${questions} questions asked in window.`;
      score = 85;
    } else if (viewers > 500 && mpm > 10) {
      isSpike = true;
      type = "viewer_spike";
      triggerReason = `High Engagement: ${viewers.toLocaleString()} live viewers active in chat.`;
      score = 88;
    } else if (metrics.totalMessages >= 10) {
      // Baseline candidate for demonstration during test streams
      isSpike = true;
      type = "momentum_spike";
      triggerReason = `Stream Momentum Building: ${metrics.totalMessages} chat messages processed.`;
      score = 78;
    }

    if (!isSpike) return null;

    const highlightDoc: HighlightCandidate = {
      id: `hl_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      sessionId,
      creatorId,
      platform,
      title: `${platform.toUpperCase()} Highlight: ${type.replace("_", " ").toUpperCase()}`,
      triggerReason,
      type,
      score,
      windowStart: typeof windowStart === "string" ? windowStart : new Date(windowStart).toISOString(),
      windowEnd: typeof windowEnd === "string" ? windowEnd : new Date(windowEnd).toISOString(),
      metrics: {
        messagesPerMinute: mpm,
        viewerCount: viewerMetrics?.averageViewerCount || null,
        questionCount: questions,
      },
      sampleMessages: representativeMessages.slice(0, 5).map((m) => m.text),
      createdAt: new Date().toISOString(),
    };

    try {
      const client = await clientPromise;
      const db = client.db("nexcreator");
      await db.collection("highlight_candidates").insertOne(highlightDoc);
      console.log(`[HighlightGenerator] Persisted highlight candidate '${highlightDoc.title}' for session '${sessionId}' ✅`);

      // Publish timeline event for the highlight candidate
      await TimelinePublisher.publish(
        sessionId,
        platform as any,
        "HIGHLIGHT_GENERATED",
        "🌟 Highlight Candidate Created",
        `${triggerReason} (Score: ${score}/100)`,
        "success",
        { highlightId: highlightDoc.id, type, score }
      );

      return highlightDoc;
    } catch (err: any) {
      console.warn(`[HighlightGenerator] Failed to persist highlight for session '${sessionId}':`, err.message);
      return null;
    }
  }
}

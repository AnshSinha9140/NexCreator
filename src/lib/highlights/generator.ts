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
    const { sessionId, creatorId, platform, metrics, viewerMetrics, representativeMessages, windowStart, windowEnd, analytics } = snapshot;

    let isSpike = false;
    let triggerReason = "";
    let type: HighlightCandidate["type"] = "velocity_spike";
    let score = 75;

    const mpm = analytics?.velocity ?? (metrics.messagesPerMinute || 0);
    const momentum = analytics?.momentum ?? 50;
    const engagement = analytics?.engagement ?? 0;
    const hypeScore = analytics?.hypeScore ?? 0;
    const viewers = analytics?.viewers || viewerMetrics?.averageViewerCount || 0;
    const questions = analytics?.questionCount ?? (metrics.questionCount || 0);

    const sampleTexts = representativeMessages.map((m) => m.text.toUpperCase());
    const hasLaughWave = sampleTexts.some((t) => t.includes("KEKW") || t.includes("LAUGH") || t.includes("😂") || t.includes("💀"));
    const hasGGSpike = sampleTexts.some((t) => t.includes("GG") || t.includes("🎉") || t.includes("W"));
    const hasFireExplosion = sampleTexts.some((t) => t.includes("FIRE") || t.includes("🔥") || t.includes("🚀"));

    if (hasLaughWave) {
      isSpike = true;
      type = "hype_spike";
      triggerReason = `Community Laugh Wave: Massive outbreak of laughter detected.`;
      score = 92;
    } else if (hasGGSpike) {
      isSpike = true;
      type = "hype_spike";
      triggerReason = `Massive GG Celebration: Victory surge across chat.`;
      score = 90;
    } else if (hasFireExplosion) {
      isSpike = true;
      type = "hype_spike";
      triggerReason = `Fire Emoji Explosion: High-energy crowd hype spike.`;
      score = 95;
    } else if (mpm >= 15) {
      isSpike = true;
      type = "velocity_spike";
      triggerReason = `Chat Velocity Spike: High activity at ${mpm} msgs/min.`;
      score = Math.min(98, 80 + Math.floor(mpm / 4));
    } else if (momentum >= 65) {
      isSpike = true;
      type = "momentum_spike";
      triggerReason = `Audience Momentum Spike: Dynamic acceleration at ${momentum}/100.`;
      score = Math.min(95, 75 + Math.floor(momentum / 5));
    } else if (questions >= 3) {
      isSpike = true;
      type = "question_surge";
      triggerReason = `Audience Curiosity Surge: ${questions} questions asked in window.`;
      score = 85;
    } else if (hypeScore >= 50) {
      isSpike = true;
      type = "hype_spike";
      triggerReason = `Hype Surge Detected: Hype Score reached ${hypeScore}%.`;
      score = Math.min(98, 82 + Math.floor(hypeScore / 6));
    } else if (metrics.totalMessages >= 5) {
      isSpike = true;
      type = "momentum_spike";
      triggerReason = `Stream Momentum Building: ${metrics.totalMessages} chat messages processed.`;
      score = 78;
    }


    if (!isSpike) {
      console.log(`[HighlightGenerator] ⏭️ Snapshot '${snapshot.snapshotId}' evaluated: REJECTED (Velocity: ${mpm}, Momentum: ${momentum}, Hype: ${hypeScore})`);
      return null;
    }

    console.log(`[HighlightGenerator] ✅ Snapshot '${snapshot.snapshotId}' evaluated: ACCEPTED (${triggerReason})`);

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

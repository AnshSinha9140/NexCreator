import { PulseSnapshot } from "@/lib/snapshot/types";
import { AudienceMood, MoodType, MoodTransition } from "./types";

export class AudienceMoodAnalyzer {
  public static analyze(snapshot: PulseSnapshot, previousMood?: AudienceMood | null): AudienceMood {
    const { sessionId, snapshotId, metrics, analytics, createdAt } = snapshot;
    const timeStr = new Date(createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    const sentimentScore = analytics?.sentiment ?? 50;
    const hypeScore = analytics?.hypeScore ?? 0;
    const momentumIndex = analytics?.momentum ?? 50;
    const questionCount = analytics?.questionCount ?? (metrics.questionCount || 0);
    const mpm = analytics?.velocity ?? (metrics.messagesPerMinute || 0);

    let rawMood: MoodType = "Relaxed";
    let confidence = 88;
    let evidence = "Balanced chat activity and baseline sentiment.";
    let explanation = "The audience is calmly following the broadcast stream.";

    if (hypeScore >= 65 || (sentimentScore >= 80 && mpm >= 15)) {
      rawMood = "Hyped";
      confidence = 96;
      evidence = `High hype score (${hypeScore}%) and peak sentiment (${sentimentScore}/100).`;
      explanation = "Chat is exploding with excitement, emotes, and positive hype!";
    } else if (questionCount >= 2) {
      rawMood = "Curious";
      confidence = 92;
      evidence = `Surge of ${questionCount} questions detected in snapshot window.`;
      explanation = "Viewers are actively asking questions about settings, gameplay, or decisions.";
    } else if (sentimentScore >= 70) {
      rawMood = "Excited";
      confidence = 90;
      evidence = `Positive sentiment score of ${sentimentScore}/100.`;
      explanation = "The community is enjoying the content and reacting positively.";
    } else if (sentimentScore <= 35 && mpm >= 8) {
      rawMood = "Frustrated";
      confidence = 91;
      evidence = `Negative sentiment drop (${sentimentScore}/100) with active chat.`;
      explanation = "Viewers are expressing dissatisfaction or stream technical issues.";
    } else if (mpm <= 2 && metrics.totalMessages < 5) {
      rawMood = "Waiting";
      confidence = 85;
      evidence = `Very low message rate (${mpm} msgs/min).`;
      explanation = "Chat is passive and awaiting streamer commentary or exciting gameplay events.";
    }

    // Mood Stability & Hysteresis Smoothing
    let primaryMood: MoodType = rawMood;

    if (previousMood && previousMood.primaryMood !== rawMood) {
      const prevMood = previousMood.primaryMood;
      const lastTransitionTime = previousMood.createdAt ? new Date(previousMood.createdAt).getTime() : 0;
      const timeSinceLastTransition = Date.now() - lastTransitionTime;

      // Prevent oscillation within 2 minutes unless backed by high confidence surge
      if (timeSinceLastTransition < 120000 && confidence < 95) {
        // Retain previous mood for stability
        primaryMood = prevMood;
        evidence = `[Stabilized] Retained ${prevMood} mood due to rapid transition buffer (confidence: ${confidence}%).`;
      }
    }

    // Build cumulative Mood Timeline
    const isNewTransition = !previousMood || previousMood.primaryMood !== primaryMood;
    let moodTimeline = previousMood?.moodTimeline ? [...previousMood.moodTimeline] : [];

    if (isNewTransition) {
      const newTransition: MoodTransition = {
        timestamp: timeStr,
        snapshotId,
        fromMood: previousMood?.primaryMood || "Waiting",
        toMood: primaryMood,
        reason: evidence,
        confidence,
      };
      moodTimeline.push(newTransition);
    }

    return {
      sessionId,
      snapshotId,
      primaryMood,
      confidence,
      evidence,
      explanation,
      contributingAnalytics: {
        sentimentScore,
        hypeScore,
        momentumIndex,
        questionCount,
      },
      moodTimeline,
      createdAt: new Date().toISOString(),
    };
  }
}


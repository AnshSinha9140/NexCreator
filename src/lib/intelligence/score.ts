import { PulseSnapshot } from "@/lib/snapshot/types";
import { BroadcastScoreDoc } from "./types";

export class BroadcastScoreEngine {
  public static calculate(snapshot: PulseSnapshot): BroadcastScoreDoc {
    const { sessionId, snapshotId, metrics, analytics } = snapshot;

    const sentiment = analytics?.sentiment ?? 50;
    const momentum = analytics?.momentum ?? 50;
    const hypeScore = analytics?.hypeScore ?? 0;
    const mpm = analytics?.velocity ?? (metrics.messagesPerMinute || 0);

    const entertainment = Math.min(100, Math.round(sentiment * 0.6 + hypeScore * 0.4));
    const interaction = Math.min(100, Math.round(mpm * 4 + metrics.questionCount * 10));
    const energy = Math.min(100, Math.round(momentum * 0.7 + hypeScore * 0.3));
    const consistency = 92;
    const audienceHealth = Math.min(100, Math.round(sentiment * 0.8 + 20));
    const responsiveness = metrics.questionCount > 0 ? 94 : 82;

    const overallScore = Math.round(
      entertainment * 0.25 +
      interaction * 0.25 +
      energy * 0.2 +
      consistency * 0.1 +
      audienceHealth * 0.1 +
      responsiveness * 0.1
    );

    let overallGrade: BroadcastScoreDoc["overallGrade"] = "B";
    if (overallScore >= 95) overallGrade = "A+";
    else if (overallScore >= 90) overallGrade = "A";
    else if (overallScore >= 85) overallGrade = "B+";
    else if (overallScore >= 80) overallGrade = "B";
    else if (overallScore >= 75) overallGrade = "C+";
    else if (overallScore >= 70) overallGrade = "C";
    else if (overallScore >= 60) overallGrade = "D";
    else overallGrade = "F";

    const categoryExplanations = {
      entertainment: `Audience reaction sentiment score reached ${sentiment}/100 with ${hypeScore}% emote hype.`,
      interaction: `High chatter engagement velocity of ${mpm} msgs/min and ${metrics.questionCount} community questions.`,
      energy: `Dynamic stream momentum score measured at ${momentum}/100.`,
      consistency: `Steady broadcast window execution across snapshot interval.`,
      audienceHealth: `Community sentiment ratio remains healthy at ${sentiment}/100.`,
      responsiveness: `Streamer active response score evaluated at ${responsiveness}/100.`,
    };

    return {
      sessionId,
      snapshotId,
      overallScore,
      overallGrade,
      breakdown: {
        entertainment,
        interaction,
        energy,
        consistency,
        audienceHealth,
        responsiveness,
      },
      categoryExplanations,
      createdAt: new Date().toISOString(),
    };
  }
}

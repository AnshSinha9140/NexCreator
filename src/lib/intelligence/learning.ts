import { PulseSnapshot } from "@/lib/snapshot/types";
import { CoachRecommendation } from "./types";
import { RecommendationMemory } from "./memory";

export interface SessionLearningRecord {
  recommendationId: string;
  intentKey: string;
  issuedAt: string;
  initialMpm: number;
  initialSentiment: number;
  subsequentMpm?: number;
  subsequentSentiment?: number;
  outcome: "successful" | "unsuccessful" | "pending";
}

export class ContinuousSessionLearningEngine {
  private static sessionLearnings = new Map<string, SessionLearningRecord[]>();

  public static recordIssuedRecommendation(snapshot: PulseSnapshot, recommendation: CoachRecommendation): void {
    const sessionId = snapshot.sessionId;
    if (!this.sessionLearnings.has(sessionId)) {
      this.sessionLearnings.set(sessionId, []);
    }

    const records = this.sessionLearnings.get(sessionId)!;
    records.push({
      recommendationId: recommendation.id,
      intentKey: recommendation.intentKey,
      issuedAt: typeof snapshot.createdAt === "string" ? snapshot.createdAt : new Date(snapshot.createdAt).toISOString(),

      initialMpm: snapshot.analytics?.velocity ?? (snapshot.metrics.messagesPerMinute || 0),
      initialSentiment: snapshot.analytics?.sentiment ?? 50,
      outcome: "pending",
    });
  }

  public static evaluateSessionOutcomes(snapshot: PulseSnapshot): void {
    const sessionId = snapshot.sessionId;
    const records = this.sessionLearnings.get(sessionId) || [];
    const currentMpm = snapshot.analytics?.velocity ?? (snapshot.metrics.messagesPerMinute || 0);
    const currentSentiment = snapshot.analytics?.sentiment ?? 50;

    const memory = RecommendationMemory.getForSession(sessionId);

    for (const record of records) {
      if (record.outcome === "pending") {
        const timeDiff = new Date(snapshot.createdAt).getTime() - new Date(record.issuedAt).getTime();
        // Check outcome after at least 1 minute snapshot window
        if (timeDiff >= 60000) {
          record.subsequentMpm = currentMpm;
          record.subsequentSentiment = currentSentiment;

          // Velocity improvement or sentiment boost signifies success
          if (currentMpm > record.initialMpm || currentSentiment > record.initialSentiment) {
            record.outcome = "successful";
          } else {
            record.outcome = "unsuccessful";
          }

          // Sync outcome to memory
          const recInMemory = memory.recommendations.find((r) => r.id === record.recommendationId);
          if (recInMemory) {
            recInMemory.outcome = record.outcome;
          }
        }
      }
    }
  }

  public static getSuccessRateForIntent(sessionId: string, intentKey: string): number {
    const records = this.sessionLearnings.get(sessionId) || [];
    const intentRecords = records.filter((r) => r.intentKey === intentKey && r.outcome !== "pending");
    if (intentRecords.length === 0) return 1.0; // default baseline

    const successful = intentRecords.filter((r) => r.outcome === "successful").length;
    return successful / intentRecords.length;
  }
}

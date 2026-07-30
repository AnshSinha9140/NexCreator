import { CoachRecommendation } from "./types";

export class RecommendationMemory {
  private static sessionMemories = new Map<string, RecommendationMemory>();

  public sessionId: string;
  public recommendations: CoachRecommendation[] = [];

  private constructor(sessionId: string) {
    this.sessionId = sessionId;
  }

  public static getForSession(sessionId: string): RecommendationMemory {
    if (!this.sessionMemories.has(sessionId)) {
      this.sessionMemories.set(sessionId, new RecommendationMemory(sessionId));
    }
    return this.sessionMemories.get(sessionId)!;
  }

  public record(recommendation: CoachRecommendation): void {
    const existingIdx = this.recommendations.findIndex((r) => r.id === recommendation.id);
    if (existingIdx >= 0) {
      this.recommendations[existingIdx] = recommendation;
    } else {
      this.recommendations.push(recommendation);
    }
  }

  public getActiveRecommendations(): CoachRecommendation[] {
    return this.recommendations.filter(
      (r) => r.status === "ACTIVE" || r.status === "NEW" || r.status === "ACKNOWLEDGED"
    );
  }

  public getCompletedRecommendations(): CoachRecommendation[] {
    return this.recommendations.filter((r) => r.status === "COMPLETED");
  }

  public getExpiredRecommendations(): CoachRecommendation[] {
    return this.recommendations.filter((r) => r.status === "EXPIRED");
  }

  public getDismissedRecommendations(): CoachRecommendation[] {
    return this.recommendations.filter((r) => r.status === "SUPERSEDED" || r.status === "EXPIRED");
  }

  public findByIntent(intentKey: string): CoachRecommendation | undefined {
    return this.recommendations
      .filter((r) => r.intentKey === intentKey)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
  }

  public isRecentlyCompletedOrActive(intentKey: string, ttlMs: number = 300000): boolean {
    const recent = this.findByIntent(intentKey);
    if (!recent) return false;

    if (recent.status === "ACTIVE" || recent.status === "NEW" || recent.status === "ACKNOWLEDGED") {
      return true;
    }

    if (recent.status === "COMPLETED" || recent.status === "EXPIRED") {
      const timeSince = Date.now() - new Date(recent.updatedAt || recent.createdAt).getTime();
      if (timeSince < ttlMs) {
        return true;
      }
    }

    return false;
  }

  public clear(): void {
    this.recommendations = [];
  }
}

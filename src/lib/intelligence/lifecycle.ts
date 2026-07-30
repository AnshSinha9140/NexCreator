import { PulseSnapshot } from "@/lib/snapshot/types";
import { CoachRecommendation } from "./types";
import { RecommendationMemory } from "./memory";

export class RecommendationLifecycleEngine {
  public static processLifecycle(
    snapshot: PulseSnapshot,
    newRecommendations: CoachRecommendation[]
  ): { active: CoachRecommendation[]; expired: CoachRecommendation[]; completed: CoachRecommendation[] } {
    const memory = RecommendationMemory.getForSession(snapshot.sessionId);
    const existing = memory.recommendations;
    const now = Date.now();

    const mpm = snapshot.analytics?.velocity ?? (snapshot.metrics.messagesPerMinute || 0);
    const questions = snapshot.analytics?.questionCount ?? (snapshot.metrics.questionCount || 0);

    const expired: CoachRecommendation[] = [];
    const completed: CoachRecommendation[] = [];

    // Evaluate active/new recommendations in memory
    for (const rec of existing) {
      if (rec.status === "NEW" || rec.status === "ACTIVE" || rec.status === "ACKNOWLEDGED") {
        let isComplete = false;
        let isExpired = false;

        // Check completion conditions
        if (rec.intentKey === "INTENT_QA_PAUSE" && questions === 0) {
          isComplete = true;
          rec.outcome = "successful";
        } else if (rec.intentKey === "INTENT_CHAT_QUESTION" && mpm > 5) {
          isComplete = true;
          rec.outcome = "successful";
        }

        // Check expiration conditions (time TTL or condition drop)
        const ageMs = now - new Date(rec.createdAt).getTime();
        if (ageMs > 300000) { // 5 minutes TTL
          isExpired = true;
        }

        if (isComplete) {
          rec.status = "COMPLETED";
          rec.completedAt = new Date().toISOString();
          rec.updatedAt = new Date().toISOString();
          completed.push(rec);
        } else if (isExpired) {
          rec.status = "EXPIRED";
          rec.updatedAt = new Date().toISOString();
          expired.push(rec);
        }
      }
    }

    // Process newly generated recommendations
    const active: CoachRecommendation[] = [];

    for (const newRec of newRecommendations) {
      const existingSameIntent = memory.findByIntent(newRec.intentKey);

      if (existingSameIntent && (existingSameIntent.status === "ACTIVE" || existingSameIntent.status === "ACKNOWLEDGED")) {
        // Upgrade confidence/evidence if higher, keep active ID
        existingSameIntent.confidence = Math.max(existingSameIntent.confidence, newRec.confidence);
        existingSameIntent.evidenceList = [...existingSameIntent.evidenceList, ...newRec.evidenceList];
        existingSameIntent.updatedAt = new Date().toISOString();
        memory.record(existingSameIntent);
        active.push(existingSameIntent);
      } else {
        newRec.status = "ACTIVE";
        newRec.expiresAt = new Date(now + 300000).toISOString();
        memory.record(newRec);
        active.push(newRec);
      }
    }

    return {
      active,
      expired,
      completed,
    };
  }
}

/**
 * Sprint 19.3 — Memory Builder & Conversation State
 * Utility classes to build and update CreatorManagerMemory from incoming snapshot data.
 */

import { CreatorManagerMemory } from "./managerMemory";
import { StreamNarrativeBuilder } from "./narrativeBuilder";
import { PulseSnapshot } from "@/lib/snapshot/types";
import { CreatorIntelligenceBundle } from "@/lib/intelligence/types";

export class MemoryBuilder {
  static buildFromSnapshot(
    snapshot: PulseSnapshot | null,
    bundle?: CreatorIntelligenceBundle | null
  ): void {
    if (!snapshot) return;
    const sessionId = snapshot.sessionId;
    const snapshotId = snapshot.snapshotId;

    // 1. Update Mood
    if (bundle?.mood?.primaryMood) {
      CreatorManagerMemory.recordMood(sessionId, bundle.mood.primaryMood, snapshotId);
    }

    // 2. Evaluate & Update Narrative Phase
    const snapshotCount = bundle?.story?.milestones?.length ?? 1;
    const newPhase = StreamNarrativeBuilder.evaluatePhase(snapshot, bundle, snapshotCount);
    CreatorManagerMemory.setNarrativePhase(sessionId, newPhase);

    // 3. Track Advice Lifecycle (Followed vs Ignored)
    const mem = CreatorManagerMemory.getMemory(sessionId);
    const latestAdvice = CreatorManagerMemory.getLatestAdvice(sessionId);

    if (latestAdvice && latestAdvice.status === "SUGGESTED") {
      const qCount = snapshot.metrics?.questionCount ?? 0;
      const velocity = snapshot.analytics?.velocity ?? snapshot.metrics?.messagesPerMinute ?? 0;

      if (latestAdvice.intentKey === "INTENT_QA_PAUSE") {
        if (qCount <= 1 || velocity > 15) {
          CreatorManagerMemory.updateAdviceStatus(
            sessionId,
            latestAdvice.intentKey,
            "FOLLOWED",
            snapshotId,
            "That worked nicely. Chat immediately became more positive."
          );
        } else if (snapshotCount >= 3) {
          CreatorManagerMemory.updateAdviceStatus(
            sessionId,
            latestAdvice.intentKey,
            "IGNORED",
            snapshotId,
            "The unanswered questions are still building. I'd address them soon."
          );
        }
      }
    }

    // 4. Record new advice from bundle if present
    if (bundle?.coach && bundle.coach.length > 0) {
      const rec = bundle.coach[0];
      CreatorManagerMemory.recordAdvice(
        sessionId,
        rec.intentKey || rec.id,
        rec.title,
        rec.recommendation || rec.description,
        snapshotId
      );
    }
  }
}

export class ConversationState {
  static isDuplicateOrRecent(sessionId: string, text: string): boolean {
    const mem = CreatorManagerMemory.getMemory(sessionId);
    return mem.conversationLog.some((c) => c.statement.trim() === text.trim());
  }
}

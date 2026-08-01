/**
 * Sprint 19.3 — Creator Manager Memory Store
 * In-memory runtime session store tracking advice history, mood transitions,
 * highlights, and conversation logs per session.
 * NO MongoDB. NO persistence. NO polling. Pure runtime memory.
 */

import {
  CreatorManagerMemoryState,
  AdviceMemoryRecord,
  AdviceStatus,
  StreamNarrativePhase,
} from "./types";

export class CreatorManagerMemory {
  private static store: Map<string, CreatorManagerMemoryState> = new Map();

  static getMemory(sessionId: string): CreatorManagerMemoryState {
    if (!this.store.has(sessionId)) {
      const now = new Date().toISOString();
      const initialState: CreatorManagerMemoryState = {
        sessionId,
        startedAt: now,
        updatedAt: now,
        narrativePhase: "Beginning",
        adviceHistory: [],
        moodHistory: [],
        currentMood: "Relaxed",
        previousMood: null,
        dominantTopic: null,
        highlightHistory: [],
        mentionedClips: [],
        suggestedActionsHistory: [],
        confidenceTrend: [75],
        conversationLog: [],
      };
      this.store.set(sessionId, initialState);
    }
    return this.store.get(sessionId)!;
  }

  static recordAdvice(
    sessionId: string,
    intentKey: string,
    headline: string,
    adviceText: string,
    snapshotId: string
  ): AdviceMemoryRecord {
    const mem = this.getMemory(sessionId);
    const existing = mem.adviceHistory.find((a) => a.intentKey === intentKey && a.status === "SUGGESTED");

    if (existing) {
      existing.createdAt = new Date().toISOString();
      return existing;
    }

    const newRecord: AdviceMemoryRecord = {
      id: `adv_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      intentKey,
      headline,
      adviceText,
      snapshotId,
      createdAt: new Date().toISOString(),
      status: "SUGGESTED",
    };

    mem.adviceHistory.push(newRecord);
    mem.updatedAt = new Date().toISOString();
    return newRecord;
  }

  static updateAdviceStatus(
    sessionId: string,
    intentKey: string,
    newStatus: AdviceStatus,
    snapshotId: string,
    outcomeText?: string
  ): void {
    const mem = this.getMemory(sessionId);
    const rec = mem.adviceHistory.find((a) => a.intentKey === intentKey);
    if (rec) {
      rec.status = newStatus;
      rec.followedAtSnapshotId = snapshotId;
      if (outcomeText) rec.outcomeText = outcomeText;
      mem.updatedAt = new Date().toISOString();
    }
  }

  static getLatestAdvice(sessionId: string): AdviceMemoryRecord | null {
    const mem = this.getMemory(sessionId);
    return mem.adviceHistory.length > 0 ? mem.adviceHistory[mem.adviceHistory.length - 1] : null;
  }

  static recordMood(sessionId: string, moodStr: string, snapshotId: string): void {
    const mem = this.getMemory(sessionId);
    if (mem.currentMood !== moodStr) {
      mem.moodHistory.push({
        timestamp: new Date().toISOString(),
        snapshotId,
        fromMood: mem.currentMood,
        toMood: moodStr,
      });
      mem.previousMood = mem.currentMood;
      mem.currentMood = moodStr;
      mem.updatedAt = new Date().toISOString();
    }
  }

  static setNarrativePhase(sessionId: string, phase: StreamNarrativePhase): void {
    const mem = this.getMemory(sessionId);
    mem.narrativePhase = phase;
    mem.updatedAt = new Date().toISOString();
  }

  static recordConversationEntry(
    sessionId: string,
    snapshotId: string,
    statement: string,
    priority: string
  ): void {
    const mem = this.getMemory(sessionId);
    mem.conversationLog.push({
      id: `c_${Date.now()}`,
      snapshotId,
      statement,
      priority,
      timestamp: new Date().toISOString(),
    });
    mem.updatedAt = new Date().toISOString();
  }

  static clearSession(sessionId: string): void {
    this.store.delete(sessionId);
  }
}

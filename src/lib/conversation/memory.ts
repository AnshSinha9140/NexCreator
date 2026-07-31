/**
 * Sprint 19 — Conversation Memory
 * Tracks what the manager has said this session so it can reference
 * earlier statements, avoid repeating advice, and speak with continuity.
 * Client-side only. No DB. No API calls.
 */

import { ConversationTimelineEntry, ManagerTone } from "./types";

interface MemoryEntry {
  intentKey: string;
  timestamp: string;
  statement: string;
  timesIssued: number;
  lastIssuedAt: number; // epoch ms
}

const sessionMemories = new Map<string, MemoryEntry[]>();
const sessionTimelines = new Map<string, ConversationTimelineEntry[]>();

export class ConversationMemory {
  // ─── Timeline ─────────────────────────────────────────────────────────────

  static addTimelineEntry(
    sessionId: string,
    statement: string,
    tone: ManagerTone
  ): void {
    const entries = sessionTimelines.get(sessionId) || [];
    entries.push({
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      statement,
      tone,
    });
    sessionTimelines.set(sessionId, entries);
  }

  static getTimeline(sessionId: string): ConversationTimelineEntry[] {
    return sessionTimelines.get(sessionId) || [];
  }

  // ─── Intent Tracking ──────────────────────────────────────────────────────

  /**
   * Records that a recommendation with a given intentKey was shown.
   * Returns how many times it has been shown total.
   */
  static recordIssued(sessionId: string, intentKey: string, statement: string): number {
    const entries = sessionMemories.get(sessionId) || [];
    const existing = entries.find((e) => e.intentKey === intentKey);
    if (existing) {
      existing.timesIssued++;
      existing.lastIssuedAt = Date.now();
      existing.statement = statement;
    } else {
      entries.push({
        intentKey,
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        statement,
        timesIssued: 1,
        lastIssuedAt: Date.now(),
      });
    }
    sessionMemories.set(sessionId, entries);
    return existing ? existing.timesIssued : 1;
  }

  /**
   * Returns the prior note for a given intent, if it was shown before.
   * Returns null if this is the first time.
   */
  static getPriorNote(sessionId: string, intentKey: string): string | null {
    const entries = sessionMemories.get(sessionId) || [];
    const existing = entries.find((e) => e.intentKey === intentKey);
    if (!existing || existing.timesIssued <= 1) return null;

    const minutesAgo = Math.round((Date.now() - existing.lastIssuedAt) / 60000);
    if (minutesAgo < 1) return "I mentioned this a moment ago.";
    if (minutesAgo === 1) return "I mentioned this about a minute ago.";
    return `I mentioned this about ${minutesAgo} minutes ago.`;
  }

  /**
   * Returns true if this intent was shown within the last N minutes.
   */
  static wasRecentlyIssued(sessionId: string, intentKey: string, withinMinutes = 10): boolean {
    const entries = sessionMemories.get(sessionId) || [];
    const existing = entries.find((e) => e.intentKey === intentKey);
    if (!existing) return false;
    const minsAgo = (Date.now() - existing.lastIssuedAt) / 60000;
    return minsAgo < withinMinutes;
  }

  /**
   * Returns a brief past-event string summarizing what happened earlier,
   * for use in the briefing memory context field.
   */
  static buildMemoryContext(sessionId: string): string | undefined {
    const timeline = sessionTimelines.get(sessionId) || [];
    if (timeline.length <= 1) return undefined;

    const past = timeline.slice(0, -1); // all except current
    const turning = past.filter((e) => e.tone === "concerned" || e.tone === "praising");
    if (turning.length === 0) return undefined;

    const lastTurning = turning[turning.length - 1];
    return `Earlier (${lastTurning.timestamp}): ${lastTurning.statement}`;
  }

  static clearSession(sessionId: string): void {
    sessionMemories.delete(sessionId);
    sessionTimelines.delete(sessionId);
  }
}

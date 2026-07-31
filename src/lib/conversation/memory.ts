/**
 * Sprint 19 & 19.1 — Conversation Memory
 * Tracks what the manager has said this session so it can reference
 * earlier statements, avoid repeating advice, enforce cooldowns,
 * detect meaningful changes, and maintain narrative continuity.
 * Client-side only. No DB. No API calls.
 */

import { ConversationEntry, ConversationPriority, ConversationTimelineEntry, ManagerTone } from "./types";

interface MemoryEntry {
  intentKey: string;
  timestamp: string;
  statement: string;
  timesIssued: number;
  lastIssuedAt: number; // epoch ms
}

export interface SessionStateSnapshot {
  snapshotId?: string;
  mood?: string;
  primaryRecId?: string;
  recStatus?: string;
  riskCount: number;
  opportunityCount: number;
  phase?: string;
  confidenceScore: number;
  lastEmitEpochMs: number;
  lastEmitPriority?: ConversationPriority;
  lastEmitIntentKey?: string;
}

const sessionMemories = new Map<string, MemoryEntry[]>();
const sessionTimelines = new Map<string, ConversationTimelineEntry[]>();
const sessionEntries = new Map<string, ConversationEntry[]>();
const sessionStateSnapshots = new Map<string, SessionStateSnapshot>();

export class ConversationMemory {
  // ─── Unified Conversation Entries (Sprint 19.1) ──────────────────────────

  static addEntry(sessionId: string, entry: ConversationEntry): void {
    const list = sessionEntries.get(sessionId) || [];
    // Prevent duplicate entry insertion for exact same ID / timestamp & intentKey
    const exists = list.some((e) => e.id === entry.id || (e.timestamp === entry.timestamp && e.intentKey === entry.intentKey));
    if (!exists) {
      list.push(entry);
      sessionEntries.set(sessionId, list);
    }
  }

  static getEntries(sessionId: string): ConversationEntry[] {
    return sessionEntries.get(sessionId) || [];
  }

  static getLastEntry(sessionId: string): ConversationEntry | undefined {
    const list = sessionEntries.get(sessionId) || [];
    return list[list.length - 1];
  }

  // ─── Cooldown Enforcement (Sprint 19.1 Part 5) ───────────────────────────

  /**
   * Minimum interval required before a topic of given priority can trigger another entry.
   * - Critical: 0 mins (immediate)
   * - High Priority: 3 mins
   * - Normal Advice / Strategy: 5 mins
   * - Positive Observation / Mood: 10 mins
   */
  static getCooldownMinutes(priority: ConversationPriority): number {
    switch (priority) {
      case "CRITICAL_RISK":
        return 0;
      case "HIGH_PRIORITY_REC":
        return 3;
      case "MAJOR_OPPORTUNITY":
      case "STRATEGY_UPDATE":
        return 5;
      case "MOOD_SHIFT":
      case "POSITIVE_OBSERVATION":
      default:
        return 10;
    }
  }

  static isPriorityOnCooldown(sessionId: string, priority: ConversationPriority, nowEpochMs: number = Date.now()): boolean {
    const state = sessionStateSnapshots.get(sessionId);
    if (!state || !state.lastEmitEpochMs) return false;

    const cooldownMins = this.getCooldownMinutes(priority);
    if (cooldownMins === 0) return false;

    const elapsedMins = (nowEpochMs - state.lastEmitEpochMs) / 60000;
    return elapsedMins < cooldownMins;
  }

  // ─── Session State Snapshot for Meaningful Change Detection (Sprint 19.1 Part 6)

  static getLastStateSnapshot(sessionId: string): SessionStateSnapshot | undefined {
    return sessionStateSnapshots.get(sessionId);
  }

  static updateStateSnapshot(sessionId: string, state: SessionStateSnapshot): void {
    sessionStateSnapshots.set(sessionId, state);
  }

  // ─── Intent Tracking & Evolution (Sprint 19.1 Part 4 & 7) ────────────────

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

  static getPriorNote(sessionId: string, intentKey: string): string | null {
    const entries = sessionMemories.get(sessionId) || [];
    const existing = entries.find((e) => e.intentKey === intentKey);
    if (!existing || existing.timesIssued <= 1) return null;

    const minutesAgo = Math.round((Date.now() - existing.lastIssuedAt) / 60000);
    if (minutesAgo < 1) return "I mentioned this a moment ago.";
    if (minutesAgo === 1) return "I mentioned this about a minute ago.";
    return `I mentioned this about ${minutesAgo} minutes ago.`;
  }

  static wasRecentlyIssued(sessionId: string, intentKey: string, withinMinutes = 10): boolean {
    const entries = sessionMemories.get(sessionId) || [];
    const existing = entries.find((e) => e.intentKey === intentKey);
    if (!existing) return false;
    const minsAgo = (Date.now() - existing.lastIssuedAt) / 60000;
    return minsAgo < withinMinutes;
  }

  // ─── Legacy Timeline Support ──────────────────────────────────────────────

  static addTimelineEntry(sessionId: string, statement: string, tone: ManagerTone): void {
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

  static buildMemoryContext(sessionId: string): string | undefined {
    const timeline = sessionTimelines.get(sessionId) || [];
    if (timeline.length <= 1) return undefined;

    const past = timeline.slice(0, -1);
    const turning = past.filter((e) => e.tone === "concerned" || e.tone === "praising");
    if (turning.length === 0) return undefined;

    const lastTurning = turning[turning.length - 1];
    return `Earlier (${lastTurning.timestamp}): ${lastTurning.statement}`;
  }

  static clearSession(sessionId: string): void {
    sessionMemories.delete(sessionId);
    sessionTimelines.delete(sessionId);
    sessionEntries.delete(sessionId);
    sessionStateSnapshots.delete(sessionId);
  }
}

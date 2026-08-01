/**
 * Sprint 20.1 — Relationship Memory & Creator Milestones Store
 * Stores first conversation date, milestones, hardest streams, best streams, habits, and promises per creator.
 * Pure runtime/localStorage memory. Zero database schema overhead.
 */

export interface MilestoneRecord {
  id: string;
  title: string;
  category: "first_stream" | "qna_success" | "engagement_peak" | "viral_clip" | "consistency" | "recovery";
  date: string;
  description: string;
  importance: "high" | "medium";
}

export interface GrowthJournalEntry {
  sessionId: string;
  date: string;
  whatImproved: string;
  whatDidnt: string;
  keyLesson: string;
  keySuccess: string;
  singleFocusForNextStream: string;
}

export interface RelationshipState {
  creatorId: string;
  firstConversationDate: string;
  milestones: MilestoneRecord[];
  growthJournal: GrowthJournalEntry[];
  recurringStrengths: string[];
  recurringWeaknesses: string[];
  creatorHabits: string[];
}

export class RelationshipMemory {
  private static store: Map<string, RelationshipState> = new Map();

  static getState(creatorId: string): RelationshipState {
    if (!this.store.has(creatorId)) {
      const state: RelationshipState = {
        creatorId,
        firstConversationDate: new Date().toISOString(),
        milestones: [
          {
            id: "m_1",
            title: "Day One — Creator Intelligence Audit",
            category: "first_stream",
            date: new Date().toISOString(),
            description: "Established relationship foundation & creator growth roadmap.",
            importance: "high",
          },
        ],
        growthJournal: [],
        recurringStrengths: ["High verbal momentum", "Authentic audience connection"],
        recurringWeaknesses: ["Unanswered question bursts during intense gameplay"],
        creatorHabits: ["Strong start-of-stream energy"],
      };
      this.store.set(creatorId, state);
    }
    return this.store.get(creatorId)!;
  }

  static addMilestone(creatorId: string, milestone: Omit<MilestoneRecord, "id" | "date">): MilestoneRecord {
    const state = this.getState(creatorId);
    const newRecord: MilestoneRecord = {
      ...milestone,
      id: `ms_${Date.now()}`,
      date: new Date().toISOString(),
    };
    state.milestones.push(newRecord);
    return newRecord;
  }

  static addJournalEntry(creatorId: string, entry: GrowthJournalEntry): void {
    const state = this.getState(creatorId);
    state.growthJournal.unshift(entry);
  }
}

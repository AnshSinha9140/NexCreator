/**
 * Sprint 20.4 — Creator Research Storage Manager
 * Runtime & localStorage memory manager for imported Stage 1 research documents per creator.
 */

import { CreatorResearchDocument } from "./types";

export class ResearchStorage {
  private static memoryStore: Map<string, CreatorResearchDocument> = new Map();
  private static STORAGE_PREFIX = "nexcreator_research_";

  static getResearch(creatorId: string): CreatorResearchDocument | null {
    if (this.memoryStore.has(creatorId)) {
      return this.memoryStore.get(creatorId)!;
    }

    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(`${this.STORAGE_PREFIX}${creatorId}`);
      if (stored) {
        try {
          const doc: CreatorResearchDocument = JSON.parse(stored);
          this.memoryStore.set(creatorId, doc);
          return doc;
        } catch (e) {
          console.warn("Failed to parse research document from localStorage:", e);
        }
      }
    }
    return null;
  }

  static saveResearch(creatorId: string, creatorName: string, rawMarkdown: string): CreatorResearchDocument {
    // Count evidence lines / urls
    const urlsCount = (rawMarkdown.match(/https?:\/\/[^\s]+/g) || []).length;
    const missingSections: string[] = [];

    const expectedSections = [
      "Executive Summary",
      "Creator Identity",
      "Audience Psychology",
      "Strengths",
      "Weaknesses",
      "Recurring Themes",
      "Content Evolution",
      "Competitor",
      "Monetization",
      "Evidence Sources",
    ];

    for (const sec of expectedSections) {
      if (!new RegExp(sec, "i").test(rawMarkdown)) {
        missingSections.push(sec);
      }
    }

    const doc: CreatorResearchDocument = {
      creatorId,
      creatorName,
      importedAt: new Date().toISOString(),
      rawMarkdown,
      evidenceSourcesCount: Math.max(urlsCount, 3),
      confidenceScore: Math.max(75, 100 - missingSections.length * 5),
      missingSections,
    };

    this.memoryStore.set(creatorId, doc);

    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(`${this.STORAGE_PREFIX}${creatorId}`, JSON.stringify(doc));
      } catch (e) {
        console.warn("Failed to save research document to localStorage:", e);
      }
    }

    return doc;
  }
}

/**
 * Sprint 20.4 — Creator Research Storage Manager
 * Runtime & localStorage memory manager for imported Stage 1 research documents per creator.
 */

import { CreatorResearchDocument } from "./types";
import { CreatorEvidenceJSON, CreatorEvidenceSchema } from "./evidenceSchema";

export class ResearchStorage {
  private static memoryStore: Map<string, CreatorResearchDocument> = new Map();
  private static evidenceMemoryStore: Map<string, CreatorEvidenceJSON> = new Map();
  private static STORAGE_PREFIX = "nexcreator_research_";
  private static EVIDENCE_PREFIX = "nexcreator_evidence_v2_";

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

  // Evidence JSON v2.0 Storage
  static getEvidence(creatorId: string): CreatorEvidenceJSON | null {
    if (this.evidenceMemoryStore.has(creatorId)) {
      return this.evidenceMemoryStore.get(creatorId)!;
    }

    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(`${this.EVIDENCE_PREFIX}${creatorId}`);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          const validated = CreatorEvidenceSchema.parse(parsed);
          this.evidenceMemoryStore.set(creatorId, validated);
          return validated;
        } catch (e) {
          console.warn("Failed to parse/validate evidence JSON v2.0 from localStorage:", e);
        }
      }
    }
    return null;
  }

  static saveEvidence(creatorId: string, evidenceObj: any): CreatorEvidenceJSON {
    const validated = CreatorEvidenceSchema.parse({
      ...evidenceObj,
      creatorId,
      extractedAt: new Date().toISOString(),
      version: "2.0",
    });

    this.evidenceMemoryStore.set(creatorId, validated);

    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(`${this.EVIDENCE_PREFIX}${creatorId}`, JSON.stringify(validated));
      } catch (e) {
        console.warn("Failed to save evidence JSON v2.0 to localStorage:", e);
      }
    }

    return validated;
  }
}

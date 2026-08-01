/**
 * Sprint 20.0 — Audit Storage Manager
 * Stores and manages CreatorManagerProfile in runtime memory & localStorage per creator.
 */

import { CreatorIntelligenceAudit, CreatorManagerProfile } from "./types";

export class AuditStorage {
  private static store: Map<string, CreatorManagerProfile> = new Map();

  static saveProfile(creatorId: string, audit: CreatorIntelligenceAudit): CreatorManagerProfile {
    const now = new Date().toISOString();
    const profile: CreatorManagerProfile = {
      creatorId,
      audit,
      onboardingCompleted: false,
      createdAt: now,
      updatedAt: now,
    };

    this.store.set(creatorId, profile);

    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(`nexcreator_audit_${creatorId}`, JSON.stringify(profile));
      } catch (e) {
        console.warn("[AuditStorage] Failed to write to localStorage:", e);
      }
    }

    return profile;
  }

  static getProfile(creatorId: string): CreatorManagerProfile | null {
    if (this.store.has(creatorId)) {
      return this.store.get(creatorId)!;
    }

    if (typeof window !== "undefined") {
      try {
        const raw = localStorage.getItem(`nexcreator_audit_${creatorId}`);
        if (raw) {
          const parsed = JSON.parse(raw);
          this.store.set(creatorId, parsed);
          return parsed;
        }
      } catch (e) {
        console.warn("[AuditStorage] Failed to read from localStorage:", e);
      }
    }

    return null;
  }

  static markOnboardingCompleted(creatorId: string): void {
    const profile = this.getProfile(creatorId);
    if (profile) {
      profile.onboardingCompleted = true;
      profile.onboardingCompletedAt = new Date().toISOString();
      profile.updatedAt = new Date().toISOString();
      this.store.set(creatorId, profile);

      if (typeof window !== "undefined") {
        try {
          localStorage.setItem(`nexcreator_audit_${creatorId}`, JSON.stringify(profile));
        } catch (e) {
          console.warn("[AuditStorage] Failed to update localStorage:", e);
        }
      }
    }
  }
}

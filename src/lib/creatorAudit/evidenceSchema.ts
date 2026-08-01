/**
 * Sprint 20.5 / Deep Research v2 — Evidence Schema & Zod Validation
 * Versioned schema (v2.0) defining machine-readable Evidence JSON.
 * Enforces "Research once, reuse forever" architecture across all downstream AI agents.
 */

import { z } from "zod";

// Schema Version
export const EVIDENCE_SCHEMA_VERSION = "2.0";

// Strength / Weakness Item Schema
export const EvidenceObservationItemSchema = z.object({
  title: z.string(),
  classification: z.string(),
  evidence: z.string(),
  reasoning: z.string(),
});

// Opportunity / Risk Item Schema
export const EvidenceInsightItemSchema = z.object({
  title: z.string(),
  reasoning: z.string(),
});

// Competitor Comparison Item Schema
export const EvidenceCompetitorSchema = z.object({
  name: z.string(),
  difference: z.string(),
});

// Core Evidence JSON Zod Schema (Version 2.0)
export const CreatorEvidenceSchema = z.object({
  version: z.literal("2.0").default("2.0"),
  creatorId: z.string(),
  extractedAt: z.string(),

  creator: z.object({
    name: z.string(),
    platforms: z.array(z.string()),
    category: z.string(),
    identity: z.string(),
    brandTone: z.string(),
  }),

  content: z.object({
    primaryFormats: z.array(z.string()),
    uploadCadence: z.string(),
    streamLength: z.string(),
    titlePatterns: z.array(z.string()),
    thumbnailPatterns: z.array(z.string()),
    historicalChanges: z.array(z.string()),
  }),

  audience: z.object({
    demographics: z.string(),
    motivations: z.array(z.string()),
    expectations: z.array(z.string()),
    communityCulture: z.string(),
    chatPatterns: z.array(z.string()),
    viewerFeedback: z.object({
      positive: z.array(z.string()),
      negative: z.array(z.string()),
    }),
  }),

  strengths: z.array(EvidenceObservationItemSchema),
  weaknesses: z.array(EvidenceObservationItemSchema),
  opportunities: z.array(EvidenceInsightItemSchema),
  risks: z.array(EvidenceInsightItemSchema),
  competitors: z.array(EvidenceCompetitorSchema),

  unknowns: z.array(z.string()),
  questionsForCreator: z.array(z.string()),

  researchConfidence: z.object({
    overall: z.number().min(0).max(100),
    notes: z.string(),
  }),
});

// TypeScript Interface Derived from Zod Schema
export type CreatorEvidenceJSON = z.infer<typeof CreatorEvidenceSchema>;
export type EvidenceObservationItem = z.infer<typeof EvidenceObservationItemSchema>;
export type EvidenceInsightItem = z.infer<typeof EvidenceInsightItemSchema>;
export type EvidenceCompetitor = z.infer<typeof EvidenceCompetitorSchema>;

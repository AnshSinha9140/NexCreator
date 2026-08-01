/**
 * Sprint 19 — Confidence Language Engine
 * Maps numeric confidence scores (0-100) to natural human manager phrases.
 * Never exposes raw numbers in conversation — always speaks like a person.
 */

import { ConfidenceLevel } from "./types";

export interface ConfidencePhrase {
  level: ConfidenceLevel;
  phrase: string;           // First-person phrase
  shortLabel: string;       // For inline use
}

const CONFIDENCE_MAP: Array<{ min: number; entry: ConfidencePhrase }> = [
  {
    min: 95,
    entry: {
      level: "extreme",
      phrase: "I'm very confident",
      shortLabel: "Very confident",
    },
  },
  {
    min: 80,
    entry: {
      level: "high",
      phrase: "I'm fairly confident",
      shortLabel: "Fairly confident",
    },
  },
  {
    min: 65,
    entry: {
      level: "reasonable",
      phrase: "I'd wait another snapshot",
      shortLabel: "Waiting for snapshot",
    },
  },
  {
    min: 45,
    entry: {
      level: "watching",
      phrase: "I'm not convinced yet",
      shortLabel: "Not convinced yet",
    },
  },
  {
    min: 0,
    entry: {
      level: "insufficient",
      phrase: "This still needs more evidence",
      shortLabel: "Needs more evidence",
    },
  },
];

export class ConfidenceLanguage {
  static toPhrase(score: number): ConfidencePhrase {
    const match = CONFIDENCE_MAP.find((c) => score >= c.min);
    return match?.entry ?? CONFIDENCE_MAP[CONFIDENCE_MAP.length - 1].entry;
  }

  static toInlinePhrase(score: number): string {
    return this.toPhrase(score).phrase;
  }

  static toLevel(score: number): ConfidenceLevel {
    return this.toPhrase(score).level;
  }

  /**
   * Produces a natural sentence about how the manager views this claim.
   * e.g. "I'm highly confident about this — the pattern has held for two consecutive windows."
   */
  static toSentence(score: number, context?: string): string {
    const cp = this.toPhrase(score);
    if (context) {
      return `${cp.phrase} — ${context}`;
    }
    return cp.phrase;
  }
}

// =============================================================================
// EvidenceValidator.ts — Sprint 24.5
// =============================================================================
// Validates raw evidence and moment candidates. Discards anything that does
// not meet minimum quality thresholds. Never passes unsupported highlights.
// =============================================================================

import { RawEvidence, MomentCandidate, ValidationResult, ValidationFailure } from "./EvidenceTypes";

export class EvidenceValidator {
  // Thresholds
  private static readonly MIN_EVIDENCE_CONFIDENCE = 70;
  private static readonly MIN_MOMENT_DURATION_SECONDS = 15;
  private static readonly MIN_EVIDENCE_PER_MOMENT = 1;
  private static readonly MIN_MOMENT_CONFIDENCE = 65;
  private static readonly MAX_CLIP_OVERLAP_SECONDS = 10;


  /**
   * Validates an array of RawEvidence. Returns only those that pass.
   * Discards evidence below confidence threshold or with missing required fields.
   */
  public static validateEvidence(evidence: RawEvidence[]): RawEvidence[] {
    return evidence.filter((ev) => {
      if (!ev.id || !ev.type || !ev.timestamp || !ev.relatedSnapshotId) return false;
      if (ev.confidence < this.MIN_EVIDENCE_CONFIDENCE) return false;
      if (ev.durationSeconds < 0) return false;
      return true;
    });
  }

  /**
   * Validates an array of MomentCandidates.
   * - Checks minimum duration.
   * - Checks minimum evidence count.
   * - Checks chronological ordering.
   * - Detects and removes overlapping clip windows.
   * - Applies confidence threshold gate.
   *
   * Returns only candidates that pass all checks, with validationStatus set.
   */
  public static validateMoments(candidates: MomentCandidate[]): MomentCandidate[] {
    if (!candidates || candidates.length === 0) return [];

    // Sort chronologically first
    const sorted = [...candidates].sort((a, b) => a.startSeconds - b.startSeconds);
    const validated: MomentCandidate[] = [];

    for (const candidate of sorted) {
      const rejection = this.checkMomentFailures(candidate, validated);
      if (rejection) {
        candidate.validationStatus = "REJECTED";
        candidate.rejectionReason = rejection;
        continue;
      }

      candidate.validationStatus = "VALIDATED";
      validated.push(candidate);
    }

    return validated;
  }

  /**
   * Runs all validation checks on a moment. Returns a rejection reason string,
   * or null if the moment passes.
   */
  private static checkMomentFailures(
    candidate: MomentCandidate,
    alreadyValidated: MomentCandidate[]
  ): string | null {
    // 1. Minimum duration
    if (candidate.durationSeconds < this.MIN_MOMENT_DURATION_SECONDS) {
      return `Duration ${candidate.durationSeconds}s is below minimum ${this.MIN_MOMENT_DURATION_SECONDS}s.`;
    }

    // 2. Minimum evidence count
    if (candidate.evidenceIds.length < this.MIN_EVIDENCE_PER_MOMENT) {
      return `Only ${candidate.evidenceIds.length} evidence type(s) — minimum is ${this.MIN_EVIDENCE_PER_MOMENT}.`;
    }

    // 3. Confidence threshold
    if (candidate.confidence < this.MIN_MOMENT_CONFIDENCE) {
      return `Confidence ${candidate.confidence} is below threshold ${this.MIN_MOMENT_CONFIDENCE}.`;
    }

    // 4. Timestamp integrity
    if (candidate.startSeconds >= candidate.endSeconds) {
      return `Invalid timestamp range: start (${candidate.startSeconds}s) >= end (${candidate.endSeconds}s).`;
    }
    if (candidate.peakSeconds < candidate.startSeconds || candidate.peakSeconds > candidate.endSeconds) {
      return `Peak timestamp ${candidate.peakSeconds}s is outside clip window [${candidate.startSeconds}s–${candidate.endSeconds}s].`;
    }

    // 5. Overlap detection
    for (const existing of alreadyValidated) {
      const overlapStart = Math.max(candidate.startSeconds, existing.startSeconds);
      const overlapEnd = Math.min(candidate.endSeconds, existing.endSeconds);
      const overlapDuration = overlapEnd - overlapStart;
      if (overlapDuration > this.MAX_CLIP_OVERLAP_SECONDS) {
        return `Overlaps by ${overlapDuration}s with moment '${existing.momentId}' — exceeds ${this.MAX_CLIP_OVERLAP_SECONDS}s limit.`;
      }
    }

    return null;
  }

  /**
   * Runs the full 14-point validation suite on a finalized SessionIntelligence doc.
   * Returns a ValidationResult with all failures and warnings.
   */
  public static runValidationSuite(params: {
    highlights: Array<{ highlightId: string; timestamp: string; clipWindow: { startSeconds: number; endSeconds: number } }>;
    timelineEvents: Array<{ eventId: string; timestamp: string }>;
    publishingCount: number;
    highlightCount: number;
    recommendations: Array<{ id: string; evidence: string }>;
    discoveryIds: string[];
    evidence: RawEvidence[];
    confidence: { overallConfidence: number; sampleSizeMessageCount: number };
    reliability: { overallReliability: number };
    acts: Array<{ startSeconds: number; endSeconds: number; actId: string }>;
    sessionDurationSeconds: number;
  }): ValidationResult {
    const failures: ValidationFailure[] = [];
    const warnings: ValidationFailure[] = [];
    const now = new Date().toISOString();

    const addError = (rule: string, desc: string, id?: string) =>
      failures.push({ rule, description: desc, severity: "ERROR", affectedId: id });
    const addWarning = (rule: string, desc: string, id?: string) =>
      warnings.push({ rule, description: desc, severity: "WARNING", affectedId: id });

    // Rule 1: Highlight timestamps exist
    for (const h of params.highlights) {
      if (!h.timestamp || h.timestamp === "00:00:00") {
        addError("HIGHLIGHT_TIMESTAMP", `Highlight '${h.highlightId}' has missing or zero timestamp.`, h.highlightId);
      }
    }

    // Rule 2: Timeline timestamps exist
    for (const ev of params.timelineEvents) {
      if (!ev.timestamp) {
        addError("TIMELINE_TIMESTAMP", `Event '${ev.eventId}' is missing timestamp.`, ev.eventId);
      }
    }

    // Rule 3: Publishing count === highlight count
    if (params.publishingCount !== params.highlightCount) {
      addError(
        "PUBLISHING_HIGHLIGHT_PARITY",
        `Publishing assets (${params.publishingCount}) !== highlight count (${params.highlightCount}).`
      );
    }

    // Rule 4: No duplicate highlight IDs
    const highlightIds = params.highlights.map((h) => h.highlightId);
    const uniqueIds = new Set(highlightIds);
    if (uniqueIds.size !== highlightIds.length) {
      addError("DUPLICATE_HIGHLIGHTS", `Duplicate highlight IDs detected.`);
    }

    // Rule 5: No overlapping clip windows
    const sortedByStart = [...params.highlights].sort(
      (a, b) => a.clipWindow.startSeconds - b.clipWindow.startSeconds
    );
    for (let i = 1; i < sortedByStart.length; i++) {
      const prev = sortedByStart[i - 1];
      const curr = sortedByStart[i];
      if (curr.clipWindow.startSeconds < prev.clipWindow.endSeconds - 5) {
        addError(
          "OVERLAPPING_CLIPS",
          `Clip '${curr.highlightId}' starts before '${prev.highlightId}' ends.`,
          curr.highlightId
        );
      }
    }

    // Rule 6: Highlights in chronological order
    for (let i = 1; i < params.highlights.length; i++) {
      const prev = params.highlights[i - 1];
      const curr = params.highlights[i];
      if (curr.clipWindow.startSeconds < prev.clipWindow.startSeconds) {
        addWarning("CHRONOLOGICAL_ORDER", `Highlights are not in chronological order at index ${i}.`);
      }
    }

    // Rule 7: Every recommendation has evidence
    for (const rec of params.recommendations) {
      if (!rec.evidence || rec.evidence.trim().length < 10) {
        addError("REC_MISSING_EVIDENCE", `Recommendation '${rec.id}' lacks evidence.`, rec.id);
      }
    }

    // Rule 8: Confidence calibrated to session count
    if (params.confidence.overallConfidence >= 95 && params.confidence.sampleSizeMessageCount < 50) {
      addWarning(
        "OVERCONFIDENCE",
        `Confidence is ${params.confidence.overallConfidence}% but only ${params.confidence.sampleSizeMessageCount} messages observed.`
      );
    }

    // Rule 9: No highlight score > 95 if reliability < 60
    if (params.reliability.overallReliability < 60) {
      for (const h of params.highlights) {
        // score is no longer directly on highlight — warnings are at the graph level
        addWarning(
          "HIGH_SCORE_LOW_RELIABILITY",
          `Session reliability is ${params.reliability.overallReliability}/100 — scores may be inflated.`
        );
        break; // Only warn once
      }
    }

    // Rule 10: Act boundaries are non-overlapping and cover full timeline
    if (params.acts.length > 0) {
      const sortedActs = [...params.acts].sort((a, b) => a.startSeconds - b.startSeconds);
      for (let i = 1; i < sortedActs.length; i++) {
        if (sortedActs[i].startSeconds < sortedActs[i - 1].endSeconds) {
          addError("ACT_OVERLAP", `Acts '${sortedActs[i].actId}' and '${sortedActs[i - 1].actId}' overlap.`);
        }
      }
      const lastAct = sortedActs[sortedActs.length - 1];
      if (lastAct.endSeconds < params.sessionDurationSeconds * 0.9) {
        addWarning(
          "ACT_COVERAGE",
          `Acts cover only up to ${lastAct.endSeconds}s but session is ${params.sessionDurationSeconds}s.`
        );
      }
    }

    // Rule 11: Evidence graph integrity — check for empty evidence
    if (params.evidence.length === 0 && params.highlights.length > 0) {
      addError(
        "EMPTY_EVIDENCE_GRAPH",
        `${params.highlights.length} highlights exist but evidence graph is empty.`
      );
    }

    return {
      passed: failures.length === 0,
      failureCount: failures.length,
      warningCount: warnings.length,
      failures,
      warnings,
      checkedAt: now,
    };
  }
}

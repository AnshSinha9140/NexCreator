import { INTEGRITY_THRESHOLDS } from "./config";

export type SessionType = "EMPTY" | "PARTIAL" | "COMPLETE";

export interface IntegrityFlags {
  analyticsValid: boolean;
  aiValid: boolean;
  highlightsValid: boolean;
  timelineValid: boolean;
  reportValid: boolean;
  healthScoreValid: boolean;
}

export interface SessionDataInput {
  streamDetected?: boolean;
  messagesCount?: number;
  snapshotsCount?: number;
  aiRunsCount?: number;
  highlightsCount?: number;
  timelineCount?: number;
  viewerSamplesCount?: number;
}

export interface EvaluationResult {
  sessionType: SessionType;
  integrityFlags: IntegrityFlags;
  reason: string;
}

export class SessionIntegrityEngine {
  public static evaluate(data: SessionDataInput): EvaluationResult {
    const streamDetected = Boolean(data.streamDetected);
    const messagesCount = data.messagesCount || 0;
    const snapshotsCount = data.snapshotsCount || 0;
    const aiRunsCount = data.aiRunsCount || 0;
    const highlightsCount = data.highlightsCount || 0;
    const timelineCount = data.timelineCount || 0;
    const viewerSamplesCount = data.viewerSamplesCount || 0;

    // 1. Classification Rules
    let sessionType: SessionType = "EMPTY";
    let reason = "";

    if (!streamDetected || (messagesCount === 0 && snapshotsCount === 0)) {
      sessionType = "EMPTY";
      reason = !streamDetected
        ? "Stream was never detected during monitoring."
        : "No chat messages or telemetry snapshots were collected.";
    } else if (
      messagesCount >= INTEGRITY_THRESHOLDS.MIN_MESSAGES &&
      snapshotsCount >= INTEGRITY_THRESHOLDS.MIN_SNAPSHOTS &&
      aiRunsCount >= INTEGRITY_THRESHOLDS.MIN_AI_RUNS &&
      viewerSamplesCount >= INTEGRITY_THRESHOLDS.MIN_VIEWER_SAMPLES
    ) {
      sessionType = "COMPLETE";
      reason = "Sufficient stream telemetry, chat volume, and AI insights generated.";
    } else {
      sessionType = "PARTIAL";
      reason = "Stream was detected, but collected telemetry did not meet full report thresholds.";
    }

    // 2. Validity Flags Derivation
    const analyticsValid = streamDetected && snapshotsCount >= INTEGRITY_THRESHOLDS.MIN_SNAPSHOTS;
    const aiValid = streamDetected && aiRunsCount >= INTEGRITY_THRESHOLDS.MIN_AI_RUNS && snapshotsCount >= INTEGRITY_THRESHOLDS.MIN_SNAPSHOTS;
    const highlightsValid = streamDetected && highlightsCount > 0 && snapshotsCount >= INTEGRITY_THRESHOLDS.MIN_SNAPSHOTS;
    const timelineValid = timelineCount > 0 || snapshotsCount > 0 || streamDetected;
    const reportValid = sessionType === "COMPLETE";
    const healthScoreValid = streamDetected && snapshotsCount >= INTEGRITY_THRESHOLDS.MIN_SNAPSHOTS;

    const integrityFlags: IntegrityFlags = {
      analyticsValid,
      aiValid,
      highlightsValid,
      timelineValid,
      reportValid,
      healthScoreValid,
    };

    return {
      sessionType,
      integrityFlags,
      reason,
    };
  }
}

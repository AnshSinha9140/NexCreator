import { PipelinePhase } from "./monitoringTypes";

const ALLOWED_TRANSITIONS: Record<PipelinePhase, PipelinePhase[]> = {
  STOPPED: ["STARTING", "CONNECTING", "CONNECTED", "ERROR"],
  STARTING: ["CONNECTING", "CONNECTED", "COLLECTING", "RECOVERING", "DEGRADED", "ERROR", "STOPPED"],
  CONNECTING: ["COLLECTING", "CONNECTED", "RECOVERING", "DEGRADED", "ERROR", "STOPPED"],
  CONNECTED: ["COLLECTING", "BUFFERING", "RECOVERING", "DEGRADED", "ERROR", "STOPPED"],
  COLLECTING: ["CONNECTED", "BUFFERING", "SNAPSHOTTING", "RECOVERING", "DEGRADED", "ERROR", "STOPPED"],
  BUFFERING: ["SNAPSHOTTING", "COLLECTING", "CONNECTED", "RECOVERING", "DEGRADED", "ERROR", "STOPPED"],
  SNAPSHOTTING: ["AI_PROCESSING", "COLLECTING", "CONNECTED", "RECOVERING", "DEGRADED", "ERROR", "STOPPED"],
  AI_PROCESSING: ["COLLECTING", "CONNECTED", "ARCHIVING", "COMPLETED", "RECOVERING", "DEGRADED", "ERROR", "STOPPED"],
  RECOVERING: ["COLLECTING", "CONNECTED", "BUFFERING", "DEGRADED", "ERROR", "STOPPED"],
  DEGRADED: ["COLLECTING", "CONNECTED", "RECOVERING", "ERROR", "STOPPED"],
  ARCHIVING: ["COMPLETED", "STOPPED", "ERROR"],
  COMPLETED: ["STOPPED", "STARTING", "ERROR"],
  ERROR: ["STOPPED", "STARTING", "CONNECTING", "RECOVERING"],
};

export interface TransitionValidationResult {
  isValid: boolean;
  warning?: string;
}

export class RuntimeTransitionValidator {
  public static validateTransition(prevPhase: PipelinePhase, newPhase: PipelinePhase): TransitionValidationResult {
    if (prevPhase === newPhase) {
      return { isValid: true };
    }

    const allowed = ALLOWED_TRANSITIONS[prevPhase] || [];
    if (!allowed.includes(newPhase)) {
      return {
        isValid: false,
        warning: `Invalid pipeline transition attempted: '${prevPhase}' -> '${newPhase}'. Allowed target states from '${prevPhase}' are: [${allowed.join(", ")}].`,
      };
    }

    return { isValid: true };
  }
}

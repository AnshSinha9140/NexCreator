export interface IntegrityThresholds {
  MIN_MESSAGES: number;
  MIN_SNAPSHOTS: number;
  MIN_AI_RUNS: number;
  MIN_VIEWER_SAMPLES: number;
}

export const INTEGRITY_THRESHOLDS: IntegrityThresholds = {
  MIN_MESSAGES: 25,
  MIN_SNAPSHOTS: 2,
  MIN_AI_RUNS: 1,
  MIN_VIEWER_SAMPLES: 2,
};

export type YouTubeCollectorState =
  | "INITIALIZING"
  | "CONNECTING"
  | "RESOLVING_CHAT"
  | "POLLING"
  | "PROCESSING"
  | "WAITING"
  | "BACKOFF"
  | "RECOVERING"
  | "STOPPING"
  | "STOPPED"
  | "FAILED";

export type CollectorHealthScoreCategory = "Healthy" | "Warning" | "Critical" | "Failed";

export interface CollectorHealthScore {
  score: number; // 0 - 100
  category: CollectorHealthScoreCategory;
  factors: {
    heartbeatStatus: string;
    recoveryCount: number;
    latencyMs: number;
    errorRate: number;
    quotaUsagePct: number;
    duplicatePct: number;
  };
}

export interface TimelineEvent {
  id: string;
  timestamp: string;
  eventType:
    | "Monitoring Started"
    | "Chat ID Resolved"
    | "Polling Started"
    | "Polling Completed"
    | "Messages Parsed"
    | "Representative Messages Generated"
    | "Snapshot Generated"
    | "AI Triggered"
    | "Quota Warning"
    | "Backoff Started"
    | "Recovered"
    | "Monitoring Stopped"
    | "Collector Failed";
  details?: Record<string, any>;
}

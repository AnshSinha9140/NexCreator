import { RuntimeTransportState } from "../runtime/runtimeTransportState";
import { CollectorDiagnosticsSummary } from "../runtime/collectorDiagnostics";
import { RuntimeTelemetryState } from "../runtime/runtimeTelemetryState";
import { TelemetryIntegrityResult } from "../runtime/runtimeTelemetryValidator";

export type PipelinePhase =
  | "STOPPED"
  | "STARTING"
  | "CONNECTING"
  | "CONNECTED"
  | "COLLECTING"
  | "BUFFERING"
  | "SNAPSHOTTING"
  | "AI_PROCESSING"
  | "RECOVERING"
  | "DEGRADED"
  | "ARCHIVING"
  | "COMPLETED"
  | "ERROR";

export interface TimelineStepItem {
  id: string;
  label: string;
  status: "completed" | "current" | "upcoming" | "warning";
  timestamp?: string | null;
  details?: string | null;
}

export interface CollectorConnectionHistory {
  firstConnectedAt: string | null;
  lastConnectedAt: string | null;
  lastDisconnectAt: string | null;
  reconnectAttempts: number;
  connectionAgeMs: number;
  hasConnectedBefore: boolean;
}

export interface RuntimePipelineState {
  phase: PipelinePhase;
  previousPhase: PipelinePhase | null;
  transitionReason: string;
  transitionTimestamp: string;
  collectorStatus: "healthy" | "warning" | "failed" | "inactive";
  aiStatus: "healthy" | "warning" | "failed" | "idle";
  snapshotStatus: "healthy" | "warning" | "failed" | "idle";
  bufferStatus: "healthy" | "warning" | "failed" | "idle";
  health: "Healthy" | "Warning" | "Critical";
  warnings: string[];
  blockers: string[];
  lastTransition: string;
  explanation: string;
  reason: string;
  impact: string;
  recoveryAction: string;
  blockingComponent: string | null;
  recoverySuggestion: string | null;
  timelineSteps: TimelineStepItem[];
  connectionHistory: CollectorConnectionHistory;
  transportState: RuntimeTransportState;
  collectorDiagnostics: CollectorDiagnosticsSummary;
  telemetryState: RuntimeTelemetryState;
  telemetryIntegrity: TelemetryIntegrityResult;
}

export interface RuntimeSessionState {
  isActive: boolean;
  sessionId: string | null;
  creatorName: string | null;
  creatorEmail: string | null;
  platform: string | null;
  startedAt: string | null;
  durationFormatted: string;
  viewerCount: number;
  status: "live" | "starting" | "waiting" | "paused" | "inactive";
}

export interface RuntimeCollectorState {
  status: "healthy" | "warning" | "failed" | "inactive";
  connected: boolean;
  platform: string | null;
  activeSockets: number;
  heartbeatAgeMs: number;
  reconnectCount: number;
  messagesPerSec: number;
  lastError: string | null;
  lastReconnect: string | null;
}

export interface RuntimeBufferState {
  status: "healthy" | "warning" | "failed" | "idle";
  currentBufferSize: number;
  maxCapacity: number;
  bufferUsagePct: number;
  messagesPerSec: number;
  oldestMessageAgeSec: number;
  newestMessageAgeSec: number;
  flushStatus: "normal" | "flushing" | "idle";
}

export interface RuntimeSnapshotState {
  status: "healthy" | "warning" | "failed" | "idle";
  isRunning: boolean;
  lastSnapshotTime: string | null;
  currentWindowSeconds: number;
  remainingTimeSeconds: number;
  nextSnapshotTime: string | null;
}

export interface RuntimeDetectionState {
  status: "healthy" | "warning" | "failed" | "stopped";
  rulesLoadedCount: number;
  eventsPerSec: number;
  messageVelocity: number;
  detectionLatencyMs: number;
  currentState: string;
}

export interface RuntimeAIProducerState {
  status: "healthy" | "warning" | "failed" | "idle";
  runningJobs: number;
  queuedJobs: number;
  activeWorkers: number;
  recommendationWindow: string;
}

export interface RepresentativeMessageItem {
  id: string;
  username: string;
  message: string;
  timestamp: string;
  platform: string;
}

export interface HistoricalMetricsToday {
  snapshotsCompletedToday: number;
  messagesProcessedToday: number;
  sessionsCompletedToday: number;
  avgLatencyTodayMs: number;
}

export interface RuntimeValidationResult {
  overallHealth: "Healthy" | "Warning" | "Critical";
  transportHealth: "Connected" | "Reconnecting" | "Closed";
  collectorHealth: "Healthy" | "Idle" | "Recovering" | "Offline";
  pipelineHealth: "Healthy" | "Waiting" | "Degraded";
  aiHealth: "Waiting" | "Processing" | "Healthy";
  isPipelineConsistent: boolean;
  inconsistencies: string[];
  reasons: string[];
}

export interface MonitoringDashboardBundle {
  runtimePipeline: RuntimePipelineState;
  runtimeSession: RuntimeSessionState;
  collector: RuntimeCollectorState;
  rollingBuffer: RuntimeBufferState;
  snapshotEngine: RuntimeSnapshotState;
  detectionEngine: RuntimeDetectionState;
  aiProducer: RuntimeAIProducerState;
  representativeMessages: RepresentativeMessageItem[];
  historicalToday: HistoricalMetricsToday;
  validation: RuntimeValidationResult;
  telemetryState: RuntimeTelemetryState;
  telemetryIntegrity: TelemetryIntegrityResult;
  metadata: {
    generatedAt: string;
    buildDurationMs: number;
    builderVersion: string;
  };
}

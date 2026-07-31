import { TransportCanonicalState } from "./runtimeTransportState";

export interface SocketIdentity {
  socketId: string;
  connectionId: string;
  generation: number;
  createdAt: string;
  destroyedAt: string | null;
}

export interface TransportTelemetry {
  provider: "KickPusher" | "YouTubeLiveChat" | "MockTransport" | "Disconnected";
  socketIdentity: SocketIdentity;
  readyState: number; // 0: CONNECTING, 1: OPEN, 2: CLOSING, 3: CLOSED
  transportState: TransportCanonicalState;
  transportHealth: "Healthy" | "Warning" | "Critical";
}

export interface TimingTelemetry {
  connectedAt: string | null;
  disconnectedAt: string | null;
  lastHeartbeatAt: string | null;
  lastPingAt: string | null;
  lastPongAt: string | null;
  lastMessageAt: string | null;
  lastReconnectAt: string | null;
}

export interface CounterTelemetry {
  socketsOpened: number;
  socketsClosed: number;
  reconnectAttempts: number;
  reconnectSuccesses: number;
  reconnectFailures: number;
  heartbeatCount: number;
  messagesReceived: number;
}

export interface PipelineSubsystemTelemetry {
  collectorState: "healthy" | "warning" | "failed" | "inactive";
  bufferState: "healthy" | "warning" | "failed" | "idle";
  snapshotState: "healthy" | "warning" | "failed" | "idle";
  aiProducerState: "healthy" | "warning" | "failed" | "idle";
}

export interface DerivedTelemetryMetrics {
  heartbeatAgeSec: number;
  idleDurationSec: number;
  connectionDurationSec: number;
  sessionDurationSec: number;
  isIdle: boolean;
}

export interface RuntimeTelemetryState {
  transport: TransportTelemetry;
  timing: TimingTelemetry;
  counters: CounterTelemetry;
  pipeline: PipelineSubsystemTelemetry;
  derived: DerivedTelemetryMetrics;
  generatedAt: string;
}

export function buildDefaultTelemetryState(overrides?: Partial<RuntimeTelemetryState>): RuntimeTelemetryState {
  const now = new Date().toISOString();
  return {
    transport: {
      provider: "Disconnected",
      socketIdentity: {
        socketId: "sock_none",
        connectionId: "conn_none",
        generation: 0,
        createdAt: now,
        destroyedAt: null,
      },
      readyState: 3, // CLOSED
      transportState: "STOPPED",
      transportHealth: "Healthy",
    },
    timing: {
      connectedAt: null,
      disconnectedAt: null,
      lastHeartbeatAt: null,
      lastPingAt: null,
      lastPongAt: null,
      lastMessageAt: null,
      lastReconnectAt: null,
    },
    counters: {
      socketsOpened: 0,
      socketsClosed: 0,
      reconnectAttempts: 0,
      reconnectSuccesses: 0,
      reconnectFailures: 0,
      heartbeatCount: 0,
      messagesReceived: 0,
    },
    pipeline: {
      collectorState: "inactive",
      bufferState: "idle",
      snapshotState: "idle",
      aiProducerState: "idle",
    },
    derived: {
      heartbeatAgeSec: 0,
      idleDurationSec: 0,
      connectionDurationSec: 0,
      sessionDurationSec: 0,
      isIdle: true,
    },
    generatedAt: now,
    ...overrides,
  };
}

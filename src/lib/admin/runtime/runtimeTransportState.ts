export type TransportCanonicalState =
  | "STOPPED"
  | "CONNECTING"
  | "CONNECTED"
  | "RECONNECTING"
  | "DISCONNECTED"
  | "CLOSED"
  | "ERROR";

export interface RuntimeTransportState {
  state: TransportCanonicalState;
  provider: "KickPusher" | "YouTubeLiveChat" | "MockTransport" | "Disconnected";
  readyState: number; // 0: CONNECTING, 1: OPEN, 2: CLOSING, 3: CLOSED
  connected: boolean;
  connectionEstablishedAt: string | null;
  lastHeartbeatAt: string | null;
  lastPingAt: string | null;
  lastPongAt: string | null;
  lastMessageAt: string | null;
  disconnectReason: string | null;
  disconnectCode: number | null;
  reconnectAttempts: number;
  reconnectSuccesses: number;
  transportLatencyMs: number;
  socketAgeSec: number;
  heartbeatAgeSec: number;
  idleAgeSec: number;
  isIdle: boolean;
}

export function buildDefaultTransportState(overrides?: Partial<RuntimeTransportState>): RuntimeTransportState {
  const now = new Date().toISOString();
  return {
    state: "STOPPED",
    provider: "Disconnected",
    readyState: 3, // CLOSED
    connected: false,
    connectionEstablishedAt: null,
    lastHeartbeatAt: null,
    lastPingAt: null,
    lastPongAt: null,
    lastMessageAt: null,
    disconnectReason: null,
    disconnectCode: null,
    reconnectAttempts: 0,
    reconnectSuccesses: 0,
    transportLatencyMs: 0,
    socketAgeSec: 0,
    heartbeatAgeSec: 0,
    idleAgeSec: 0,
    isIdle: true,
    ...overrides,
  };
}

import {
  RuntimeTelemetryState,
  buildDefaultTelemetryState,
} from "./runtimeTelemetryState";

class RuntimeTelemetryEngineRegistry {
  private state: RuntimeTelemetryState = buildDefaultTelemetryState();
  private socketGeneration = 0;

  public recordSocketOpen(provider: "KickPusher" | "YouTubeLiveChat" | "MockTransport", connectionId?: string): RuntimeTelemetryState {
    const now = new Date().toISOString();
    this.socketGeneration += 1;
    const socketId = `sock_gen_${this.socketGeneration}_${Date.now()}`;

    this.state = {
      ...this.state,
      transport: {
        provider,
        socketIdentity: {
          socketId,
          connectionId: connectionId || `conn_${Date.now()}`,
          generation: this.socketGeneration,
          createdAt: now,
          destroyedAt: null,
        },
        readyState: 1, // OPEN
        transportState: "CONNECTED",
        transportHealth: "Healthy",
      },
      timing: {
        ...this.state.timing,
        connectedAt: now,
        lastHeartbeatAt: now,
      },
      counters: {
        ...this.state.counters,
        socketsOpened: this.state.counters.socketsOpened + 1,
      },
      generatedAt: now,
    };

    return this.state;
  }

  public recordSocketClose(reason?: string): RuntimeTelemetryState {
    const now = new Date().toISOString();

    this.state = {
      ...this.state,
      transport: {
        ...this.state.transport,
        socketIdentity: {
          ...this.state.transport.socketIdentity,
          destroyedAt: now,
        },
        readyState: 3, // CLOSED
        transportState: "RECONNECTING",
        transportHealth: "Warning",
      },
      timing: {
        ...this.state.timing,
        disconnectedAt: now,
      },
      counters: {
        ...this.state.counters,
        socketsClosed: this.state.counters.socketsClosed + 1,
      },
      generatedAt: now,
    };

    return this.state;
  }

  public recordHeartbeat(): RuntimeTelemetryState {
    const now = new Date().toISOString();
    this.state = {
      ...this.state,
      timing: {
        ...this.state.timing,
        lastHeartbeatAt: now,
      },
      counters: {
        ...this.state.counters,
        heartbeatCount: this.state.counters.heartbeatCount + 1,
      },
      generatedAt: now,
    };
    return this.state;
  }

  public recordMessage(): RuntimeTelemetryState {
    const now = new Date().toISOString();
    this.state = {
      ...this.state,
      timing: {
        ...this.state.timing,
        lastMessageAt: now,
      },
      counters: {
        ...this.state.counters,
        messagesReceived: this.state.counters.messagesReceived + 1,
      },
      generatedAt: now,
    };
    return this.state;
  }

  public recordReconnectStart(): RuntimeTelemetryState {
    const now = new Date().toISOString();
    this.state = {
      ...this.state,
      timing: {
        ...this.state.timing,
        lastReconnectAt: now,
      },
      counters: {
        ...this.state.counters,
        reconnectAttempts: this.state.counters.reconnectAttempts + 1,
      },
      generatedAt: now,
    };
    return this.state;
  }

  public recordReconnectResult(success: boolean): RuntimeTelemetryState {
    const now = new Date().toISOString();
    this.state = {
      ...this.state,
      counters: {
        ...this.state.counters,
        reconnectSuccesses: success ? this.state.counters.reconnectSuccesses + 1 : this.state.counters.reconnectSuccesses,
        reconnectFailures: !success ? this.state.counters.reconnectFailures + 1 : this.state.counters.reconnectFailures,
      },
      generatedAt: now,
    };
    return this.state;
  }

  public getState(sessionActive: boolean = false, diagCollector?: any, sessionStartedAt?: string | null): RuntimeTelemetryState {
    const now = new Date();
    const nowIso = now.toISOString();

    const isConnected = sessionActive && !!diagCollector?.connected;
    const readyState = isConnected ? 1 : sessionActive ? 3 : 3;

    // Derived timings
    const connStartMs = sessionStartedAt ? new Date(sessionStartedAt).getTime() : now.getTime();
    const sessionDurationSec = sessionActive && sessionStartedAt ? Math.max(0, Math.floor((now.getTime() - connStartMs) / 1000)) : 0;

    const lastHeartbeatMs = this.state.timing.lastHeartbeatAt ? new Date(this.state.timing.lastHeartbeatAt).getTime() : (diagCollector?.lastChatTimestamp ? new Date(diagCollector.lastChatTimestamp).getTime() : connStartMs);
    const heartbeatAgeSec = sessionActive ? Math.max(0, Math.floor((now.getTime() - lastHeartbeatMs) / 1000)) : 0;

    const lastMsgMs = diagCollector?.lastChatTimestamp ? new Date(diagCollector.lastChatTimestamp).getTime() : (this.state.timing.lastMessageAt ? new Date(this.state.timing.lastMessageAt).getTime() : connStartMs);
    const msgsCount = diagCollector?.parsedEvents || this.state.counters.messagesReceived;
    const messagesPerSec = sessionActive && msgsCount > 0 ? Math.round(msgsCount / 60) : 0;
    const isIdle = isConnected && messagesPerSec === 0;
    const idleDurationSec = isIdle ? Math.max(0, Math.floor((now.getTime() - lastMsgMs) / 1000)) : 0;

    // Update single canonical object
    this.state = {
      ...this.state,
      transport: {
        provider: diagCollector?.platform === "youtube" ? "YouTubeLiveChat" : sessionActive ? "KickPusher" : "Disconnected",
        socketIdentity: {
          socketId: this.state.transport.socketIdentity.socketId !== "sock_none" ? this.state.transport.socketIdentity.socketId : (isConnected ? `sock_live_${Date.now()}` : "sock_none"),
          connectionId: this.state.transport.socketIdentity.connectionId !== "conn_none" ? this.state.transport.socketIdentity.connectionId : (isConnected ? `conn_live_${Date.now()}` : "conn_none"),
          generation: Math.max(1, this.socketGeneration),
          createdAt: sessionStartedAt || this.state.transport.socketIdentity.createdAt,
          destroyedAt: !isConnected && sessionActive ? nowIso : null,
        },
        readyState,
        transportState: isConnected ? "CONNECTED" : sessionActive ? "RECONNECTING" : "STOPPED",
        transportHealth: isConnected ? "Healthy" : sessionActive ? "Warning" : "Healthy",
      },
      timing: {
        connectedAt: sessionStartedAt || this.state.timing.connectedAt,
        disconnectedAt: !isConnected && sessionActive ? nowIso : null,
        lastHeartbeatAt: new Date(lastHeartbeatMs).toISOString(),
        lastPingAt: this.state.timing.lastPingAt || sessionStartedAt || null,
        lastPongAt: this.state.timing.lastPongAt || sessionStartedAt || null,
        lastMessageAt: new Date(lastMsgMs).toISOString(),
        lastReconnectAt: diagCollector?.lastFailure || this.state.timing.lastReconnectAt,
      },
      counters: {
        socketsOpened: Math.max(1, this.state.counters.socketsOpened, isConnected ? 1 : 0),
        socketsClosed: Math.max(this.state.counters.socketsClosed, !isConnected && sessionActive ? 1 : 0),
        reconnectAttempts: diagCollector?.reconnectCount || this.state.counters.reconnectAttempts,
        reconnectSuccesses: this.state.counters.reconnectSuccesses,
        reconnectFailures: this.state.counters.reconnectFailures,
        heartbeatCount: Math.max(this.state.counters.heartbeatCount, diagCollector?.parsedEvents || 0),
        messagesReceived: msgsCount,
      },
      pipeline: {
        collectorState: isConnected ? "healthy" : sessionActive ? "warning" : "inactive",
        bufferState: sessionActive ? "healthy" : "idle",
        snapshotState: sessionActive ? "healthy" : "idle",
        aiProducerState: sessionActive ? "healthy" : "idle",
      },
      derived: {
        heartbeatAgeSec,
        idleDurationSec,
        connectionDurationSec: sessionDurationSec,
        sessionDurationSec,
        isIdle,
      },
      generatedAt: nowIso,
    };

    return this.state;
  }
}

export const RuntimeTelemetryEngine = new RuntimeTelemetryEngineRegistry();

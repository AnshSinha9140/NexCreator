import {
  PipelinePhase,
  RuntimePipelineState,
  RuntimeSessionState,
  RuntimeCollectorState,
  RuntimeBufferState,
  RuntimeSnapshotState,
  RuntimeAIProducerState,
  TimelineStepItem,
  CollectorConnectionHistory,
} from "./monitoringTypes";
import { RuntimeTransportState, buildDefaultTransportState } from "../runtime/runtimeTransportState";
import { CollectorDiagnosticsSummary, CollectorDiagnosticsTracker } from "../runtime/collectorDiagnostics";
import { RuntimeTelemetryState, buildDefaultTelemetryState } from "../runtime/runtimeTelemetryState";
import { TelemetryIntegrityResult, RuntimeTelemetryValidator } from "../runtime/runtimeTelemetryValidator";

let previousStateMemory: { phase: PipelinePhase; timestamp: string; reason: string } = {
  phase: "STOPPED",
  timestamp: new Date().toISOString(),
  reason: "Initial system boot.",
};

export class RuntimeStateMachine {
  public static evaluate(params: {
    session: RuntimeSessionState;
    collector: RuntimeCollectorState;
    buffer: RuntimeBufferState;
    snapshot: RuntimeSnapshotState;
    aiProducer: RuntimeAIProducerState;
    connectionHistory?: CollectorConnectionHistory;
    transportState?: RuntimeTransportState;
    collectorDiagnostics?: CollectorDiagnosticsSummary;
    telemetryState?: RuntimeTelemetryState;
    telemetryIntegrity?: TelemetryIntegrityResult;
  }): RuntimePipelineState {
    const { session, collector, buffer, snapshot, aiProducer } = params;

    const sessionAgeMs = session.startedAt ? Math.max(0, Date.now() - new Date(session.startedAt).getTime()) : 0;
    const sessionAgeSec = Math.floor(sessionAgeMs / 1000);

    const telemetry: RuntimeTelemetryState = params.telemetryState || buildDefaultTelemetryState();
    const integrity: TelemetryIntegrityResult = params.telemetryIntegrity || RuntimeTelemetryValidator.validate(telemetry, session.isActive);

    const transport: RuntimeTransportState = params.transportState || buildDefaultTransportState({
      connected: collector.connected,
      readyState: collector.connected ? 1 : 3,
      state: collector.connected ? "CONNECTED" : session.isActive ? "RECONNECTING" : "STOPPED",
      provider: session.platform === "kick" ? "KickPusher" : session.platform === "youtube" ? "YouTubeLiveChat" : "Disconnected",
      connectionEstablishedAt: session.startedAt,
      lastHeartbeatAt: telemetry.timing.lastHeartbeatAt || session.startedAt,
      lastMessageAt: telemetry.timing.lastMessageAt || session.startedAt,
      heartbeatAgeSec: telemetry.derived.heartbeatAgeSec,
      socketAgeSec: sessionAgeSec,
      isIdle: telemetry.derived.isIdle,
      idleAgeSec: telemetry.derived.idleDurationSec,
    });

    const diagnostics: CollectorDiagnosticsSummary = params.collectorDiagnostics || CollectorDiagnosticsTracker.getSummary(sessionAgeSec);

    const history: CollectorConnectionHistory = params.connectionHistory || {
      firstConnectedAt: session.startedAt,
      lastConnectedAt: telemetry.timing.lastHeartbeatAt || session.startedAt,
      lastDisconnectAt: !collector.connected && session.isActive ? new Date().toISOString() : null,
      reconnectAttempts: collector.reconnectCount || 0,
      connectionAgeMs: sessionAgeMs,
      hasConnectedBefore: collector.connected || (session.isActive && sessionAgeSec > 60),
    };

    const warnings: string[] = [...integrity.warnings];
    const blockers: string[] = [];
    let phase: PipelinePhase = "STOPPED";
    let blockingComponent: string | null = null;
    let recoverySuggestion: string | null = null;
    let explanation = "Monitoring pipeline is idle and stopped. Waiting for next creator stream.";
    let reason = "No active stream session in progress.";
    let impact = "No chat events are being captured.";
    let recoveryAction = "Start a monitoring session from the Creator Console.";

    // ARCHITECTURAL RULE: Collector Phase transitions ONLY from Canonical Telemetry State
    if (!session.isActive) {
      phase = "STOPPED";
      explanation = "No active monitoring session running. System is idle.";
      reason = "Session inactive.";
      impact = "Pipeline is powered down.";
      recoveryAction = "System waiting for next stream broadcast.";
    } else if (transport.state === "ERROR" || collector.lastError || collector.status === "failed") {
      phase = "ERROR";
      blockingComponent = "Collector Engine";
      explanation = `Collector connection failed: ${collector.lastError || transport.disconnectReason || "Socket error"}. Recovery attempts exhausted.`;
      reason = collector.lastError || transport.disconnectReason || "Unrecoverable platform socket error.";
      impact = "Live stream chat monitoring is completely halted.";
      recoveryAction = "Administrator intervention required. Verify platform API keys or channel configuration.";
      recoverySuggestion = recoveryAction;
      blockers.push("Fatal Collector Transport Error");
    } else if (!transport.connected || transport.readyState === 3 || transport.state === "RECONNECTING" || transport.state === "CLOSED") {
      if (!history.hasConnectedBefore && sessionAgeSec <= 60) {
        phase = "CONNECTING";
        blockingComponent = "WebSocket Negotiator";
        explanation = "Collector is establishing initial WebSocket connection with creator chatroom.";
        reason = "Initial connection handshake in progress.";
        impact = "First chat packet pending connection establishment.";
        recoveryAction = "Waiting for initial WebSocket handshake completion.";
        recoverySuggestion = recoveryAction;
        warnings.push("Initial WebSocket negotiation");
      } else {
        phase = "RECOVERING";
        blockingComponent = "WebSocket Reconnector";
        explanation = `Collector connection interrupted (${telemetry.derived.heartbeatAgeSec}s ago). Automatic reconnection attempt ${collector.reconnectCount || 1} of 5 is running.`;
        reason = "Platform WebSocket connection lost mid-stream.";
        impact = "Chat event collection temporarily paused until socket recovers.";
        recoveryAction = `Automatic reconnection attempt ${collector.reconnectCount || 1} running in background.`;
        recoverySuggestion = recoveryAction;
        warnings.push("WebSocket transport disconnected");
      }
    } else if (aiProducer.runningJobs > 0) {
      phase = "AI_PROCESSING";
      explanation = "Observation window ended. Gemini / Groq models currently processing pulse snapshot.";
      reason = "Snapshot synthesis in progress.";
      impact = "Generating intelligence recommendations.";
      recoveryAction = "Waiting for LLM inference response.";
    } else if (buffer.currentBufferSize > 0 && snapshot.remainingTimeSeconds < 5) {
      phase = "SNAPSHOTTING";
      explanation = "60-second observation window ending. Packaging buffer snapshot.";
      reason = "Window timer expiring.";
      impact = "Snapshot payload compiling.";
      recoveryAction = "System transitioning to AI synthesis.";
    } else if (buffer.currentBufferSize > 0) {
      phase = "BUFFERING";
      explanation = `Ingesting live chat events into rolling buffer (${buffer.currentBufferSize} messages buffered).`;
      reason = "Stream messages arriving normally.";
      impact = "Buffer filling for next 60s snapshot.";
      recoveryAction = "Pipeline executing normally.";
    } else if (transport.connected) {
      if (transport.isIdle || collector.messagesPerSec === 0) {
        phase = "CONNECTED";
        explanation = `Collector connected successfully (${session.platform || "Kick"}). No chat messages received during last ${telemetry.derived.idleDurationSec}s. Waiting for next event.`;
        reason = "WebSocket transport connected and open, chat stream is currently quiet.";
        impact = "System ready to capture incoming chat packets.";
        recoveryAction = "Monitoring active and listening for viewer interactions.";
      } else {
        phase = "COLLECTING";
        explanation = `Collector connected to ${session.platform || "live"} stream for ${session.creatorName}. Receiving live chat traffic.`;
        reason = "WebSocket connection healthy and receiving messages.";
        impact = "Monitoring active.";
        recoveryAction = "Listening for viewer interactions.";
      }
    } else {
      phase = "STARTING";
      explanation = "Initializing monitoring pipeline context.";
      reason = "Session initializing.";
      impact = "Subsystems booting up.";
      recoveryAction = "Preparing collector socket.";
    }

    // Secondary Degradation Rule: If session active but subsystem status warning
    if (session.isActive && phase !== "ERROR" && phase !== "RECOVERING" && phase !== "CONNECTING" && phase !== "AI_PROCESSING") {
      if (collector.status === "warning" || aiProducer.status === "failed" || snapshot.status === "failed") {
        phase = "DEGRADED";
        blockingComponent = aiProducer.status === "failed" ? "AI Producer Engine" : "Subsystem Degradation";
        explanation = "Monitoring session active, but one or more pipeline components are degraded.";
        reason = "Subsystem service degraded or quota restricted.";
        impact = "Real-time metrics may experience latency or missing insights.";
        recoveryAction = "Inspect AI quota or platform rate limits in debug console.";
        recoverySuggestion = recoveryAction;
        warnings.push("Subsystem performance degraded");
      }
    }

    let health: "Healthy" | "Warning" | "Critical" = "Healthy";
    if (phase === "ERROR" || collector.status === "failed") {
      health = "Critical";
    } else if (phase === "RECOVERING" || phase === "DEGRADED" || integrity.score < 100) {
      health = "Warning";
    }

    const previousPhase = previousStateMemory.phase;
    if (previousPhase !== phase) {
      previousStateMemory = {
        phase,
        timestamp: new Date().toISOString(),
        reason,
      };
    }

    const timelineSteps: TimelineStepItem[] = [
      {
        id: "step_sess",
        label: "Session Created",
        status: session.isActive ? "completed" : "upcoming",
        timestamp: session.startedAt,
        details: session.isActive ? `Active (${session.durationFormatted})` : undefined,
      },
      {
        id: "step_conn",
        label: transport.connected ? "Collector Connected" : history.hasConnectedBefore ? "Socket Disconnected" : "Collector Handshake",
        status: transport.connected ? "completed" : phase === "RECOVERING" ? "warning" : "upcoming",
        details: transport.connected ? `Socket Open (ReadyState ${transport.readyState})` : `Attempt ${collector.reconnectCount || 1}`,
      },
      {
        id: "step_hb",
        label: "Heartbeat Active",
        status: transport.connected ? "completed" : "upcoming",
        details: transport.connected ? `Heartbeat ${telemetry.derived.heartbeatAgeSec}s ago` : undefined,
      },
      {
        id: "step_msg",
        label: collector.messagesPerSec > 0 ? "Chat Messages Flowing" : "Waiting for Chat Activity",
        status: buffer.currentBufferSize > 0 ? "completed" : transport.connected ? "completed" : "upcoming",
        details: `${buffer.currentBufferSize} msgs in buffer`,
      },
      {
        id: "step_snap",
        label: "Snapshot Window",
        status: snapshot.isRunning ? "completed" : "upcoming",
        timestamp: snapshot.lastSnapshotTime,
        details: `${snapshot.remainingTimeSeconds}s remaining`,
      },
      {
        id: "step_ai",
        label: "AI Recommendation",
        status: aiProducer.runningJobs > 0 ? "current" : aiProducer.status === "healthy" ? "completed" : "upcoming",
        details: aiProducer.recommendationWindow,
      },
    ];

    return {
      phase,
      previousPhase,
      transitionReason: previousStateMemory.reason,
      transitionTimestamp: previousStateMemory.timestamp,
      collectorStatus: transport.connected ? "healthy" : phase === "RECOVERING" ? "warning" : "inactive",
      aiStatus: aiProducer.status,
      snapshotStatus: snapshot.status,
      bufferStatus: buffer.status,
      health,
      warnings,
      blockers,
      lastTransition: previousStateMemory.timestamp,
      explanation,
      reason,
      impact,
      recoveryAction,
      blockingComponent,
      recoverySuggestion,
      timelineSteps,
      connectionHistory: history,
      transportState: transport,
      collectorDiagnostics: diagnostics,
      telemetryState: telemetry,
      telemetryIntegrity: integrity,
    };
  }
}

import clientPromise from "@/lib/mongodb";
import { DiagnosticsState } from "@/lib/diagnostics/state";
import {
  MonitoringDashboardBundle,
  RuntimeSessionState,
  RuntimeCollectorState,
  RuntimeBufferState,
  RuntimeSnapshotState,
  RuntimeDetectionState,
  RuntimeAIProducerState,
  RepresentativeMessageItem,
  HistoricalMetricsToday,
  CollectorConnectionHistory,
} from "./monitoringTypes";
import { MonitoringRuntimeValidator } from "./monitoringRuntimeValidator";
import { RuntimeStateMachine } from "./runtimeStateMachine";
import { buildDefaultTransportState, RuntimeTransportState } from "../runtime/runtimeTransportState";
import { CollectorDiagnosticsTracker } from "../runtime/collectorDiagnostics";
import { RuntimeTelemetryEngine } from "../runtime/runtimeTelemetryEngine";
import { RuntimeTelemetryValidator } from "../runtime/runtimeTelemetryValidator";
import { Db } from "mongodb";

const safeExtractString = (val: any, fallback: string = ""): string => {
  if (val === null || val === undefined) return fallback;
  if (typeof val === "string") return val;
  if (typeof val === "number" || typeof val === "boolean") return String(val);
  if (typeof val === "object") {
    return val.username || val.displayName || val.name || val.text || val.message || val.content || fallback;
  }
  return fallback;
};

export class MonitoringDashboardBuilder {
  public static async build(): Promise<MonitoringDashboardBundle> {
    const startTime = Date.now();
    const diag = DiagnosticsState.getState();

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const startOfTodayIso = startOfToday.toISOString();

    let client;
    let db: Db | null = null;

    let dbSession: any = null;
    let snapshotsCompletedToday = 0;
    let messagesProcessedToday = 0;
    let sessionsCompletedToday = 0;
    let representativeMessagesList: RepresentativeMessageItem[] = [];

    try {
      client = await clientPromise;
      db = client.db(process.env.MONGODB_DB_NAME || "nexcreator");

      dbSession = await db.collection("monitoring_sessions").findOne({
        status: { $in: ["waiting", "starting", "live", "paused"] },
      });

      const [snapshotsCount, sessionsTodayCount] = await Promise.all([
        db.collection("pulse_snapshots").countDocuments({ createdAt: { $gte: startOfTodayIso } }),
        db.collection("monitoring_sessions").countDocuments({ createdAt: { $gte: startOfTodayIso } }),
      ]);

      snapshotsCompletedToday = snapshotsCount;
      sessionsCompletedToday = sessionsTodayCount;

      if (dbSession) {
        const latestSnap = await db.collection("pulse_snapshots")
          .find({ sessionId: dbSession.id })
          .sort({ createdAt: -1 })
          .limit(1)
          .next();

        if (latestSnap?.representativeMessages) {
          representativeMessagesList = latestSnap.representativeMessages.slice(0, 10).map((m: any, idx: number) => {
            const author = safeExtractString(m.username) || safeExtractString(m.author) || safeExtractString(m.user) || "Viewer";
            const text = safeExtractString(m.message) || safeExtractString(m.text) || safeExtractString(m.content) || "";

            return {
              id: safeExtractString(m.id, `msg_${idx}`),
              username: author,
              message: text,
              timestamp: typeof m.timestamp === "string" ? m.timestamp : new Date().toISOString(),
              platform: safeExtractString(dbSession.platform, "kick"),
            };
          });
        }
      }
    } catch (e) {
      console.error("[MonitoringDashboardBuilder] MongoDB query error:", e);
    }

    const hasActiveSession = !!(dbSession || diag.collector.connected);

    // Session State
    let durationFormatted = "—";
    let sessionAgeMs = 0;
    if (hasActiveSession && (dbSession?.startedAt || diag.detection.sessionStartTime)) {
      const startMs = new Date(dbSession?.startedAt || diag.detection.sessionStartTime!).getTime();
      sessionAgeMs = Math.max(0, Date.now() - startMs);
      const mins = Math.floor(sessionAgeMs / 60000);
      const secs = Math.floor((sessionAgeMs % 60000) / 1000);
      durationFormatted = `${mins}m ${secs}s`;
    }

    const sessionAgeSec = Math.floor(sessionAgeMs / 1000);

    const runtimeSession: RuntimeSessionState = {
      isActive: hasActiveSession,
      sessionId: hasActiveSession ? safeExtractString(dbSession?.id) || safeExtractString(diag.authentication.creatorId) || "sess_active" : null,
      creatorName: hasActiveSession ? safeExtractString(dbSession?.userId?.split("@")[0]) || safeExtractString(diag.authentication.creatorId) || "Active Creator" : null,
      creatorEmail: hasActiveSession ? safeExtractString(dbSession?.userId) || safeExtractString(diag.authentication.authenticatedUser) || null : null,
      platform: hasActiveSession ? safeExtractString(dbSession?.platform, "kick") : null,
      startedAt: hasActiveSession ? safeExtractString(dbSession?.startedAt) || safeExtractString(diag.detection.sessionStartTime) || new Date().toISOString() : null,
      durationFormatted,
      viewerCount: hasActiveSession ? dbSession?.viewerCount || diag.detection.viewerCount || 0 : 0,
      status: hasActiveSession ? (dbSession?.status as any) || "live" : "inactive",
    };

    // Collector State
    const runtimeCollector: RuntimeCollectorState = {
      status: hasActiveSession ? (diag.collector.connected ? "healthy" : "warning") : "inactive",
      connected: hasActiveSession && diag.collector.connected,
      platform: runtimeSession.platform,
      activeSockets: hasActiveSession && diag.collector.connected ? 1 : 0,
      heartbeatAgeMs: hasActiveSession && diag.collector.lastChatTimestamp
        ? Math.max(0, Date.now() - new Date(diag.collector.lastChatTimestamp).getTime())
        : 0,
      reconnectCount: diag.collector.reconnectCount || 0,
      messagesPerSec: hasActiveSession && diag.collector.parsedEvents > 0 ? Math.round(diag.collector.parsedEvents / 60) : 0,
      lastError: safeExtractString(diag.collector.lastError) || null,
      lastReconnect: safeExtractString(diag.collector.lastFailure) || null,
    };

    // SINGLE SOURCE OF TRUTH: Query Canonical RuntimeTelemetryEngine
    const telemetryState = RuntimeTelemetryEngine.getState(
      hasActiveSession,
      diag.collector,
      runtimeSession.startedAt
    );

    // Validate Telemetry Integrity
    const telemetryIntegrity = RuntimeTelemetryValidator.validate(telemetryState, hasActiveSession);

    const transportState: RuntimeTransportState = buildDefaultTransportState({
      state: telemetryState.transport.transportState,
      provider: telemetryState.transport.provider,
      readyState: telemetryState.transport.readyState,
      connected: telemetryState.transport.readyState === 1,
      connectionEstablishedAt: telemetryState.timing.connectedAt,
      lastHeartbeatAt: telemetryState.timing.lastHeartbeatAt,
      lastMessageAt: telemetryState.timing.lastMessageAt,
      disconnectReason: runtimeCollector.lastError,
      reconnectAttempts: telemetryState.counters.reconnectAttempts,
      socketAgeSec: telemetryState.derived.sessionDurationSec,
      heartbeatAgeSec: telemetryState.derived.heartbeatAgeSec,
      idleAgeSec: telemetryState.derived.idleDurationSec,
      isIdle: telemetryState.derived.isIdle,
    });

    const collectorDiagnostics = CollectorDiagnosticsTracker.getSummary(sessionAgeSec);

    const connectionHistory: CollectorConnectionHistory = {
      firstConnectedAt: runtimeSession.startedAt,
      lastConnectedAt: telemetryState.timing.lastHeartbeatAt || runtimeSession.startedAt,
      lastDisconnectAt: diag.collector.lastFailure || (!runtimeCollector.connected && hasActiveSession ? new Date().toISOString() : null),
      reconnectAttempts: diag.collector.reconnectCount || 0,
      connectionAgeMs: sessionAgeMs,
      hasConnectedBefore: runtimeCollector.connected || (hasActiveSession && sessionAgeMs > 60000),
    };

    // Buffer State
    const currentBufferSize = hasActiveSession ? diag.buffer.messages || 0 : 0;
    const maxCapacity = 10000;
    const runtimeBuffer: RuntimeBufferState = {
      status: currentBufferSize > 0 ? "healthy" : "idle",
      currentBufferSize,
      maxCapacity,
      bufferUsagePct: Math.min(100, Math.round((currentBufferSize / maxCapacity) * 100)),
      messagesPerSec: runtimeCollector.messagesPerSec,
      oldestMessageAgeSec: hasActiveSession && diag.collector.lastChatTimestamp
        ? Math.max(0, Math.round((Date.now() - new Date(diag.collector.lastChatTimestamp).getTime()) / 1000))
        : 0,
      newestMessageAgeSec: hasActiveSession ? 0 : 0,
      flushStatus: currentBufferSize > 8000 ? "flushing" : currentBufferSize > 0 ? "normal" : "idle",
    };

    // Snapshot State
    const runtimeSnapshot: RuntimeSnapshotState = {
      status: hasActiveSession ? "healthy" : "idle",
      isRunning: hasActiveSession,
      lastSnapshotTime: diag.snapshot.lastSnapshot || null,
      currentWindowSeconds: 60,
      remainingTimeSeconds: 60 - (new Date().getSeconds() % 60),
      nextSnapshotTime: new Date(Date.now() + (60 - (new Date().getSeconds() % 60)) * 1000).toISOString(),
    };

    // Detection State
    const runtimeDetection: RuntimeDetectionState = {
      status: hasActiveSession ? "healthy" : "stopped",
      rulesLoadedCount: diag.ai.ruleEngineCalls || 6,
      eventsPerSec: runtimeCollector.messagesPerSec,
      messageVelocity: runtimeCollector.messagesPerSec * 60,
      detectionLatencyMs: 12,
      currentState: hasActiveSession ? "Sampling Events" : "Stopped",
    };

    // AI Producer State
    const runtimeAIProducer: RuntimeAIProducerState = {
      status: hasActiveSession ? (diag.ai.status as any || "healthy") : "idle",
      runningJobs: hasActiveSession ? 1 : 0,
      queuedJobs: 0,
      activeWorkers: hasActiveSession ? 1 : 0,
      recommendationWindow: "60s Window",
    };

    // Historical Telemetry
    messagesProcessedToday = diag.collector.rawEvents || snapshotsCompletedToday * 40;
    const historicalToday: HistoricalMetricsToday = {
      snapshotsCompletedToday,
      messagesProcessedToday,
      sessionsCompletedToday,
      avgLatencyTodayMs: diag.ai.aiRuns > 0 ? Math.round(diag.ai.totalLatency / diag.ai.aiRuns) : 180,
    };

    // Evaluate Transition-Aware Runtime State Machine
    const runtimePipeline = RuntimeStateMachine.evaluate({
      session: runtimeSession,
      collector: runtimeCollector,
      buffer: runtimeBuffer,
      snapshot: runtimeSnapshot,
      aiProducer: runtimeAIProducer,
      connectionHistory,
      transportState,
      collectorDiagnostics,
      telemetryState,
      telemetryIntegrity,
    });

    const validation = MonitoringRuntimeValidator.validate({
      session: runtimeSession,
      collector: runtimeCollector,
      buffer: runtimeBuffer,
      snapshot: runtimeSnapshot,
      aiProducer: runtimeAIProducer,
      transportState,
    });

    const buildDurationMs = Date.now() - startTime;

    return Object.freeze({
      runtimePipeline,
      runtimeSession,
      collector: runtimeCollector,
      rollingBuffer: runtimeBuffer,
      snapshotEngine: runtimeSnapshot,
      detectionEngine: runtimeDetection,
      aiProducer: runtimeAIProducer,
      representativeMessages: hasActiveSession ? representativeMessagesList : [],
      historicalToday,
      validation,
      telemetryState,
      telemetryIntegrity,
      metadata: {
        generatedAt: new Date().toISOString(),
        buildDurationMs,
        builderVersion: "1.5.3",
      },
    });
  }
}

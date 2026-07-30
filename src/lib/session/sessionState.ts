import clientPromise from "@/lib/mongodb";
import { IngestionManager } from "@/lib/ingestion/manager";
import { SnapshotManager } from "@/lib/snapshot/manager";
import { SessionIntegrityEngine } from "./integrity";
import { SNAPSHOT_CONFIG } from "@/lib/snapshot/config";
import { IntelligenceStorage } from "@/lib/intelligence/storage";


export type LiveRuntimePhase =
  | "WAITING"
  | "STREAM_DETECTED"
  | "INITIALIZING"
  | "BUILDING_FIRST_WINDOW"
  | "FIRST_SNAPSHOT_READY"
  | "LIVE"
  | "STOPPING"
  | "FINALIZING"
  | "COMPLETED";

export interface LiveSessionState {
  session: any;
  phase: LiveRuntimePhase;
  telemetry: {
    viewerCount: number;
    peakViewerCount: number;
    averageViewerCount: number;
    totalMessages: number;
    messagesPerMinute: number;
    uniqueChatters: number;
    questionsCount: number;
    sentimentScore: number;
    momentumIndex: number;
    hypeScore: number;
  };
  collector: {
    running: boolean;
    platform: string;
    bufferSize: number;
    lastMessageAt: string | null;
  };
  currentWindow: {
    elapsedSeconds: number;
    remainingSeconds: number;
    progressPercent: number;
    snapshotIntervalSeconds: number;
    snapshotCount: number;
  };
  analytics: {
    snapshotsCount: number;
    insightsCount: number;
    highlightsCount: number;
    timelineCount: number;
  };
  livePulse: {
    snapshots: any[];
    velocity: string;
  };
  aiProducer: {
    insights: any[];
  };
  timeline: {
    events: any[];
  };
  highlights: {
    candidates: any[];
  };
  chat: {
    messages: any[];
    recentCount: number;
  };
  intelligence?: any;
  health: {
    score: number;
    collectorHealthy: boolean;
    pollerHealthy: boolean;
    engineHealthy: boolean;
  };

  integrity: {
    sessionType: "EMPTY" | "PARTIAL" | "COMPLETE";
    analyticsValid: boolean;
    aiValid: boolean;
    highlightsValid: boolean;
    timelineValid: boolean;
    reportValid: boolean;
    healthScoreValid: boolean;
    reason: string;
  };
}

export class SessionStateBuilder {
  public static async build(sessionId: string): Promise<LiveSessionState | null> {
    const client = await clientPromise;
    const db = client.db("nexcreator");

    // 1. Fetch Session Document
    const session: any = await db.collection("monitoring_sessions").findOne({ id: sessionId });
    if (!session) return null;

    // 2. Fetch Ingestion Pipeline Memory (if active)
    const pipeline = IngestionManager.getPipeline(sessionId);
    const isIngesting = IngestionManager.isIngesting(sessionId);
    const isSnapshotRunning = SnapshotManager.isEngineRunning(sessionId);

    // 3. Fetch Database Artifacts
    const [snapshots, insights, timelineEvents, highlights] = await Promise.all([
      db.collection("pulse_snapshots").find({ sessionId }).sort({ createdAt: 1 }).toArray(),
      db.collection("ai_insights").find({ sessionId }).sort({ createdAt: -1 }).toArray(),
      db.collection("timeline_events").find({ sessionId }).sort({ timestamp: -1 }).toArray(),
      db.collection("highlight_candidates").find({ sessionId }).sort({ createdAt: -1 }).toArray(),
    ]);

    // 4. Derive In-Memory Telemetry & Buffer Messages
    let bufferMessages: any[] = [];
    let bufferSize = 0;
    let lastMessageAt: string | null = null;
    let liveMetrics: any = null;

    if (pipeline) {
      bufferMessages = pipeline.buffer.getMessages();
      bufferSize = pipeline.buffer.size();
      if (bufferMessages.length > 0) {
        lastMessageAt = bufferMessages[bufferMessages.length - 1].timestamp || new Date().toISOString();
      }
      liveMetrics = pipeline.accumulator.getMetricsSummary();
    }

    // 5. Derive Telemetry Numbers
    const snapshotsCount = snapshots.length;
    const totalMessages = snapshots.reduce((acc, s: any) => acc + (s.metrics?.totalMessages || 0), bufferSize);
    const uniqueChatters = snapshots.reduce((acc, s: any) => Math.max(acc, s.metrics?.uniqueChattersCount || 0), liveMetrics?.uniqueChattersCount || 0);
    const questionsCount = snapshots.reduce((acc, s: any) => acc + (s.metrics?.questionCount || 0), liveMetrics?.questionCount || 0);

    const latestSnapshot = snapshotsCount > 0 ? snapshots[snapshotsCount - 1] : null;

    const viewerCount = session.viewerCount || latestSnapshot?.analytics?.viewers || 0;
    const peakViewerCount = Math.max(session.peakViewerCount || 0, viewerCount, latestSnapshot?.analytics?.viewers || 0);
    const averageViewerCount = snapshotsCount > 0 ? Math.round(snapshots.reduce((acc, s: any) => acc + (s.analytics?.viewers || 0), 0) / snapshotsCount) : viewerCount;

    const sentimentScore = latestSnapshot?.analytics?.sentiment ?? (liveMetrics?.sentimentScore || 50);
    const momentumIndex = latestSnapshot?.analytics?.momentum ?? 50;
    const hypeScore = latestSnapshot?.analytics?.hypeScore ?? 0;
    const messagesPerMinute = latestSnapshot?.metrics?.messagesPerMinute ?? (liveMetrics?.messagesPerMinute || 0);

    // 6. Current Window Math (10-minute snapshot interval)
    const intervalMs = SNAPSHOT_CONFIG.SNAPSHOT_INTERVAL_MS || 600000;
    const intervalSec = Math.round(intervalMs / 1000);

    const sessionStart = new Date(session.startedAt || session.createdAt || Date.now()).getTime();
    const elapsedTotalSec = Math.max(0, Math.floor((Date.now() - sessionStart) / 1000));
    const elapsedInWindowSec = elapsedTotalSec % intervalSec;
    const remainingInWindowSec = intervalSec - elapsedInWindowSec;
    const progressPercent = Math.min(100, Math.round((elapsedInWindowSec / intervalSec) * 100));

    // 7. Derive Explicit Runtime Phase
    let phase: LiveRuntimePhase = "WAITING";
    const status = session.status;

    if (status === "completed") {
      phase = "COMPLETED";
    } else if (status === "stopping" || status === "finalizing") {
      phase = "FINALIZING";
    } else if (status === "waiting") {
      phase = "WAITING";
    } else if (snapshotsCount > 0) {
      phase = "LIVE";
    } else if (isIngesting || bufferSize > 0) {
      phase = "BUILDING_FIRST_WINDOW";
    } else if (session.streamDetected || viewerCount > 0) {
      phase = "STREAM_DETECTED";
    } else {
      phase = "INITIALIZING";
    }

    // 8. Session Intelligence Bundle
    const intelligence = await IntelligenceStorage.fetchLatestBundle(sessionId);

    // 9. Session Integrity Evaluation
    const streamDetected = Boolean(status === "live" || session.streamDetected || viewerCount > 0 || snapshotsCount > 0);
    const evaluation = SessionIntegrityEngine.evaluate({
      streamDetected,
      messagesCount: totalMessages,
      snapshotsCount,
      aiRunsCount: insights.length,
      highlightsCount: highlights.length,
      timelineCount: timelineEvents.length,
      viewerSamplesCount: snapshotsCount,
    });

    return {
      session,
      phase,
      telemetry: {
        viewerCount,
        peakViewerCount,
        averageViewerCount,
        totalMessages,
        messagesPerMinute,
        uniqueChatters,
        questionsCount,
        sentimentScore,
        momentumIndex,
        hypeScore,
      },
      collector: {
        running: isIngesting,
        platform: session.platform || "kick",
        bufferSize,
        lastMessageAt,
      },
      currentWindow: {
        elapsedSeconds: elapsedInWindowSec,
        remainingSeconds: remainingInWindowSec,
        progressPercent,
        snapshotIntervalSeconds: intervalSec,
        snapshotCount: snapshotsCount,
      },
      analytics: {
        snapshotsCount,
        insightsCount: insights.length,
        highlightsCount: highlights.length,
        timelineCount: timelineEvents.length,
      },
      livePulse: {
        snapshots,
        velocity: messagesPerMinute > 30 ? "High Velocity" : "Normal Velocity",
      },
      aiProducer: {
        insights,
      },
      timeline: {
        events: timelineEvents,
      },
      highlights: {
        candidates: highlights,
      },
      chat: {
        messages: bufferMessages.slice(-100),
        recentCount: bufferMessages.length,
      },
      intelligence,
      health: {
        score: evaluation.integrityFlags.healthScoreValid ? 98 : 0,
        collectorHealthy: isIngesting,
        pollerHealthy: true,
        engineHealthy: isSnapshotRunning,
      },
      integrity: {
        sessionType: evaluation.sessionType,
        ...evaluation.integrityFlags,
        reason: evaluation.reason,
      },
    };
  }
}


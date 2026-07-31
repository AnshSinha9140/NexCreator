import clientPromise from "@/lib/mongodb";
import { MonitoringSessionManager } from "@/lib/monitoringSessionManager";
import { getPlatformDetector } from "./index";
import { StreamMetadata } from "./types";
import { SessionStatus } from "@/types";
import { IngestionManager } from "@/lib/ingestion/manager";
import { SnapshotManager } from "@/lib/snapshot/manager";
import { DETECTION_CONFIG } from "./config";
import { DiagnosticsLogger } from "@/lib/diagnostics/logger";
import { DiagnosticsState } from "@/lib/diagnostics/state";

export interface DetectionPollResult {
  sessionId: string;
  isLive: boolean;
  status: SessionStatus;
  metadata: StreamMetadata & { remainingGraceSeconds?: number };
  updatedAt: string;
}

const globalWithDetection = global as typeof globalThis & {
  _activePollers?: Map<string, NodeJS.Timeout>;
  _pollingMetadata?: Map<string, { channelHandle: string; platform: string; storedChatroomId?: string }>;
  _offlineSinceTimestamps?: Map<string, number>;
};

if (!globalWithDetection._activePollers) {
  globalWithDetection._activePollers = new Map();
}
if (!globalWithDetection._pollingMetadata) {
  globalWithDetection._pollingMetadata = new Map();
}
if (!globalWithDetection._offlineSinceTimestamps) {
  globalWithDetection._offlineSinceTimestamps = new Map();
}

export class LiveDetectionPoller {
  static isPolling(sessionId: string): boolean {
    return globalWithDetection._activePollers!.has(sessionId);
  }

  static startPolling(sessionId: string, channelHandle: string, platform: string, storedChatroomId?: string) {
    if (this.isPolling(sessionId)) {
      const oldIntervalId = globalWithDetection._activePollers!.get(sessionId);
      if (oldIntervalId) clearInterval(oldIntervalId);
    }

    globalWithDetection._pollingMetadata!.set(sessionId, { channelHandle, platform, storedChatroomId });
    console.log(`[Daemon] ▶ Starting detection poller for session '${sessionId}' | channel: '${channelHandle}' | storedChatroomId: '${storedChatroomId || "not stored — will resolve"}'`);

    this.pollSession(sessionId).catch(console.error);
    const intervalId = setInterval(async () => {
      try {
        await this.pollSession(sessionId);
        
        const now = Date.now();
        const state = DiagnosticsState.getState();
        const checkStaleness = (subsys: "collector" | "buffer" | "snapshot" | "ai", lastSuccess: string | null) => {
           if (lastSuccess && now - new Date(lastSuccess).getTime() > 60000) {
               let reason = "Inactive for >60s";
               if (subsys === "collector") {
                 if (state.collector.rawEvents === 0) reason = "NO WEBSOCKET EVENTS";
                 else if (state.collector.parseFailures > 0) reason = "PARSE FAILURE";
                 else if (state.collector.unknownEvents > 0 && state.collector.parsedEvents === 0) reason = "UNKNOWN EVENTS";
                 else reason = "NO CHAT MESSAGES";
               } else if (subsys === "buffer") {
                 if (state.collector.parsedEvents > 0 && state.buffer.messages === 0) reason = "BUFFER FAILURE";
               }
               DiagnosticsLogger.warn(subsys.toUpperCase(), "HealthCheck", `⚠ Subsystem warning: ${reason}`);
               DiagnosticsState.updateSubsystem(subsys, { status: "warning", lastFailure: new Date().toISOString(), lastError: reason });
           }
        };
        checkStaleness("collector", state.collector.lastSuccess);
        checkStaleness("buffer", state.buffer.lastSuccess);
        checkStaleness("snapshot", state.snapshot.lastSuccess);
        checkStaleness("ai", state.ai.lastSuccess);

      } catch (err) {
        console.error(`[Daemon Error] Detection loop exception for session '${sessionId}':`, err);
        DiagnosticsLogger.error("Detection", "PollLoop", `Detection loop exception for session '${sessionId}'`, err instanceof Error ? err.message : String(err));
        DiagnosticsState.updateSubsystem("detection", { status: "failed", lastFailure: new Date().toISOString(), lastError: err instanceof Error ? err.message : "Unknown error" });
      }
    }, DETECTION_CONFIG.POLL_INTERVAL_MS);

    globalWithDetection._activePollers!.set(sessionId, intervalId);
    console.log(`[Daemon] ✅ Background detection poller loop active for session: ${sessionId}`);
  }

  static stopPolling(sessionId: string) {
    const intervalId = globalWithDetection._activePollers!.get(sessionId);
    if (intervalId) {
      clearInterval(intervalId);
      globalWithDetection._activePollers!.delete(sessionId);
      globalWithDetection._pollingMetadata!.delete(sessionId);
      globalWithDetection._offlineSinceTimestamps!.delete(sessionId);
      console.log(`[Daemon] Stopped background detection loop for session: ${sessionId}`);
      DiagnosticsState.printSessionSummary();
    }

    SnapshotManager.stopSnapshotEngine(sessionId, true).catch((err) => {
      console.warn(`[Daemon] Snapshot finalization warning for session '${sessionId}':`, err.message);
    });

    IngestionManager.stopIngestion(sessionId).catch((err) => {
      console.warn(`[Daemon] Ingestion cleanup warning for session '${sessionId}':`, err.message);
    });
  }

  static async pollSession(sessionId: string): Promise<DetectionPollResult> {
    DiagnosticsLogger.log("Detection", "Poll", "Poll started");
    try {
      const client = await clientPromise;
      const db = client.db("nexcreator");
      const collection = db.collection("monitoring_sessions");

      const sessionDoc: any = await collection.findOne({ id: sessionId });
      if (!sessionDoc) {
        this.stopPolling(sessionId);
        throw new Error(`Monitoring session '${sessionId}' not found.`);
      }

      if (["completed", "failed"].includes(sessionDoc.status)) {
        this.stopPolling(sessionId);
        return {
          sessionId,
          isLive: false,
          status: sessionDoc.status,
          metadata: { isLive: false, streamTitle: sessionDoc.streamTitle },
          updatedAt: new Date().toISOString(),
        };
      }

      const meta = globalWithDetection._pollingMetadata!.get(sessionId);
      if (!meta) {
        this.stopPolling(sessionId);
        throw new Error(`Missing polling metadata for session '${sessionId}'`);
      }

      const { channelHandle, platform } = meta;

      let targetPlatform = platform;
      let targetHandle = channelHandle;
      let streamMeta: StreamMetadata;

      if (platform === "auto") {
        const userDoc = await db.collection("users").findOne({ email: sessionDoc.userId });
        const connectedPlatforms: any[] = userDoc?.connectedPlatforms || [];

        let detectedLiveMeta: StreamMetadata | null = null;
        let detectedPlatform = "auto";
        let detectedHandle = channelHandle;

        for (const cp of connectedPlatforms) {
          const platName = (cp.platform || "").toLowerCase();
          const platHandle = cp.username || cp.channelUrl || channelHandle;
          try {
            const detector = getPlatformDetector(platName);
            const metaResult = await detector.getStreamMetadata(platHandle);
            if (metaResult.isLive) {
              detectedLiveMeta = metaResult;
              detectedPlatform = platName;
              detectedHandle = platHandle;
              break;
            }
          } catch (e) {}
        }

        if (detectedLiveMeta) {
          targetPlatform = detectedPlatform;
          targetHandle = detectedHandle;
          streamMeta = detectedLiveMeta;
          sessionDoc.platform = detectedPlatform;
          sessionDoc.platformDisplayName = detectedPlatform === "kick" ? "Kick" : detectedPlatform === "youtube" ? "YouTube" : detectedPlatform;
        } else {
          streamMeta = { isLive: false };
        }
      } else {
        const detector = getPlatformDetector(platform);
        streamMeta = await detector.getStreamMetadata(channelHandle, sessionId);
      }
      
      DiagnosticsLogger.log("Detection", "Poll", `Poll completed. Current status: ${sessionDoc.status}. Viewer count: ${streamMeta.viewerCount || 0}`);
      const state = DiagnosticsState.getState();
      DiagnosticsState.updateSubsystem("detection", { 
          status: "healthy", 
          lastSuccess: new Date().toISOString(), 
          viewerCount: streamMeta.viewerCount || 0,
          peakViewers: Math.max(state.detection.peakViewers || 0, streamMeta.viewerCount || 0)
      });

      let updatedSession = MonitoringSessionManager.updateHeartbeat(sessionDoc);

      if (!streamMeta.isLive && sessionDoc.status === "waiting") {
        await collection.updateOne({ id: sessionId }, { $set: updatedSession });
        return {
          sessionId,
          isLive: false,
          status: "waiting",
          metadata: streamMeta,
          updatedAt: new Date().toISOString(),
        };
      }

      if (streamMeta.isLive && sessionDoc.status === "waiting") {
        updatedSession = MonitoringSessionManager.transitionStatus(updatedSession, "starting");
        updatedSession = MonitoringSessionManager.transitionStatus(updatedSession, "live");

        updatedSession = MonitoringSessionManager.updateMetadata(updatedSession, {
          streamTitle: streamMeta.streamTitle,
          streamCategory: streamMeta.streamCategory,
          thumbnail: streamMeta.thumbnail,
          streamLanguage: streamMeta.streamLanguage,
        });

        if (typeof streamMeta.viewerCount === "number") {
          updatedSession = MonitoringSessionManager.updateViewerCount(
            updatedSession,
            streamMeta.viewerCount
          );
        }

        await collection.updateOne({ id: sessionId }, { $set: updatedSession });

        const chatroomIdForIngestion = meta.storedChatroomId || streamMeta.chatroomId;
        console.log(`[Daemon] 🔴 Session '${sessionId}' is LIVE (${targetPlatform} / '${targetHandle}'). Starting ingestion with chatroomId: '${chatroomIdForIngestion || "unknown"}'`);
        IngestionManager.startIngestion(sessionId, targetPlatform, targetHandle, chatroomIdForIngestion).catch((err) => {
          console.error(`[Daemon] Failed to auto-start chat ingestion for session '${sessionId}':`, err.message);
        });
        SnapshotManager.startSnapshotEngine(sessionId);

        const { TimelinePublisher } = await import("@/lib/timeline/publisher");
        TimelinePublisher.publish(
          sessionId,
          targetPlatform as any,
          "LIVE_STREAM_DETECTED",
          `🔴 ${targetPlatform.toUpperCase()} Live Broadcast Detected`,
          `Stream "${streamMeta.streamTitle || "Live Stream"}" is active with ${streamMeta.viewerCount || 0} live viewers.`,
          "success",
          { viewerCount: streamMeta.viewerCount }
        ).catch(() => {});

        TimelinePublisher.publish(
          sessionId,
          targetPlatform as any,
          "COLLECTOR_CONNECTED",
          `⚡ ${targetPlatform.toUpperCase()} Chat Collector Connected`,
          `Ingestion pipeline and Pulse Snapshot Engine enabled for session '${sessionId}'.`,
          "info"
        ).catch(() => {});

        console.log(`[Daemon] Session '${sessionId}' transitioned to LIVE! Enabled chat ingestion & snapshot engines. ✅`);
        DiagnosticsState.updateSubsystem("detection", { sessionStartTime: new Date().toISOString() });

        return {
          sessionId,
          isLive: true,
          status: "live",
          metadata: streamMeta,
          updatedAt: new Date().toISOString(),
        };
      }

      if (streamMeta.isLive && (sessionDoc.status === "live" || sessionDoc.status === "offline_pending")) {
        if (sessionDoc.status === "offline_pending") {
          console.log(`[Daemon] Stream RECOVERED for session '${sessionId}' during grace period! Resumed LIVE status. 🔄`);
          updatedSession = MonitoringSessionManager.transitionStatus(updatedSession, "live");
          globalWithDetection._offlineSinceTimestamps!.delete(sessionId);
          if (updatedSession.metadata) {
            delete updatedSession.metadata.remainingGraceSeconds;
            delete updatedSession.metadata.offlinePendingSince;
          }
        }

        if (!IngestionManager.isIngesting(sessionId)) {
          const chatroomIdForIngestion = meta.storedChatroomId || streamMeta.chatroomId;
          console.log(`[Daemon] ♻️ Re-starting ingestion for live session '${sessionId}' (${targetPlatform} / '${targetHandle}') with chatroomId: '${chatroomIdForIngestion || "unknown"}'`);
          IngestionManager.startIngestion(sessionId, targetPlatform, targetHandle, chatroomIdForIngestion).catch((err) => {
            console.error(`[Daemon] Failed to ensure chat ingestion for live session '${sessionId}':`, err.message);
          });
        }
        if (!SnapshotManager.isEngineRunning(sessionId)) {
          SnapshotManager.startSnapshotEngine(sessionId);
        }
        if (typeof streamMeta.viewerCount === "number") {
          updatedSession = MonitoringSessionManager.updateViewerCount(
            updatedSession,
            streamMeta.viewerCount
          );
        }
        updatedSession = MonitoringSessionManager.updateMetadata(updatedSession, {
          streamTitle: streamMeta.streamTitle,
          streamCategory: streamMeta.streamCategory,
          thumbnail: streamMeta.thumbnail,
          streamLanguage: streamMeta.streamLanguage,
        });

        await collection.updateOne({ id: sessionId }, { $set: updatedSession });

        return {
          sessionId,
          isLive: true,
          status: "live",
          metadata: streamMeta,
          updatedAt: new Date().toISOString(),
        };
      }

      const graceSec = Math.floor(DETECTION_CONFIG.OFFLINE_GRACE_PERIOD_MS / 1000);

      // 4. OFFLINE GRACE PERIOD FLOW
      if (!streamMeta.isLive && sessionDoc.status === "live") {
        console.log(`[Daemon] ⚠️ Stream went offline for session '${sessionId}'. Entering ${graceSec}s Grace Period...`);
        updatedSession = MonitoringSessionManager.transitionStatus(updatedSession, "offline_pending");

        const nowMs = Date.now();
        globalWithDetection._offlineSinceTimestamps!.set(sessionId, nowMs);

        await collection.updateOne({ id: sessionId }, { $set: updatedSession });

        return {
          sessionId,
          isLive: false,
          status: "offline_pending",
          metadata: {
            isLive: false,
            remainingGraceSeconds: graceSec,
          },
          updatedAt: new Date().toISOString(),
        };
      }

      if (!streamMeta.isLive && sessionDoc.status === "offline_pending") {
        const offlineSince = globalWithDetection._offlineSinceTimestamps!.get(sessionId) || Date.now();
        const elapsedSec = Math.floor((Date.now() - offlineSince) / 1000);
        const remainingSec = Math.max(0, graceSec - elapsedSec);

        if (remainingSec === 0) {
          console.log(`[Daemon] 🏁 Grace period expired (${graceSec}s). Finalizing session '${sessionId}'...`);
          const { SessionFinalizer } = await import("@/lib/session/finalizer");
          await SessionFinalizer.finalizeSession(sessionId);

          this.stopPolling(sessionId);

          return {
            sessionId,
            isLive: false,
            status: "completed",
            metadata: { isLive: false, remainingGraceSeconds: 0 },
            updatedAt: new Date().toISOString(),
          };
        }

        return {
          sessionId,
          isLive: false,
          status: "offline_pending",
          metadata: { isLive: false, remainingGraceSeconds: remainingSec },
          updatedAt: new Date().toISOString(),
        };
      }

      return {
        sessionId,
        isLive: streamMeta.isLive,
        status: sessionDoc.status,
        metadata: streamMeta,
        updatedAt: new Date().toISOString(),
      };
    } catch (err: any) {
      console.error(`[Daemon Error] Error polling session '${sessionId}':`, err.message);
      throw err;
    }
  }
}

import { BaseCollector } from "../base/collector";
import { HealthState, CollectorDiagnostics, CollectorOptions } from "../base/types";
import { YouTubePollingEngine } from "./youtubePolling";
import { YouTubeCollectorState, CollectorHealthScore, TimelineEvent } from "./types";
import { getVideoIdFromUrl } from "@/lib/youtube";
import { DiagnosticsLogger } from "@/lib/diagnostics/logger";
import { DiagnosticsState } from "@/lib/diagnostics/state";

export class YouTubeCollector extends BaseCollector {
  public readonly sessionId: string;
  public readonly platform = "youtube";

  private channelHandle?: string;
  private activeLiveChatId?: string;
  private currentVideoId?: string;
  private apiKey: string;
  private pollingEngine?: YouTubePollingEngine;

  // State Machine & Telemetry
  private currentState: YouTubeCollectorState = "INITIALIZING";
  private lastError: string | null = null;
  private lastRecoveryAt: string | null = null;
  private recoveryCount: number = 0;

  private heartbeatIntervalId?: NodeJS.Timeout;
  private lastHeartbeatAt: string | null = null;
  private lastSuccessfulPollAt: string | null = null;

  private timelineEvents: TimelineEvent[] = [];

  constructor(sessionId: string, options: CollectorOptions = {}) {
    super();
    this.sessionId = sessionId;
    this.channelHandle = options.channelHandle;
    this.activeLiveChatId = options.activeLiveChatId || options.chatroomId;
    this.apiKey = process.env.YOUTUBE_API_KEY || "";
  }

  public async start(): Promise<void> {
    if (this.currentState === "POLLING" || this.currentState === "CONNECTING") return;

    this.transitionState("CONNECTING");
    this.isPaused = false;
    this.emitTimelineEvent("Monitoring Started", { sessionId: this.sessionId, platform: "youtube" });

    try {
      if (!this.apiKey) {
        throw new Error("YOUTUBE_API_KEY missing in environment variables.");
      }

      // Step 1: Resolve activeLiveChatId if not cached
      if (!this.activeLiveChatId && this.channelHandle) {
        this.transitionState("RESOLVING_CHAT");
        this.activeLiveChatId = await this.resolveLiveChatId(this.channelHandle);
      }

      if (!this.activeLiveChatId) {
        throw new Error(`Could not resolve active Live Chat ID for YouTube session '${this.sessionId}'.`);
      }

      this.emitTimelineEvent("Chat ID Resolved", { activeLiveChatId: this.activeLiveChatId });
      console.log(`[YouTubeCollector] Resolved activeLiveChatId '${this.activeLiveChatId}' for session '${this.sessionId}'`);

      // Step 2: Instantiate & start polling engine
      this.pollingEngine = new YouTubePollingEngine(
        this.sessionId,
        this.activeLiveChatId,
        this.apiKey,
        (msg) => {
          if (this.currentState !== "POLLING" && this.currentState !== "PROCESSING") {
            this.transitionState("POLLING");
          }
          this.lastHeartbeatAt = new Date().toISOString();
          this.emitMessage(msg);
          DiagnosticsState.updateSubsystem("collector", {
            lastSuccess: this.lastHeartbeatAt,
            status: "healthy",
          });
        },
        (err) => {
          this.lastError = err.message;
          if (this.currentState !== "BACKOFF" && this.currentState !== "RECOVERING") {
            this.transitionState("BACKOFF");
            this.emitTimelineEvent("Backoff Started", { error: err.message });
          }
          DiagnosticsLogger.warn("Collector", "YouTubePolling", err.message);
        },
        () => {
          console.log(`[YouTubeCollector] YouTube Stream completed for session '${this.sessionId}'`);
          this.stop();
        },
        undefined, // Initial pageToken
        () => {
          // Automated invalid token recovery event
          this.emitTimelineEvent("Recovered", { reason: "Reset invalid pageToken" });
        }
      );

      this.pollingEngine.start();
      this.transitionState("POLLING");
      this.emitTimelineEvent("Polling Started", { activeLiveChatId: this.activeLiveChatId });

      // Start Heartbeat Monitor
      this.startHeartbeatMonitor();
      console.log(`[YouTubeCollector] Production-hardened YouTube collector active for session '${this.sessionId}' ✅`);
    } catch (err: any) {
      this.transitionState("FAILED");
      this.lastError = err.message || "Failed to start YouTube collector";
      this.emitTimelineEvent("Collector Failed", { error: this.lastError });
      console.error(`[YouTubeCollector] Failed to start collector for session '${this.sessionId}':`, err.message);
      throw err;
    }
  }

  public async stop(): Promise<void> {
    this.transitionState("STOPPING");
    this.stopHeartbeatMonitor();

    if (this.pollingEngine) {
      this.pollingEngine.stop();
      this.pollingEngine = undefined;
    }

    this.transitionState("STOPPED");
    this.emitTimelineEvent("Monitoring Stopped", { sessionId: this.sessionId });
    console.log(`[YouTubeCollector] Stopped collector for session '${this.sessionId}'`);
  }

  public async pause(): Promise<void> {
    this.isPaused = true;
    this.transitionState("WAITING");
  }

  public async resume(): Promise<void> {
    this.isPaused = false;
    this.transitionState("POLLING");
  }

  public health(): HealthState {
    switch (this.currentState) {
      case "CONNECTING":
      case "RESOLVING_CHAT":
      case "INITIALIZING":
        return "CONNECTING";
      case "POLLING":
      case "PROCESSING":
        return "ACTIVE";
      case "WAITING":
        return "WARNING";
      case "BACKOFF":
      case "RECOVERING":
        return "DEGRADED";
      case "FAILED":
        return "FAILED";
      case "STOPPING":
      case "STOPPED":
      default:
        return "STOPPED";
    }
  }

  public getHealthScore(): CollectorHealthScore {
    const diag = this.stats();
    let score = 100;

    const heartbeatAgeSec = this.lastHeartbeatAt
      ? (Date.now() - new Date(this.lastHeartbeatAt).getTime()) / 1000
      : 0;

    if (heartbeatAgeSec > 90) score -= 30;
    if (heartbeatAgeSec > 180) score -= 40;

    if (diag.errorsCount > 0) score -= Math.min(diag.errorsCount * 5, 25);
    if ((diag.quotaUsagePct || 0) > 80) score -= 15;
    if (diag.backoffState === "EXPONENTIAL_RETRY") score -= 20;

    score = Math.max(0, Math.min(100, score));
    let category: "Healthy" | "Warning" | "Critical" | "Failed" = "Healthy";

    if (score < 30 || this.currentState === "FAILED") category = "Failed";
    else if (score < 60) category = "Critical";
    else if (score < 90) category = "Warning";

    return {
      score,
      category,
      factors: {
        heartbeatStatus: heartbeatAgeSec > 180 ? "STALE_FAILED" : heartbeatAgeSec > 90 ? "STALE_WARN" : "HEALTHY",
        recoveryCount: this.recoveryCount,
        latencyMs: diag.apiLatencyMs || 0,
        errorRate: diag.errorsCount,
        quotaUsagePct: diag.quotaUsagePct || 0,
        duplicatePct: diag.duplicatePct || 0,
      },
    };
  }

  public stats(): CollectorDiagnostics {
    if (!this.pollingEngine) {
      const hs = this.getHealthScore();
      return {
        platform: "youtube",
        sessionId: this.sessionId,
        health: this.health(),
        requestsCount: 0,
        messagesReceived: 0,
        messagesParsed: 0,
        messagesRejected: 0,
        reconnectCount: this.recoveryCount,
        quotaWarnings: 0,
        errorsCount: 0,
        lastPollAt: null,
        lastMessageAt: null,
        lastError: this.lastError,
        collectorState: this.currentState,
        healthScore: hs.score,
        healthCategory: hs.category,
      };
    }

    const ps = this.pollingEngine.getStats();
    const qt = ps.quotaTelemetry;
    const cs = ps.cacheStats;
    const hs = this.getHealthScore();

    return {
      platform: "youtube",
      sessionId: this.sessionId,
      health: this.health(),
      pollingIntervalMillis: ps.pollingIntervalMillis,
      apiLatencyMs: ps.apiLatencyMs,
      requestsCount: ps.requestsCount,
      messagesReceived: ps.messagesReceived,
      messagesParsed: ps.messagesParsed,
      messagesRejected: ps.messagesRejected,
      reconnectCount: ps.reconnectCount + this.recoveryCount,
      quotaWarnings: ps.quotaWarnings,
      errorsCount: ps.errorsCount,
      lastPollAt: ps.lastPollAt,
      lastMessageAt: ps.lastMessageAt,
      lastError: ps.lastError || this.lastError,

      // Quota & Adaptive Telemetry
      quotaUsagePct: qt.quotaUsagePct,
      estimatedRemainingRequests: qt.estimatedRemainingRequests,
      estimatedRemainingMinutes: qt.estimatedRemainingMinutes,
      requestsPerMinute: qt.requestsPerMinute,
      averagePollIntervalMs: qt.averagePollIntervalMs,
      backoffState: ps.backoffState,

      // Production Hardening & Diagnostics
      collectorState: this.currentState,
      currentPageToken: ps.currentPageToken,
      chatId: this.activeLiveChatId || null,
      videoId: this.currentVideoId || null,
      uniqueMessages: cs.uniqueMessages,
      duplicatesRemoved: cs.duplicatesRemoved,
      duplicatePct: cs.duplicatePct,
      healthScore: hs.score,
      healthCategory: hs.category,
      lastSuccessfulPollAt: ps.lastSuccessfulPollAt,
      lastHeartbeatAt: ps.lastHeartbeatAt || this.lastHeartbeatAt,
      lastRecoveryAt: this.lastRecoveryAt,
    };
  }

  public getTimelineEvents(): TimelineEvent[] {
    return [...this.timelineEvents];
  }

  private transitionState(newState: YouTubeCollectorState): void {
    if (this.currentState === newState) return;
    console.log(`[YouTubeCollectorState] '${this.currentState}' ➔ '${newState}' for session '${this.sessionId}'`);
    this.currentState = newState;
  }

  private emitTimelineEvent(
    eventType: TimelineEvent["eventType"],
    details?: Record<string, any>
  ): void {
    const event: TimelineEvent = {
      id: `evt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
      eventType,
      details,
    };
    this.timelineEvents.push(event);
    if (this.timelineEvents.length > 50) this.timelineEvents.shift();
    DiagnosticsLogger.log("Collector", "Timeline", `${eventType}: ${details ? JSON.stringify(details) : ""}`);
  }

  private startHeartbeatMonitor(): void {
    this.stopHeartbeatMonitor();
    this.heartbeatIntervalId = setInterval(() => {
      if (!this.pollingEngine || this.currentState === "STOPPED" || this.currentState === "FAILED") return;

      const ps = this.pollingEngine.getStats();
      const lastPollTime = ps.lastSuccessfulPollAt ? new Date(ps.lastSuccessfulPollAt).getTime() : 0;
      const ageSec = lastPollTime > 0 ? (Date.now() - lastPollTime) / 1000 : 0;

      if (ageSec > 180) {
        console.warn(`[YouTubeCollectorHeartbeat] No successful poll for ${Math.round(ageSec)}s (>180s). Triggering auto-recovery...`);
        this.triggerAutoRecovery("Heartbeat timeout >180s");
      } else if (ageSec > 90) {
        if (this.currentState !== "BACKOFF" && this.currentState !== "RECOVERING") {
          this.transitionState("WAITING");
          DiagnosticsLogger.warn("Collector", "Heartbeat", `No successful poll for ${Math.round(ageSec)}s (>90s)`);
        }
      }
    }, 15000);
  }

  private stopHeartbeatMonitor(): void {
    if (this.heartbeatIntervalId) {
      clearInterval(this.heartbeatIntervalId);
      this.heartbeatIntervalId = undefined;
    }
  }

  private async triggerAutoRecovery(reason: string): Promise<void> {
    this.recoveryCount++;
    this.lastRecoveryAt = new Date().toISOString();
    this.transitionState("RECOVERING");
    this.emitTimelineEvent("Recovered", { reason, recoveryCount: this.recoveryCount });

    try {
      if (this.pollingEngine) {
        this.pollingEngine.stop();
      }
      this.activeLiveChatId = undefined; // Force chat ID re-resolution
      await this.start();
    } catch (err: any) {
      this.transitionState("FAILED");
      this.lastError = err.message || "Auto-recovery failed";
    }
  }

  private async resolveLiveChatId(handleOrUrl: string): Promise<string | undefined> {
    const videoId = getVideoIdFromUrl(handleOrUrl);
    if (videoId) {
      this.currentVideoId = videoId;
      const url = `https://www.googleapis.com/youtube/v3/videos?part=liveStreamingDetails&id=${videoId}&key=${this.apiKey}`;
      const res = await fetch(url);
      const data = await res.json();
      const liveDetails = data.items?.[0]?.liveStreamingDetails;
      return liveDetails?.activeLiveChatId;
    }

    let cleanHandle = handleOrUrl.trim();
    if (!cleanHandle.startsWith("@") && !cleanHandle.includes("youtube.com")) {
      cleanHandle = "@" + cleanHandle;
    }

    const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&eventType=live&type=video&q=${encodeURIComponent(cleanHandle)}&key=${this.apiKey}`;
    const searchRes = await fetch(searchUrl);
    const searchData = await searchRes.json();
    const activeVideoId = searchData.items?.[0]?.id?.videoId;

    if (activeVideoId) {
      this.currentVideoId = activeVideoId;
      const videoUrl = `https://www.googleapis.com/youtube/v3/videos?part=liveStreamingDetails&id=${activeVideoId}&key=${this.apiKey}`;
      const videoRes = await fetch(videoUrl);
      const videoData = await videoRes.json();
      return videoData.items?.[0]?.liveStreamingDetails?.activeLiveChatId;
    }

    return undefined;
  }
}

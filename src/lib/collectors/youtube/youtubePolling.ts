import { YouTubeMessageParser } from "./youtubeParser";
import { YouTubeAdapter } from "./youtubeAdapter";
import { LiveChatMessage } from "@/lib/ingestion/types";
import { QuotaManager, QuotaTelemetry } from "./quotaManager";
import { YouTubeMessageCache, MessageCacheStats } from "./youtubeMessageCache";

export interface ProductionPollingStats {
  requestsCount: number;
  messagesReceived: number;
  messagesParsed: number;
  messagesRejected: number;
  reconnectCount: number;
  quotaWarnings: number;
  errorsCount: number;
  lastPollAt: string | null;
  lastSuccessfulPollAt: string | null;
  lastHeartbeatAt: string | null;
  lastMessageAt: string | null;
  lastError: string | null;
  pollingIntervalMillis: number;
  apiLatencyMs: number;
  backoffState: "NORMAL" | "BACKOFF" | "EXPONENTIAL_RETRY";
  consecutiveEmptyPolls: number;
  currentPageToken: string | null;
  quotaTelemetry: QuotaTelemetry;
  cacheStats: MessageCacheStats;
}

export class YouTubePollingEngine {
  private sessionId: string;
  private activeLiveChatId: string;
  private apiKey: string;
  private nextPageToken?: string;

  private isPollingActive: boolean = false;
  private pollTimeoutId?: NodeJS.Timeout;

  // Adaptive Timing & Recovery State
  private currentIntervalMs: number = 5000;
  private consecutiveErrors: number = 0;
  private consecutiveEmptyPolls: number = 0;
  private isWarmUpPhase: boolean = true;
  private warmUpPollCount: number = 0;

  private quotaManager: QuotaManager;
  private messageCache: YouTubeMessageCache;

  private onMessageCallback: (msg: LiveChatMessage) => void;
  private onErrorCallback?: (err: Error) => void;
  private onStreamEndCallback?: () => void;
  private onInvalidTokenCallback?: () => void;

  private stats = {
    requestsCount: 0,
    messagesReceived: 0,
    messagesParsed: 0,
    messagesRejected: 0,
    reconnectCount: 0,
    quotaWarnings: 0,
    errorsCount: 0,
    lastPollAt: null as string | null,
    lastSuccessfulPollAt: null as string | null,
    lastHeartbeatAt: null as string | null,
    lastMessageAt: null as string | null,
    lastError: null as string | null,
    apiLatencyMs: 0,
  };

  constructor(
    sessionId: string,
    activeLiveChatId: string,
    apiKey: string,
    onMessage: (msg: LiveChatMessage) => void,
    onError?: (err: Error) => void,
    onStreamEnd?: () => void,
    initialPageToken?: string,
    onInvalidToken?: () => void
  ) {
    this.sessionId = sessionId;
    this.activeLiveChatId = activeLiveChatId;
    this.apiKey = apiKey;
    this.nextPageToken = initialPageToken;
    this.onMessageCallback = onMessage;
    this.onErrorCallback = onError;
    this.onStreamEndCallback = onStreamEnd;
    this.onInvalidTokenCallback = onInvalidToken;

    this.quotaManager = new QuotaManager("youtube", 10000);
    this.messageCache = new YouTubeMessageCache(5000);
  }

  public start(): void {
    if (this.isPollingActive) return;
    this.isPollingActive = true;
    this.consecutiveErrors = 0;
    this.consecutiveEmptyPolls = 0;
    this.isWarmUpPhase = true;
    this.warmUpPollCount = 0;
    this.pollLoop();
  }

  public stop(): void {
    this.isPollingActive = false;
    if (this.pollTimeoutId) {
      clearTimeout(this.pollTimeoutId);
      this.pollTimeoutId = undefined;
    }
  }

  public getPageToken(): string | undefined {
    return this.nextPageToken;
  }

  public setPageToken(token: string | undefined): void {
    this.nextPageToken = token;
  }

  public getStats(): ProductionPollingStats {
    const quotaTelemetry = this.quotaManager.getTelemetry();
    const cacheStats = this.messageCache.getStats();
    const backoffState =
      this.consecutiveErrors > 0
        ? "EXPONENTIAL_RETRY"
        : this.consecutiveEmptyPolls > 3
        ? "BACKOFF"
        : "NORMAL";

    return {
      ...this.stats,
      pollingIntervalMillis: this.currentIntervalMs,
      backoffState,
      consecutiveEmptyPolls: this.consecutiveEmptyPolls,
      currentPageToken: this.nextPageToken || null,
      quotaTelemetry,
      cacheStats,
    };
  }

  private async pollLoop(): Promise<void> {
    if (!this.isPollingActive) return;

    const startTime = Date.now();
    let nextDelay = this.currentIntervalMs;
    const nowIso = new Date().toISOString();
    this.stats.lastHeartbeatAt = nowIso;

    try {
      let url = `https://www.googleapis.com/youtube/v3/liveChat/messages?part=snippet,authorDetails&liveChatId=${encodeURIComponent(
        this.activeLiveChatId
      )}&key=${encodeURIComponent(this.apiKey)}`;

      if (this.nextPageToken) {
        url += `&pageToken=${encodeURIComponent(this.nextPageToken)}`;
      }

      this.stats.requestsCount++;
      this.stats.lastPollAt = nowIso;

      const res = await fetch(url);
      const latencyMs = Date.now() - startTime;
      this.stats.apiLatencyMs = latencyMs;

      this.quotaManager.recordRequest(latencyMs, this.currentIntervalMs, 1);

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        const message = errorData?.error?.message || `YouTube API HTTP ${res.status}`;
        const is429 = res.status === 429;
        const isQuotaWarning = res.status === 403 && message.toLowerCase().includes("quota");
        const isInvalidPageToken =
          res.status === 400 || message.toLowerCase().includes("invalidpagetoken");

        if (isQuotaWarning || is429) {
          this.stats.quotaWarnings++;
          this.quotaManager.recordRateLimitOrQuotaWarning(is429);
        }

        // Automatic PageToken Recovery: If pageToken is expired/invalid, clear it and retry fresh
        if (isInvalidPageToken && this.nextPageToken) {
          console.warn(`[YouTubePollingEngine] Invalid pageToken detected. Resetting token and recovering...`);
          this.nextPageToken = undefined;
          if (this.onInvalidTokenCallback) this.onInvalidTokenCallback();
        }

        throw new Error(message);
      }

      const data = await res.json();
      this.consecutiveErrors = 0;
      this.stats.lastSuccessfulPollAt = new Date().toISOString();

      if (data.nextPageToken) {
        this.nextPageToken = data.nextPageToken;
      }

      // Extract official YouTube pollingIntervalMillis
      let rawRecommendedInterval = 10000;
      if (typeof data.pollingIntervalMillis === "number" && data.pollingIntervalMillis > 0) {
        rawRecommendedInterval = data.pollingIntervalMillis;
      }

      // Adaptive Timing Clamping & Warm-Up Phase
      const items = data.items || [];
      this.stats.messagesReceived += items.length;

      if (this.isWarmUpPhase) {
        this.warmUpPollCount++;
        nextDelay = Math.min(rawRecommendedInterval, 8000);
        if (this.warmUpPollCount >= 3) {
          this.isWarmUpPhase = false;
        }
      } else if (items.length === 0) {
        this.consecutiveEmptyPolls++;
        const quietMultiplier = Math.min(1 + this.consecutiveEmptyPolls * 0.25, 3.0);
        nextDelay = Math.round(rawRecommendedInterval * quietMultiplier);
      } else {
        this.consecutiveEmptyPolls = 0;
        nextDelay = rawRecommendedInterval;
      }

      // Clamp target interval: Min 5,000 ms, Max 60,000 ms
      nextDelay = Math.max(5000, Math.min(nextDelay, 60000));
      this.currentIntervalMs = nextDelay;

      // Deduplication & Parsing Loop
      for (const item of items) {
        const parsed = YouTubeMessageParser.parse(item);
        if (!parsed) {
          this.stats.messagesRejected++;
          continue;
        }

        // Deduplication Guard: Check if message is unique
        const isUnique = this.messageCache.evaluateAndAdd(
          parsed.id,
          parsed.authorDisplayName,
          parsed.timestamp
        );

        if (!isUnique) {
          // Duplicate message detected & dropped safely
          continue;
        }

        const unifiedMsg = YouTubeAdapter.toUnifiedMessage(this.sessionId, parsed);
        if (unifiedMsg) {
          this.stats.messagesParsed++;
          this.stats.lastMessageAt = new Date().toISOString();
          this.onMessageCallback(unifiedMsg);
        } else {
          this.stats.messagesRejected++;
        }
      }

      // Check stream ended
      if (data.offlineAt || data.items === undefined) {
        console.log(`[YouTubePollingEngine] Stream ending detected for activeLiveChatId '${this.activeLiveChatId}'`);
        if (this.onStreamEndCallback) this.onStreamEndCallback();
      }
    } catch (err: any) {
      this.consecutiveErrors++;
      this.stats.errorsCount++;
      this.stats.lastError = err.message || "Polling error";

      if (this.onErrorCallback) {
        this.onErrorCallback(err);
      }

      // Exponential Backoff: 10s -> 20s -> 40s -> 60s max
      const backoffDelays = [10000, 20000, 40000, 60000];
      const backoffIndex = Math.min(this.consecutiveErrors - 1, backoffDelays.length - 1);
      nextDelay = backoffDelays[Math.max(0, backoffIndex)];
      this.currentIntervalMs = nextDelay;
      this.stats.reconnectCount++;

      console.warn(
        `[YouTubePollingEngine] Polling error attempt ${this.consecutiveErrors} (${err.message}). Retrying in ${nextDelay / 1000}s...`
      );
    }

    if (this.isPollingActive) {
      this.pollTimeoutId = setTimeout(() => {
        this.pollLoop();
      }, nextDelay);
    }
  }
}

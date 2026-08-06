import WebSocket from "ws";
import { ChatCollector, CollectorHealth, CollectorStatus, CollectorStats, LiveChatMessage } from "./types";
import { MessageNormalizer } from "@/lib/chat/normalizer";
import { INGESTION_CONFIG } from "./config";
import { getKickChatroomId } from "@/lib/kick";
import { DiagnosticsLogger } from "@/lib/diagnostics/logger";
import { DiagnosticsState } from "@/lib/diagnostics/state";
import { SessionArtifactRegistry } from "@/lib/session/artifactRegistry";


const KICK_PUSHER_APP_KEY = "32cbd69e4b950bf97679";
const KICK_PUSHER_WS_URL = `wss://ws-us2.pusher.com/app/${KICK_PUSHER_APP_KEY}?protocol=7&client=js&version=8.4.0&flash=false`;

export interface KickCollectorOptions {
  channelHandle?: string;
  chatroomId?: string;
}

export class KickChatCollector implements ChatCollector {
  public readonly sessionId: string;
  public readonly platform = "kick";

  private channelHandle?: string;
  private chatroomId?: string;
  private channelId?: number; // Numeric broadcaster ID for refresh

  private ws: WebSocket | null = null;
  private status: CollectorStatus = "disconnected";
  private health: CollectorHealth = "healthy";

  private messageHandlers: Set<(msg: LiveChatMessage) => void> = new Set();
  private processedMessageIds: Set<string> = new Set();

  private stats: CollectorStats = {
    totalMessagesReceived: 0,
    lastMessageAt: null,
    reconnectCount: 0,
    errorsCount: 0,
  };

  private pingTimer: NodeJS.Timeout | null = null;
  private pongTimeoutTimer: NodeJS.Timeout | null = null;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private lastPongReceivedAt: number = Date.now();
  private backoffDelay = 1000; // Exponential backoff starts at 1s
  private isIntentionallyClosed = false;
  private hasAttemptedRefresh = false; // Guard: only refresh once per connection lifecycle

  constructor(sessionId: string, options: KickCollectorOptions = {}) {
    this.sessionId = sessionId;
    this.channelHandle = options.channelHandle;
    this.chatroomId = options.chatroomId;
  }

  /**
   * Resolves Kick Chatroom ID.
   *
   * IMPORTANT: If channelHandle is available, ALWAYS re-verify via the API.
   * The stored chatroomId may be the broadcaster_user_id (incorrect) — for newer
   * Kick channels these can differ by millions, making heuristic subscription impossible.
   * The Python curl_cffi resolver is the only reliable source of the true chatroom.id.
   */
  private async resolveChatroomId(): Promise<string> {
    // If we have a channelHandle, ALWAYS resolve fresh via API to get true chatroom.id.
    // Stored IDs can be broadcaster_user_id (wrong); the API is the only source of truth.
    if (this.channelHandle) {
      console.log(`[KickCollector] ⏳ Resolving authoritative chatroomId via API for '${this.channelHandle}'...`);
      const kickMeta = await getKickChatroomId(this.channelHandle);
      if (kickMeta?.chatroomId) {
        const previousId = this.chatroomId;
        this.chatroomId = kickMeta.chatroomId;
        this.channelId = kickMeta.channelId;
        if (previousId && previousId !== this.chatroomId) {
          console.warn(`[KickCollector] ⚠️ Corrected chatroomId for '${this.channelHandle}': stored #${previousId} → actual #${this.chatroomId} (offset: ${Math.abs(Number(previousId) - Number(this.chatroomId))})`);
        } else {
          console.log(`[KickCollector] ✅ Resolved chatroomId for '${this.channelHandle}': #${this.chatroomId}`);
        }
        return this.chatroomId;
      }
      // API failed — fall back to stored ID if available
      if (this.chatroomId) {
        console.warn(`[KickCollector] ⚠️ API resolution failed for '${this.channelHandle}'. Falling back to stored chatroomId #${this.chatroomId}.`);
        return this.chatroomId;
      }
    }

    // No channelHandle — use stored ID directly
    if (this.chatroomId) {
      console.log(`[KickCollector] ✅ Using stored chatroomId #${this.chatroomId} (no channelHandle to verify against)`);
      return this.chatroomId;
    }

    throw new Error(
      `[KickCollector] ❌ Cannot resolve chatroomId: no channelHandle or chatroomId provided for session '${this.sessionId}'`
    );
  }

  private async refreshChatroomId(): Promise<boolean> {
    if (this.hasAttemptedRefresh || !this.channelHandle) return false;
    this.hasAttemptedRefresh = true;

    console.log(`[KickCollector] 🔄 Attempting chatroomId refresh for '${this.channelHandle}'...`);
    const kickMeta = await getKickChatroomId(this.channelHandle);
    if (kickMeta?.chatroomId && kickMeta.chatroomId !== this.chatroomId) {
      console.log(`[KickCollector] 🔄 chatroomId refreshed: ${this.chatroomId} → ${kickMeta.chatroomId}`);
      this.chatroomId = kickMeta.chatroomId;
      this.channelId = kickMeta.channelId;
      return true;
    }
    return false;
  }

  /**
   * Connect to Kick WebSocket Chatroom
   */
  public async connect(): Promise<void> {
    if (this.status === "connected" || this.status === "connecting") return;

    this.isIntentionallyClosed = false;
    this.status = "connecting";

    try {
      const room = await this.resolveChatroomId();
      console.log(`[KickCollector] ⏳ Connecting WebSocket for session '${this.sessionId}' (chatrooms.${room}.v2)...`);

      this.ws = new WebSocket(KICK_PUSHER_WS_URL);

      this.ws.on("open", () => {
        console.log(`[KickCollector] ✅ WebSocket opened. Subscribing to chatrooms.${room}.v2...`);
        this.status = "connected";
        this.health = "healthy";
        this.backoffDelay = 1000;
        this.hasAttemptedRefresh = false;

        // Precise subscription: subscribe directly to the resolved chatroom ID.
        // A tight ±5 safety net is kept to handle minor API inconsistencies.
        // NOTE: The old ±30 heuristic was insufficient — newer Kick channels have chatroom IDs
        // that differ from broadcaster_user_id by millions (e.g. 8bitheadflicker: offset 1,524,416).
        const baseId = parseInt(room, 10);
        if (!isNaN(baseId)) {
          const startId = Math.max(1, baseId - 5);
          const endId = baseId + 5;
          for (let i = startId; i <= endId; i++) {
            const subscribePayload = {
              event: "pusher:subscribe",
              data: { auth: "", channel: `chatrooms.${i}.v2` },
            };
            this.ws?.send(JSON.stringify(subscribePayload));
          }
          console.log(`[KickCollector] 📡 Subscribed to chatrooms ${startId}–${endId} (target: chatrooms.${baseId}.v2)`);
        } else {
          const subscribePayload = {
            event: "pusher:subscribe",
            data: { auth: "", channel: `chatrooms.${room}.v2` },
          };
          this.ws?.send(JSON.stringify(subscribePayload));
        }

        // Start 30s heartbeat ping
        this.startHeartbeat();
      });

      this.ws.on("message", (raw: WebSocket.Data) => {
        this.handleRawMessage(raw);
      });

      this.ws.on("error", (err: Error) => {
        console.warn(`[KickCollector] ⚠️ WebSocket error for session '${this.sessionId}':`, err.message);
        this.stats.errorsCount += 1;
        this.health = "degraded";
      });

      this.ws.on("close", (code: number, reason: string) => {
        console.log(`[KickCollector] WS Closed for '${this.sessionId}' (code: ${code}, reason: ${reason || "none"})`);
        DiagnosticsLogger.log("Collector", "Close", `WS Closed for '${this.sessionId}' (code: ${code})`);
        DiagnosticsState.updateSubsystem("collector", { connected: false, subscriptionConfirmed: false });
        this.stopHeartbeat();

        if (!this.isIntentionallyClosed) {
          this.status = "reconnecting";
          this.health = "degraded";
          DiagnosticsState.updateSubsystem("collector", { status: "warning" });
          this.scheduleReconnect();
        } else {
          this.status = "stopped";
        }
      });
    } catch (err: any) {
      console.error(`[KickCollector] ❌ Connection error for '${this.sessionId}':`, err.message);
      DiagnosticsLogger.error("Collector", "Connect", `Connection error for '${this.sessionId}'`, err.message);
      DiagnosticsState.updateSubsystem("collector", { status: "failed", lastFailure: new Date().toISOString(), lastError: err.message, connected: false });
      this.status = "error";
      this.health = "unhealthy";
      this.scheduleReconnect();
    }
  }

  public async disconnect(): Promise<void> {
    this.isIntentionallyClosed = true;
    this.stopHeartbeat();
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    if (this.ws) {
      try {
        this.ws.close();
      } catch (e) {}
      this.ws = null;
    }

    this.status = "disconnected";
    console.log(`[KickCollector] 🛑 Disconnected session '${this.sessionId}'`);
  }

  public async reconnect(): Promise<void> {
    await this.disconnect();
    this.isIntentionallyClosed = false;
    this.stats.reconnectCount += 1;
    await this.connect();
  }

  public onMessage(handler: (msg: LiveChatMessage) => void): () => void {
    this.messageHandlers.add(handler);
    return () => this.messageHandlers.delete(handler);
  }

  public getStatus(): CollectorStatus {
    return this.status;
  }

  public getHealth(): CollectorHealth {
    return this.health;
  }

  public getStats(): CollectorStats {
    return { ...this.stats };
  }

  private startHeartbeat() {
    this.stopHeartbeat();
    this.lastPongReceivedAt = Date.now();

    // 15-second heartbeat ping interval to maintain active Pusher WS connection
    this.pingTimer = setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        try {
          this.ws.send(JSON.stringify({ event: "pusher:ping", data: {} }));
        } catch (err: any) {
          console.warn(`[KickCollector] ⚠️ Failed to send ping:`, err.message);
        }

        // 10-second pong response check guard
        if (this.pongTimeoutTimer) clearTimeout(this.pongTimeoutTimer);
        this.pongTimeoutTimer = setTimeout(() => {
          const timeSinceLastPong = Date.now() - this.lastPongReceivedAt;
          if (timeSinceLastPong > 25000 && this.ws && this.status === "connected") {
            console.warn(`[KickCollector] ⚠️ Heartbeat pong timeout (${Math.round(timeSinceLastPong / 1000)}s since last pong). Force reconnecting WS...`);
            this.ws.terminate(); // Force close socket to trigger reconnect loop
          }
        }, 10000);
      }
    }, 15000);
  }

  private stopHeartbeat() {
    if (this.pingTimer) {
      clearInterval(this.pingTimer);
      this.pingTimer = null;
    }
    if (this.pongTimeoutTimer) {
      clearTimeout(this.pongTimeoutTimer);
      this.pongTimeoutTimer = null;
    }
  }

  private scheduleReconnect() {
    if (this.reconnectTimer || this.isIntentionallyClosed) return;

    this.stats.reconnectCount += 1;
    DiagnosticsState.updateSubsystem("collector", { reconnectCount: this.stats.reconnectCount });
    console.log(`[KickCollector] ⏳ Scheduling reconnect for '${this.sessionId}' in ${this.backoffDelay}ms... (attempt #${this.stats.reconnectCount})`);

    this.reconnectTimer = setTimeout(async () => {
      this.reconnectTimer = null;
      this.backoffDelay = Math.min(this.backoffDelay * 2, 30000);

      if (this.status === "error" && this.channelHandle) {
        const refreshed = await this.refreshChatroomId();
        if (refreshed) {
          console.log(`[KickCollector] 🔄 Reconnecting with refreshed chatroomId #${this.chatroomId}`);
        }
      }

      await this.connect();
    }, this.backoffDelay);
  }

  private handleRawMessage(raw: WebSocket.Data) {
    try {
      const rawString = raw.toString();
      const parsed = JSON.parse(rawString);
      const eventName = parsed.event || "";
      const channel = parsed.channel || "global";
      const payloadPreview = rawString.slice(0, 500);

      if (eventName === "pusher:ping") {
        this.ws?.send(JSON.stringify({ event: "pusher:pong", data: {} }));
        return;
      }

      if (eventName === "pusher:pong" || eventName === "pusher_internal:subscription_succeeded") {
        this.lastPongReceivedAt = Date.now();
        if (eventName === "pusher_internal:subscription_succeeded") {
          DiagnosticsLogger.log("Collector", "Subscription", `Subscription confirmed for ${channel}`);
          DiagnosticsState.updateSubsystem("collector", { subscriptionConfirmed: true, status: "healthy", lastSuccess: new Date().toISOString() });
        }
        return;
      }

      DiagnosticsState.incrementCounter("collector", "rawEvents");
      
      const isChatMessage = eventName.includes("ChatMessageEvent") || 
                            eventName.includes("ChatMessage") || 
                            eventName.toLowerCase().includes("chat.message") ||
                            eventName.toLowerCase().includes("message.new");

      if (isChatMessage) {
        let eventData = parsed.data;
        if (typeof eventData === "string") {
          try {
            eventData = JSON.parse(eventData);
          } catch (e) {}
        }

        if (eventData && typeof eventData === "object") {
          const normalized = this.normalizeMessage(eventData);
          if (normalized) {
            if (this.processedMessageIds.has(normalized.id)) {
              DiagnosticsState.incrementCounter("collector", "duplicateMessages");
              return;
            }

            this.processedMessageIds.add(normalized.id);
            while (this.processedMessageIds.size > INGESTION_CONFIG.MAX_DUPLICATE_CACHE) {
              const oldestId = this.processedMessageIds.values().next().value;
              if (oldestId) this.processedMessageIds.delete(oldestId);
              else break;
            }

            this.stats.totalMessagesReceived += 1;
            this.stats.lastMessageAt = normalized.timestamp;
            DiagnosticsState.incrementCounter("collector", "parsedEvents");
            DiagnosticsState.updateSubsystem("collector", { lastChatTimestamp: normalized.timestamp.toISOString(), lastParsedChat: normalized.timestamp.toISOString(), lastSuccess: new Date().toISOString() });
            
            DiagnosticsState.addRawEvent({
              eventName,
              channel,
              payloadSize: rawString.length,
              timestamp: new Date().toISOString(),
              ignored: false,
              parsed: true,
              reasonIgnored: null,
              payloadPreview
            });

            console.log(`[KickCollector] 📨 Message #${this.stats.totalMessagesReceived} from '${normalized.author.username}': "${normalized.message.slice(0, 60)}${normalized.message.length > 60 ? "..." : ""}"`);

            for (const handler of this.messageHandlers) {
              try {
                handler(normalized);
              } catch (hErr) {
                console.error("[KickCollector] Handler error:", hErr);
              }
            }

            SessionArtifactRegistry.saveChatMessage(this.sessionId, normalized).catch((pErr) => {
              console.warn(`[KickCollector] Artifact Registry save warning for session '${this.sessionId}': ${pErr.message}`);
            });

          } else {
             DiagnosticsState.incrementCounter("collector", "unknownEvents");
          }
        }
      } else {
         DiagnosticsState.incrementCounter("collector", "unknownEvents");
      }
    } catch (err: any) {
      DiagnosticsState.incrementCounter("collector", "parseFailures");
      this.stats.errorsCount += 1;
    }
  }

  private normalizeMessage(data: any): LiveChatMessage | null {
    const messageText = data.content || data.message || "";
    if (!messageText.trim()) return null;

    const sender = data.sender || data.user || {};
    const username = sender.username || sender.slug || data.username || "KickViewer";
    const displayName = sender.username || sender.display_name || username;

    const badges: string[] = [];
    if (Array.isArray(sender.identity?.badges)) {
      for (const b of sender.identity.badges) {
        if (b.type) badges.push(b.type);
      }
    }

    const msgId = String(
      data.id ||
      data.message_id ||
      `kick_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`
    );

    const canonical = MessageNormalizer.normalize(
      {
        id: msgId,
        platform: "kick",
        timestamp: data.created_at || new Date().toISOString(),
        author: {
          id: sender.id ? String(sender.id) : undefined,
          username,
          displayName,
          badges,
        },
        message: messageText,
        raw: INGESTION_CONFIG.DEBUG_MODE ? data : undefined,
      },
      this.sessionId
    );

    return {
      ...canonical,
      message: canonical.displayText,
      timestamp: new Date(canonical.timestamp),
      emotes: canonical.emotes.map((e) => e.name),
    };
  }
}

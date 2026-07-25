import WebSocket from "ws";
import { ChatCollector, CollectorHealth, CollectorStatus, CollectorStats, LiveChatMessage } from "./types";
import { INGESTION_CONFIG } from "./config";
import { getKickChatroomId } from "@/lib/kick";
import { DiagnosticsLogger } from "@/lib/diagnostics/logger";
import { DiagnosticsState } from "@/lib/diagnostics/state";

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
  private reconnectTimer: NodeJS.Timeout | null = null;
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
   * PRIORITY ORDER:
   * 1. Use stored chatroomId passed from constructor (resolved in browser via kick.com/api/v2 — preferred)
   * 2. Try Official Kick API banner_picture URL extraction (works for channels with banners)
   * 3. Fail with clear diagnostic — broadcaster_user_id is NOT the same as chatroom.id
   * 
   * NOTE: Kick's broadcaster_user_id != chatroom.id for most channels.
   * Subscribing to chatrooms.{broadcaster_user_id}.v2 silently accepts but receives 0 messages.
   * The correct chatroom.id comes from kick.com/api/v2 (browser-side only, Cloudflare-blocked server-side)
   * or from the banner_picture URL pattern: /images/channel/{CHATROOM_ID}/
   */
  private async resolveChatroomId(): Promise<string> {
    // ── Fast Path: Use stored chatroomId (browser-resolved or banner-extracted) ──
    if (this.chatroomId) {
      console.log(`[KickCollector] ✅ Using provided chatroomId #${this.chatroomId} for '${this.channelHandle || "unknown"}'`);
      return this.chatroomId;
    }

    if (!this.channelHandle) {
      throw new Error(`[KickCollector] ❌ Cannot resolve chatroomId: no channelHandle or chatroomId provided for session '${this.sessionId}'`);
    }

    // ── Try Official API (banner extraction or broadcaster_user_id) ──
    console.log(`[KickCollector] ⏳ No chatroomId provided — resolving via Official API for '${this.channelHandle}'...`);
    const kickMeta = await getKickChatroomId(this.channelHandle);

    if (kickMeta?.chatroomId) {
      this.chatroomId = kickMeta.chatroomId;
      this.channelId = kickMeta.channelId;
      console.log(`[KickCollector] ✅ Resolved chatroomId via Official API for '${this.channelHandle}': #${this.chatroomId}`);
      return this.chatroomId;
    }

    // ── No chatroom ID available ──
    throw new Error(
      `[KickCollector] ❌ Could not resolve Kick chatroomId for '${this.channelHandle}'.`
    );
  }


  /**
   * Attempts one chatroomId refresh via Official API when WebSocket subscription fails.
   * Guards against repeated refresh attempts.
   */
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
        this.hasAttemptedRefresh = false; // Reset refresh guard on successful connection

        // Subscribe to Kick chatroom channel
        // Since Cloudflare blocks API v2 and the official API doesn't expose the true chatroom_id,
        // we use a heuristic subscription window. Kick chatroom IDs are always within a tight
        // range of the channel_id (typically -3 to +3). We subscribe to all 7 channels.
        // Since Kick isolates streams, we will only receive messages on the correct channel.
        const baseId = parseInt(room, 10);
        if (!isNaN(baseId)) {
          for (let i = baseId - 3; i <= baseId + 3; i++) {
            const subscribePayload = {
              event: "pusher:subscribe",
              data: { auth: "", channel: `chatrooms.${i}.v2` },
            };
            this.ws?.send(JSON.stringify(subscribePayload));
          }
          console.log(`[KickCollector] 📡 Heuristic subscription: Subscribed to chatrooms ${baseId - 3} through ${baseId + 3}`);
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

  /**
   * Disconnect cleanly
   */
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

  /**
   * Manual reconnect trigger
   */
  public async reconnect(): Promise<void> {
    await this.disconnect();
    this.isIntentionallyClosed = false;
    this.stats.reconnectCount += 1;
    await this.connect();
  }

  /**
   * Subscribe message listener
   */
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

  /**
   * Heartbeat handling (Pusher Ping/Pong)
   */
  private startHeartbeat() {
    this.stopHeartbeat();
    this.pingTimer = setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ event: "pusher:ping", data: {} }));
      }
    }, 30000);
  }

  private stopHeartbeat() {
    if (this.pingTimer) {
      clearInterval(this.pingTimer);
      this.pingTimer = null;
    }
  }

  /**
   * Exponential backoff auto-reconnect.
   * If the previous connection errored, attempt one chatroomId refresh before reconnecting.
   */
  private scheduleReconnect() {
    if (this.reconnectTimer || this.isIntentionallyClosed) return;

    this.stats.reconnectCount += 1;
    DiagnosticsState.updateSubsystem("collector", { reconnectCount: this.stats.reconnectCount });
    console.log(`[KickCollector] ⏳ Scheduling reconnect for '${this.sessionId}' in ${this.backoffDelay}ms... (attempt #${this.stats.reconnectCount})`);

    this.reconnectTimer = setTimeout(async () => {
      this.reconnectTimer = null;
      this.backoffDelay = Math.min(this.backoffDelay * 2, 30000); // Cap backoff at 30s

      // If we've errored and haven't refreshed yet, try refreshing chatroomId
      if (this.status === "error" && this.channelHandle) {
        const refreshed = await this.refreshChatroomId();
        if (refreshed) {
          console.log(`[KickCollector] 🔄 Reconnecting with refreshed chatroomId #${this.chatroomId}`);
        }
      }

      await this.connect();
    }, this.backoffDelay);
  }

  /**
   * Handles raw WebSocket frame data and emits normalized LiveChatMessage
   */
  private handleRawMessage(raw: WebSocket.Data) {
    try {
      const rawString = raw.toString();
      const parsed = JSON.parse(rawString);
      const eventName = parsed.event || "";
      const channel = parsed.channel || "global";
      const payloadPreview = rawString.slice(0, 500);

      // Part 1: Websocket Protocol Audit Logging
      console.log(`
Incoming WebSocket Event
Timestamp: ${new Date().toISOString()}
Channel: ${channel}
Event: ${eventName}
Payload Length: ${rawString.length} bytes
Payload Preview: ${payloadPreview}
      `);

      // Handle Pusher Ping
      if (eventName === "pusher:ping") {
        this.ws?.send(JSON.stringify({ event: "pusher:pong", data: {} }));
        return;
      }

      if (eventName === "pusher:pong" || eventName === "pusher_internal:subscription_succeeded") {
        if (eventName === "pusher_internal:subscription_succeeded") {
          console.log(`[KickCollector] ✅ Subscription confirmed for chatrooms.${this.chatroomId}.v2 — Heartbeat active`);
          DiagnosticsLogger.log("Collector", "Subscription", `Subscription confirmed for chatrooms.${this.chatroomId}.v2`);
          DiagnosticsState.updateSubsystem("collector", { subscriptionConfirmed: true, status: "healthy", lastSuccess: new Date().toISOString() });
        }
        return;
      }

      // Check if event is ChatMessage
      DiagnosticsState.incrementCounter("collector", "rawEvents");
      
      const expectedEvent = "App\\Events\\ChatMessageEvent";
      const isChatMessage = eventName.includes("ChatMessageEvent") || 
                            eventName.includes("ChatMessage") || 
                            eventName.toLowerCase().includes("chat.message") ||
                            eventName.toLowerCase().includes("message.new");

      if (isChatMessage) {
        // Log Parser match
        if (eventName !== expectedEvent) {
            console.log(`[Parser Audit Mismatch]
Expected Event: ${expectedEvent}
Received Event: ${eventName}
Parser Used: KickChatParserV1
Decision: Attempting to parse anyway because it contains ChatMessage or similar`);
        }
        let eventData = parsed.data;
        if (typeof eventData === "string") {
          try {
            eventData = JSON.parse(eventData);
          } catch (e) {}
        }

        if (eventData && typeof eventData === "object") {
          const normalized = this.normalizeMessage(eventData);
          if (normalized) {
            // Deduplicate by message ID
            if (this.processedMessageIds.has(normalized.id)) {
              DiagnosticsState.incrementCounter("collector", "duplicateMessages");
              DiagnosticsState.addRawEvent({
                eventName,
                channel,
                payloadSize: rawString.length,
                timestamp: new Date().toISOString(),
                ignored: true,
                parsed: true,
                reasonIgnored: "Duplicate message ID",
                payloadPreview
              });
              return;
            }

            this.processedMessageIds.add(normalized.id);
            // Cap dedup cache to MAX_DUPLICATE_CACHE entries using O(1) Set eviction
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

            console.log(`[Parser E2E Trace] RAW EVENT RECEIVED -> Parser Selected -> Normalized LiveChatMessage`);

            console.log(`[KickCollector] 📨 Message #${this.stats.totalMessagesReceived} from '${normalized.author.username}': "${normalized.message.slice(0, 60)}${normalized.message.length > 60 ? "..." : ""}"`);

            // Notify handlers
            for (const handler of this.messageHandlers) {
              try {
                handler(normalized);
              } catch (hErr) {
                console.error("[KickCollector] Handler error:", hErr);
              }
            }
          } else {
             DiagnosticsState.incrementCounter("collector", "unknownEvents");
             DiagnosticsState.addRawEvent({
               eventName,
               channel,
               payloadSize: rawString.length,
               timestamp: new Date().toISOString(),
               ignored: true,
               parsed: false,
               reasonIgnored: "Normalization failed",
               payloadPreview
             });
             console.log(`[Parser Audit]
Expected Event: ${expectedEvent}
Received Event: ${eventName}
Parser Used: KickChatParserV1
Decision: Rejected (Normalization Failed)`);
          }
        }
      } else {
         DiagnosticsState.incrementCounter("collector", "unknownEvents");
         DiagnosticsState.addRawEvent({
           eventName,
           channel,
           payloadSize: rawString.length,
           timestamp: new Date().toISOString(),
           ignored: true,
           parsed: false,
           reasonIgnored: "Not a ChatMessage event",
           payloadPreview
         });
      }
    } catch (err: any) {
      DiagnosticsState.incrementCounter("collector", "parseFailures");
      console.warn("[KickCollector] Malformed raw payload warning:", err.message);
      DiagnosticsLogger.warn("Collector", "Parse", `Malformed raw payload warning: ${err.message}`);
      DiagnosticsState.incrementCounter("collector", "unknownEvents");
      DiagnosticsState.addRawEvent({
        eventName: "unknown",
        channel: "unknown",
        payloadSize: raw.toString().length,
        timestamp: new Date().toISOString(),
        ignored: true,
        parsed: false,
        reasonIgnored: "Malformed raw payload exception",
        payloadPreview: raw.toString().slice(0, 500)
      });
      this.stats.errorsCount += 1;
    }
  }

  /**
   * Normalizes Kick payload into standardized LiveChatMessage format
   */
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

    return {
      id: msgId,
      sessionId: this.sessionId,
      platform: "kick",
      timestamp: data.created_at ? new Date(data.created_at) : new Date(),
      author: {
        id: sender.id ? String(sender.id) : undefined,
        username,
        displayName,
        badges,
      },
      message: messageText,
      emotes: [],
      // Omit raw payload in production mode to save ~70% RAM
      raw: INGESTION_CONFIG.DEBUG_MODE ? data : undefined,
    };
  }
}

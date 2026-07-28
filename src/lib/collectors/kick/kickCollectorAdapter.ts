import { BaseCollector } from "../base/collector";
import { HealthState, CollectorDiagnostics, CollectorOptions } from "../base/types";
import { KickChatCollector } from "@/lib/ingestion/kickCollector";
import { LiveChatMessage } from "@/lib/ingestion/types";

export class KickCollectorAdapter extends BaseCollector {
  public readonly sessionId: string;
  public readonly platform = "kick";

  private innerCollector: KickChatCollector;
  private isRunning: boolean = false;

  constructor(sessionId: string, options: CollectorOptions = {}) {
    super();
    this.sessionId = sessionId;
    this.innerCollector = new KickChatCollector(sessionId, {
      channelHandle: options.channelHandle,
      chatroomId: options.chatroomId,
    });

    this.innerCollector.onMessage((msg: LiveChatMessage) => {
      this.emitMessage(msg);
    });
  }

  public async start(): Promise<void> {
    this.isRunning = true;
    this.isPaused = false;
    await this.innerCollector.connect();
  }

  public async stop(): Promise<void> {
    this.isRunning = false;
    await this.innerCollector.disconnect();
  }

  public async pause(): Promise<void> {
    this.isPaused = true;
  }

  public async resume(): Promise<void> {
    this.isPaused = false;
  }

  public health(): HealthState {
    if (!this.isRunning) return "STOPPED";
    const status = this.innerCollector.getStatus();
    const h = this.innerCollector.getHealth();
    if (status === "connecting") return "CONNECTING";
    if (status === "connected" && h === "healthy") return "ACTIVE";
    if (status === "reconnecting" || h === "degraded") return "DEGRADED";
    if (status === "error") return "FAILED";
    return "WARNING";
  }

  public stats(): CollectorDiagnostics {
    const innerStats = this.innerCollector.getStats();
    const status = this.innerCollector.getStatus();

    return {
      platform: "kick",
      sessionId: this.sessionId,
      health: this.health(),
      requestsCount: innerStats.totalMessagesReceived,
      messagesReceived: innerStats.totalMessagesReceived,
      messagesParsed: innerStats.totalMessagesReceived,
      messagesRejected: 0,
      reconnectCount: innerStats.reconnectCount,
      quotaWarnings: 0,
      errorsCount: innerStats.errorsCount,
      lastPollAt: new Date().toISOString(),
      lastMessageAt: innerStats.lastMessageAt ? new Date(innerStats.lastMessageAt).toISOString() : null,
      lastError: status === "error" ? "Kick websocket error" : null,
    };
  }
}

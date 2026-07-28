import { SupportedPlatform } from "@/types";
import { LiveChatMessage, ChatCollector, CollectorStatus, CollectorHealth, CollectorStats } from "@/lib/ingestion/types";
import { HealthState, CollectorDiagnostics, MessageHandler } from "./types";

export abstract class BaseCollector implements ChatCollector {
  public abstract readonly sessionId: string;
  public abstract readonly platform: SupportedPlatform;

  protected messageListeners: Set<MessageHandler> = new Set();
  protected isPaused: boolean = false;

  abstract start(): Promise<void>;
  abstract stop(): Promise<void>;
  abstract pause(): Promise<void>;
  abstract resume(): Promise<void>;
  abstract health(): HealthState;
  abstract stats(): CollectorDiagnostics;

  // Compatibility methods with ChatCollector interface
  public async connect(): Promise<void> {
    await this.start();
  }

  public async disconnect(): Promise<void> {
    await this.stop();
  }

  public async reconnect(): Promise<void> {
    await this.stop();
    await this.start();
  }

  public onMessage(handler: MessageHandler): () => void {
    this.messageListeners.add(handler);
    return () => {
      this.messageListeners.delete(handler);
    };
  }

  protected emitMessage(message: LiveChatMessage): void {
    if (this.isPaused) return;
    for (const listener of this.messageListeners) {
      try {
        listener(message);
      } catch (err) {
        console.error(`[Collector:${this.platform}] Listener error:`, err);
      }
    }
  }

  public getStatus(): CollectorStatus {
    const h = this.health();
    switch (h) {
      case "CONNECTING":
        return "connecting";
      case "ACTIVE":
        return "connected";
      case "WARNING":
      case "DEGRADED":
        return "reconnecting";
      case "FAILED":
        return "error";
      case "STOPPED":
      default:
        return "stopped";
    }
  }

  public getHealth(): CollectorHealth {
    const h = this.health();
    switch (h) {
      case "ACTIVE":
      case "CONNECTING":
        return "healthy";
      case "WARNING":
      case "DEGRADED":
        return "degraded";
      case "FAILED":
      case "STOPPED":
      default:
        return "unhealthy";
    }
  }

  public getStats(): CollectorStats {
    const diag = this.stats();
    return {
      totalMessagesReceived: diag.messagesReceived,
      lastMessageAt: diag.lastMessageAt,
      reconnectCount: diag.reconnectCount,
      errorsCount: diag.errorsCount,
    };
  }
}

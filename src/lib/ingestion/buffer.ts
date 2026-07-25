import { LiveChatMessage } from "./types";
import { INGESTION_CONFIG } from "./config";
import { DiagnosticsState } from "@/lib/diagnostics/state";

export interface BufferOptions {
  maxCapacity?: number;
  maxAgeMs?: number;
}

export class RollingSessionBuffer {
  private messages: LiveChatMessage[] = [];
  private readonly maxCapacity: number;
  private readonly maxAgeMs: number;
  private readonly sessionId: string;

  constructor(sessionId: string, options: BufferOptions = {}) {
    this.sessionId = sessionId;
    this.maxCapacity = options.maxCapacity || INGESTION_CONFIG.MAX_MESSAGES;
    this.maxAgeMs = options.maxAgeMs || INGESTION_CONFIG.WINDOW_DURATION_MS;
  }

  /**
   * Adds a new normalized message to the rolling session buffer
   */
  public add(message: LiveChatMessage): void {
    // 1. Time-Based Primary Retention Prune (O(K) zero-allocation index shift)
    this.pruneExpired();

    // 2. Safety Capacity Ceiling Check (FIFO shift)
    while (this.messages.length >= this.maxCapacity) {
      this.messages.shift();
    }

    this.messages.push(message);
    
    // Diagnostic State Update
    DiagnosticsState.updateSubsystem("buffer", { 
      messages: this.messages.length, 
      representativeCandidates: this.messages.length,
      status: "healthy",
      lastSuccess: new Date().toISOString()
    });
  }

  /**
   * Prunes messages older than maxAgeMs (e.g. 10 minutes)
   * Optimization: Because messages are pushed in chronological order,
   * we use a zero-allocation index shift instead of array filter.
   */
  public pruneExpired(): void {
    if (this.messages.length === 0) return;

    const cutoff = Date.now() - this.maxAgeMs;

    while (this.messages.length > 0) {
      const firstMsg = this.messages[0];
      const msgTime =
        firstMsg.timestamp instanceof Date
          ? firstMsg.timestamp.getTime()
          : new Date(firstMsg.timestamp).getTime();

      if (msgTime < cutoff) {
        this.messages.shift();
      } else {
        // Chronologically sorted: first non-expired message guarantees all subsequent messages are valid
        break;
      }
    }
  }

  /**
   * Returns a copy of current messages in buffer
   */
  public getMessages(): LiveChatMessage[] {
    this.pruneExpired();
    return [...this.messages];
  }

  /**
   * Returns total message count in buffer
   */
  public size(): number {
    this.pruneExpired();
    return this.messages.length;
  }

  /**
   * Resets and clears the buffer
   */
  public clear(): void {
    this.messages = [];
  }

  /**
   * Returns buffer telemetry metadata
   */
  public getMetadata() {
    this.pruneExpired();
    return {
      sessionId: this.sessionId,
      count: this.messages.length,
      maxCapacity: this.maxCapacity,
      maxAgeMs: this.maxAgeMs,
      oldestTimestamp: this.messages[0]?.timestamp || null,
      newestTimestamp: this.messages[this.messages.length - 1]?.timestamp || null,
    };
  }
}

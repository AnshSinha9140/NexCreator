import { SupportedPlatform } from "@/types";

export interface LiveChatMessage {
  id: string;
  sessionId: string;
  platform: SupportedPlatform;
  timestamp: Date;
  author: {
    id?: string;
    username: string;
    displayName: string;
    badges: string[];
  };
  message: string;
  emotes: string[];
  raw?: unknown;
}

export type CollectorStatus =
  | "disconnected"
  | "connecting"
  | "connected"
  | "reconnecting"
  | "error"
  | "stopped";

export type CollectorHealth = "healthy" | "degraded" | "unhealthy";

export interface CollectorStats {
  totalMessagesReceived: number;
  lastMessageAt: Date | string | null;
  reconnectCount: number;
  errorsCount: number;
}

export interface ChatCollector {
  sessionId: string;
  platform: SupportedPlatform;
  
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  reconnect(): Promise<void>;
  
  onMessage(handler: (msg: LiveChatMessage) => void): () => void;
  
  getStatus(): CollectorStatus;
  getHealth(): CollectorHealth;
  getStats(): CollectorStats;
}

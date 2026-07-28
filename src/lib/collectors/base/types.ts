import { SupportedPlatform } from "@/types";
import { LiveChatMessage } from "@/lib/ingestion/types";

export type HealthState =
  | "CONNECTING"
  | "ACTIVE"
  | "WARNING"
  | "DEGRADED"
  | "STOPPED"
  | "FAILED";

export type LegacyCollectorStatus =
  | "disconnected"
  | "connecting"
  | "connected"
  | "reconnecting"
  | "error"
  | "stopped";

export interface CollectorDiagnostics {
  platform: SupportedPlatform;
  sessionId: string;
  health: HealthState;
  pollingIntervalMillis?: number;
  apiLatencyMs?: number;
  requestsCount: number;
  messagesReceived: number;
  messagesParsed: number;
  messagesRejected: number;
  reconnectCount: number;
  quotaWarnings: number;
  errorsCount: number;
  lastPollAt: string | null;
  lastMessageAt: string | null;
  lastError: string | null;

  // Extended Quota & Telemetry
  quotaUsagePct?: number;
  estimatedRemainingRequests?: number;
  estimatedRemainingMinutes?: number;
  requestsPerMinute?: number;
  averagePollIntervalMs?: number;
  backoffState?: string;
  retryCount?: number;

  // Production Hardening & Diagnostics
  collectorState?: string;
  currentPageToken?: string | null;
  chatId?: string | null;
  videoId?: string | null;
  uniqueMessages?: number;
  duplicatesRemoved?: number;
  duplicatePct?: number;
  healthScore?: number;
  healthCategory?: string;
  lastSuccessfulPollAt?: string | null;
  lastHeartbeatAt?: string | null;
  lastRecoveryAt?: string | null;
}

export type MessageHandler = (message: LiveChatMessage) => void;

export interface CollectorOptions {
  channelHandle?: string;
  chatroomId?: string;
  activeLiveChatId?: string;
  pollingIntervalMillis?: number;
  [key: string]: any;
}

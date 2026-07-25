import { SupportedPlatform } from "@/types";

export type AIInsightType =
  | "retention_alert"
  | "engagement_opportunity"
  | "content_recommendation"
  | "pacing_advice"
  | "stream_summary";

export type AIInsightSeverity = "info" | "warning" | "critical";

export interface AIInsight {
  id: string;
  creatorId: string;
  sessionId: string;
  snapshotId: string;
  platform: SupportedPlatform;
  timestamp: string;
  type: AIInsightType;
  severity: AIInsightSeverity;
  title: string;
  summary: string;
  recommendation: string;
  confidence: number;
  topics: string[];
  sourceModel: string;
  modelVersion: string;
  promptVersion: string;
  snapshotVersion: number;
  createdAt: string;

  // Provider tracking metadata for Multi-Provider AI Layer
  provider?: string;      // e.g. "gemini" | "groq" | "rule_engine"
  model?: string;         // e.g. "gemini-2.0-flash" | "llama-3.3-70b-versatile" | "rule-based-v1"
  fallbackUsed?: boolean; // true if failover triggered
}

export interface PromptPayload {
  systemPrompt: string;
  userPrompt: string;
  snapshotId: string;
  sessionId: string;
  creatorId: string;
}

export interface RawLLMResponse {
  content: string;
  tokensUsed: number;
  provider: string;
  latencyMs: number;
}

export interface DecisionResult {
  analyze: boolean;
  reason: string;
  priority: "low" | "medium" | "high";
  confidence: number;
}

export interface AITelemetry {
  ai_requested: number;
  ai_skipped: number;
  cache_hit: number;
  provider_latency: number;
  quota_failures: number;

  // Multi-Provider Telemetry Metrics
  gemini_requests: number;
  groq_requests: number;
  provider_failures: number;
  provider_switches: number;
  fallback_count: number;
  rule_engine_activations: number;
}

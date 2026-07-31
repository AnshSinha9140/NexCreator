import clientPromise from "@/lib/mongodb";

export interface AITelemetryLogDoc {
  _id?: any;
  timestamp: string;
  creatorId: string | null;
  sessionId: string | null;
  monitoringSessionId: string | null;
  provider: "gemini" | "groq" | "rule_engine" | string;
  model: string;
  feature: string;
  requestType: string;
  status: "success" | "failed" | "timeout" | "rate_limited" | "quota_exceeded";
  latencyMs: number;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  estimatedCost: number;
  cacheHit: boolean;
  fallbackUsed: boolean;
  retryCount: number;
  promptCharacters: number;
  responseCharacters: number;
  errorMessage: string | null;
  buildVersion: string;
}

const COST_PER_1K: Record<string, number> = {
  gemini: 0.00015,
  groq: 0.0001,
  rule_engine: 0.0,
};

export class AITelemetryLogger {
  public static async logRequest(telemetry: Partial<AITelemetryLogDoc>): Promise<void> {
    try {
      const client = await clientPromise;
      const db = client.db(process.env.MONGODB_DB_NAME || "nexcreator");

      const provider = (telemetry.provider || "rule_engine").toLowerCase();
      const provKey = provider.includes("gemini")
        ? "gemini"
        : provider.includes("groq")
        ? "groq"
        : "rule_engine";

      const totalTokens = telemetry.totalTokens ?? ((telemetry.inputTokens || 0) + (telemetry.outputTokens || 0) || 400);
      const rate = COST_PER_1K[provKey] ?? 0.00015;
      const estimatedCost = telemetry.estimatedCost ?? Number(((totalTokens / 1000) * rate).toFixed(6));

      const doc: AITelemetryLogDoc = {
        timestamp: telemetry.timestamp || new Date().toISOString(),
        creatorId: telemetry.creatorId || null,
        sessionId: telemetry.sessionId || null,
        monitoringSessionId: telemetry.monitoringSessionId || telemetry.sessionId || null,
        provider: telemetry.provider || "rule_engine",
        model: telemetry.model || "rule-based-v1",
        feature: telemetry.feature || "Creator Intelligence",
        requestType: telemetry.requestType || "stream_insight",
        status: telemetry.status || "success",
        latencyMs: telemetry.latencyMs || 0,
        inputTokens: telemetry.inputTokens || Math.round(totalTokens * 0.7),
        outputTokens: telemetry.outputTokens || Math.round(totalTokens * 0.3),
        totalTokens,
        estimatedCost,
        cacheHit: !!telemetry.cacheHit,
        fallbackUsed: !!telemetry.fallbackUsed,
        retryCount: telemetry.retryCount || 0,
        promptCharacters: telemetry.promptCharacters || 0,
        responseCharacters: telemetry.responseCharacters || 0,
        errorMessage: telemetry.errorMessage || null,
        buildVersion: telemetry.buildVersion || "1.1.0",
      };

      await db.collection("ai_request_logs").insertOne(doc);
    } catch (e) {
      console.error("[AITelemetryLogger] Failed to log AI request:", e);
    }
  }
}

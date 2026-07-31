import clientPromise from "@/lib/mongodb";
import { AIRequestLogItem } from "@/types/aiOperations";
import { v4 as uuidv4 } from "uuid";

const COST_RATES_PER_1K: Record<string, number> = {
  gemini: 0.00015,
  groq: 0.0001,
  rule_engine: 0.0,
};

export class AIRequestLogger {
  public static async logRequest(params: {
    provider: string;
    model: string;
    requestType?: string;
    tokensIn?: number;
    tokensOut?: number;
    totalTokens?: number;
    latencyMs?: number;
    cacheHit?: boolean;
    fallbackUsed?: boolean;
    fallbackProvider?: string | null;
    status?: "success" | "error" | "timeout" | "rate_limited" | "quota_exceeded";
    errorType?: string | null;
    sessionId?: string | null;
    creatorId?: string | null;
    source?: string | null;
  }): Promise<void> {
    try {
      const client = await clientPromise;
      const db = client.db(process.env.MONGODB_DB_NAME || "nexcreator");

      const providerKey = (params.provider || "rule_engine").toLowerCase();
      const rateKey = providerKey.includes("gemini")
        ? "gemini"
        : providerKey.includes("groq")
        ? "groq"
        : "rule_engine";

      const tokens = params.totalTokens ?? ((params.tokensIn || 0) + (params.tokensOut || 0) || 400);
      const rate = COST_RATES_PER_1K[rateKey] ?? 0.00015;
      const estimatedCostUsd = Number(((tokens / 1000) * rate).toFixed(6));

      const logItem: AIRequestLogItem = {
        id: uuidv4(),
        requestId: `req_${Date.now()}_${uuidv4().substring(0, 6)}`,
        timestamp: new Date().toISOString(),
        provider: params.provider,
        model: params.model,
        requestType: params.requestType || "stream_insight",
        tokensIn: params.tokensIn ?? Math.round(tokens * 0.7),
        tokensOut: params.tokensOut ?? Math.round(tokens * 0.3),
        totalTokens: tokens,
        latencyMs: params.latencyMs || 0,
        cacheHit: !!params.cacheHit,
        fallbackUsed: !!params.fallbackUsed,
        fallbackProvider: params.fallbackProvider || null,
        status: params.status || "success",
        errorType: params.errorType || null,
        estimatedCostUsd,
        sessionId: params.sessionId || null,
        creatorId: params.creatorId || null,
        source: params.source || "producer",
      };

      await db.collection("ai_request_logs").insertOne(logItem);
    } catch (e) {
      console.error("[AIRequestLogger] Failed to persist AI request log:", e);
    }
  }
}

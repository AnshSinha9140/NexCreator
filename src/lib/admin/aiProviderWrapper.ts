import { AITelemetryLogger, AITelemetryLogDoc } from "./aiTelemetryLogger";

export interface AIExecutionOptions {
  feature?: string;
  requestType?: string;
  creatorId?: string | null;
  sessionId?: string | null;
  monitoringSessionId?: string | null;
  promptText?: string;
  cacheHit?: boolean;
  retryCount?: number;
  fallbackUsed?: boolean;
}

export class AIProviderWrapper {
  public static async executeRequest<T>(
    providerName: string,
    modelName: string,
    executeFn: () => Promise<{ result: T; content?: string; tokensUsed?: number; error?: string }>,
    options: AIExecutionOptions = {}
  ): Promise<T> {
    const startTime = Date.now();
    const promptChars = options.promptText?.length || 0;

    let resultStatus: AITelemetryLogDoc["status"] = "success";
    let errorMessage: string | null = null;
    let responseChars = 0;
    let tokensUsed = 0;
    let outputResult: T;

    try {
      const res = await executeFn();
      outputResult = res.result;
      responseChars = res.content?.length || 0;
      tokensUsed = res.tokensUsed || Math.ceil((promptChars + responseChars) / 4) || 400;

      if (res.error) {
        resultStatus = "failed";
        errorMessage = res.error;
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      errorMessage = msg;

      if (msg.toLowerCase().includes("timeout") || msg.toLowerCase().includes("abort")) {
        resultStatus = "timeout";
      } else if (msg.includes("429") || msg.toLowerCase().includes("rate limit")) {
        resultStatus = "rate_limited";
      } else if (msg.toLowerCase().includes("quota")) {
        resultStatus = "quota_exceeded";
      } else {
        resultStatus = "failed";
      }

      // Log failure telemetry
      const latencyMs = Date.now() - startTime;
      await AITelemetryLogger.logRequest({
        timestamp: new Date().toISOString(),
        creatorId: options.creatorId,
        sessionId: options.sessionId,
        monitoringSessionId: options.monitoringSessionId || options.sessionId,
        provider: providerName,
        model: modelName,
        feature: options.feature || "Creator Intelligence",
        requestType: options.requestType || "stream_insight",
        status: resultStatus,
        latencyMs,
        inputTokens: Math.ceil(promptChars / 4),
        outputTokens: 0,
        totalTokens: Math.ceil(promptChars / 4),
        cacheHit: !!options.cacheHit,
        fallbackUsed: !!options.fallbackUsed,
        retryCount: options.retryCount || 0,
        promptCharacters: promptChars,
        responseCharacters: 0,
        errorMessage,
      });

      throw err;
    }

    const latencyMs = Date.now() - startTime;

    // Log successful telemetry
    await AITelemetryLogger.logRequest({
      timestamp: new Date().toISOString(),
      creatorId: options.creatorId,
      sessionId: options.sessionId,
      monitoringSessionId: options.monitoringSessionId || options.sessionId,
      provider: providerName,
      model: modelName,
      feature: options.feature || "Creator Intelligence",
      requestType: options.requestType || "stream_insight",
      status: resultStatus,
      latencyMs,
      inputTokens: Math.ceil(promptChars / 4),
      outputTokens: Math.ceil(responseChars / 4),
      totalTokens: tokensUsed,
      cacheHit: !!options.cacheHit,
      fallbackUsed: !!options.fallbackUsed,
      retryCount: options.retryCount || 0,
      promptCharacters: promptChars,
      responseCharacters: responseChars,
      errorMessage: null,
    });

    return outputResult;
  }
}

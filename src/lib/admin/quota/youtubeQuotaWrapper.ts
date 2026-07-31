import { YouTubeQuotaTelemetryLogger, YouTubeQuotaLogDoc } from "./youtubeQuotaLogger";

export interface YouTubeExecutionOptions {
  creatorId?: string | null;
  sessionId?: string | null;
  endpoint?: string;
  requestType?: string;
  quotaUnits?: number;
}

export class YouTubeQuotaWrapper {
  public static async execute<T>(
    endpointName: string,
    executeFn: () => Promise<{ result: T; quotaUnits?: number; error?: string }>,
    options: YouTubeExecutionOptions = {}
  ): Promise<T> {
    const startTime = Date.now();
    let resultStatus: YouTubeQuotaLogDoc["status"] = "success";
    let errorMessage: string | null = null;
    let quotaUnits = options.quotaUnits ?? 1;
    let outputResult: T;

    try {
      const res = await executeFn();
      outputResult = res.result;
      if (res.quotaUnits !== undefined) quotaUnits = res.quotaUnits;

      if (res.error) {
        resultStatus = "failed";
        errorMessage = res.error;
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      errorMessage = msg;

      if (msg.includes("429") || msg.toLowerCase().includes("rate limit")) {
        resultStatus = "rate_limited";
      } else if (msg.toLowerCase().includes("quota")) {
        resultStatus = "quota_exceeded";
      } else {
        resultStatus = "failed";
      }

      const durationMs = Date.now() - startTime;
      await YouTubeQuotaTelemetryLogger.logRequest({
        timestamp: new Date().toISOString(),
        creatorId: options.creatorId,
        sessionId: options.sessionId,
        endpoint: endpointName,
        quotaUnits,
        requestType: options.requestType || "chat_poll",
        status: resultStatus,
        durationMs,
        success: false,
        errorMessage,
      });

      throw err;
    }

    const durationMs = Date.now() - startTime;

    await YouTubeQuotaTelemetryLogger.logRequest({
      timestamp: new Date().toISOString(),
      creatorId: options.creatorId,
      sessionId: options.sessionId,
      endpoint: endpointName,
      quotaUnits,
      requestType: options.requestType || "chat_poll",
      status: resultStatus,
      durationMs,
      success: true,
      errorMessage: null,
    });

    return outputResult;
  }
}

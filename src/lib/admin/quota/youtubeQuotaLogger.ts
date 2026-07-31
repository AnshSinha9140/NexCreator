import clientPromise from "@/lib/mongodb";

export interface YouTubeQuotaLogDoc {
  _id?: any;
  timestamp: string;
  creatorId: string | null;
  sessionId: string | null;
  endpoint: string;
  quotaUnits: number;
  requestType: string;
  status: "success" | "failed" | "rate_limited" | "quota_exceeded";
  durationMs: number;
  success: boolean;
  errorMessage: string | null;
  buildVersion: string;
}

export class YouTubeQuotaTelemetryLogger {
  public static async logRequest(telemetry: Partial<YouTubeQuotaLogDoc>): Promise<void> {
    try {
      const client = await clientPromise;
      const db = client.db(process.env.MONGODB_DB_NAME || "nexcreator");

      const doc: YouTubeQuotaLogDoc = {
        timestamp: telemetry.timestamp || new Date().toISOString(),
        creatorId: telemetry.creatorId || null,
        sessionId: telemetry.sessionId || null,
        endpoint: telemetry.endpoint || "liveChatMessages.list",
        quotaUnits: telemetry.quotaUnits ?? 1,
        requestType: telemetry.requestType || "chat_poll",
        status: telemetry.status || "success",
        durationMs: telemetry.durationMs || 0,
        success: telemetry.success ?? true,
        errorMessage: telemetry.errorMessage || null,
        buildVersion: telemetry.buildVersion || "1.3.0",
      };

      await db.collection("youtube_request_logs").insertOne(doc);
    } catch (e) {
      console.error("[YouTubeQuotaTelemetryLogger] Failed to log quota request:", e);
    }
  }
}

import { NextRequest, NextResponse } from "next/server";
import { verifyAdminSession } from "@/lib/adminAuth";

export async function GET(request: NextRequest) {
  const auth = await verifyAdminSession(request);
  if (!auth.authorized) return auth.errorResponse!;

  const errors = [
    {
      id: "err_901",
      timestamp: new Date(Date.now() - 10 * 60000).toISOString(),
      severity: "HIGH",
      subsystem: "Provider",
      message: "Gemini 1.5 Flash API returned 429 Rate Limit Exceeded",
      stackTrace: "Error: 429 Too Many Requests at GeminiClient.generateContent (src/lib/gemini.ts:42)\n  at processTicksAndRejections (node:internal/process/task_queues:95:5)\n  at async analyzeSnapshot (src/lib/analyzerWorker.ts:88)",
      suggestedCause: "Burst rate limit exceeded during high chat volume spike.",
      suggestedResolution: "Automatic fallback to Groq Llama 3 provider handled this request gracefully. Consider increasing Gemini rate limits in settings.",
    },
    {
      id: "err_902",
      timestamp: new Date(Date.now() - 45 * 60000).toISOString(),
      severity: "MEDIUM",
      subsystem: "Collector",
      message: "YouTube Live Chat collector received 403 Forbidden (Quota Depleted)",
      stackTrace: "FetchError: 403 Forbidden at YouTubeCollector.fetchLiveChat (src/lib/youtube.ts:112)\n  at async CollectorDaemon.run (src/lib/ingestion/collector.ts:54)",
      suggestedCause: "Daily YouTube Data API v3 quota allocation exhausted.",
      suggestedResolution: "Switched collector to internal scraping fallback mode. Rotate YouTube API Key in Admin Settings.",
    },
    {
      id: "err_903",
      timestamp: new Date(Date.now() - 120 * 60000).toISOString(),
      severity: "LOW",
      subsystem: "Authentication",
      message: "Invalid session JWT signature presented by IP 192.168.1.45",
      stackTrace: "JWTExpiredError: Token expired at verifySessionToken (src/lib/session.ts:65)",
      suggestedCause: "User browser held an expired auth cookie session beyond 24 hours.",
      suggestedResolution: "Normal security behavior. User requested to re-authenticate at /login.",
    },
  ];

  return NextResponse.json({ success: true, data: errors });
}

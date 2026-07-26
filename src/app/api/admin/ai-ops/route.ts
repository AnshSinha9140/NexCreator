import { NextRequest, NextResponse } from "next/server";
import { verifyAdminSession } from "@/lib/adminAuth";

export async function GET(request: NextRequest) {
  const auth = await verifyAdminSession(request);
  if (!auth.authorized) return auth.errorResponse!;

  const providers = [
    {
      name: "Gemini 1.5 Flash",
      status: "healthy",
      latencyMs: 0,
      requestsToday: 0,
      failures: 0,
      timeouts: 0,
      rateLimits429: 0,
      avgResponseTimeMs: 0,
      tokensEstimated: 0,
      cacheHits: 0,
      cacheMisses: 0,
      fallbackCount: 0,
    },
    {
      name: "Groq Llama 3 70B",
      status: "healthy",
      latencyMs: 0,
      requestsToday: 0,
      failures: 0,
      timeouts: 0,
      rateLimits429: 0,
      avgResponseTimeMs: 0,
      tokensEstimated: 0,
      cacheHits: 0,
      cacheMisses: 0,
      fallbackCount: 0,
    },
    {
      name: "Local Rule Engine",
      status: "healthy",
      latencyMs: 0,
      requestsToday: 0,
      failures: 0,
      timeouts: 0,
      rateLimits429: 0,
      avgResponseTimeMs: 0,
      tokensEstimated: 0,
      cacheHits: 0,
      cacheMisses: 0,
      fallbackCount: 0,
    },
  ];

  const charts = {
    requestsPerHour: [],
    providerUsage: [],
    latencyTimeline: [],
    fallbackTimeline: [],
  };

  return NextResponse.json({
    success: true,
    data: { providers, charts },
  });
}

import { NextRequest, NextResponse } from "next/server";
import { verifyAdminSession } from "@/lib/adminAuth";

export async function GET(request: NextRequest) {
  const auth = await verifyAdminSession(request);
  if (!auth.authorized) return auth.errorResponse!;

  const providers = [
    {
      name: "Gemini 1.5 Flash",
      status: "healthy",
      latencyMs: 240,
      requestsToday: 11200,
      failures: 12,
      timeouts: 4,
      rateLimits429: 2,
      avgResponseTimeMs: 240,
      tokensEstimated: 4850000,
      cacheHits: 8400,
      cacheMisses: 2800,
      fallbackCount: 14,
    },
    {
      name: "Groq Llama 3 70B",
      status: "healthy",
      latencyMs: 110,
      requestsToday: 3620,
      failures: 2,
      timeouts: 0,
      rateLimits429: 0,
      avgResponseTimeMs: 110,
      tokensEstimated: 1200000,
      cacheHits: 2900,
      cacheMisses: 720,
      fallbackCount: 0,
    },
    {
      name: "Local Rule Engine",
      status: "healthy",
      latencyMs: 4,
      requestsToday: 18450,
      failures: 0,
      timeouts: 0,
      rateLimits429: 0,
      avgResponseTimeMs: 4,
      tokensEstimated: 0,
      cacheHits: 18450,
      cacheMisses: 0,
      fallbackCount: 0,
    },
  ];

  const charts = {
    requestsPerHour: [
      { label: "00:00", value: 450 },
      { label: "04:00", value: 210 },
      { label: "08:00", value: 920 },
      { label: "12:00", value: 1840 },
      { label: "16:00", value: 2450 },
      { label: "20:00", value: 3100 },
    ],
    providerUsage: [
      { label: "Gemini", value: 75 },
      { label: "Groq", value: 20 },
      { label: "Rule Engine", value: 5 },
    ],
    latencyTimeline: [
      { label: "P50", value: 180 },
      { label: "P90", value: 340 },
      { label: "P99", value: 890 },
    ],
    fallbackTimeline: [
      { label: "12:00", value: 1 },
      { label: "14:00", value: 4 },
      { label: "16:00", value: 6 },
      { label: "18:00", value: 3 },
    ],
  };

  return NextResponse.json({
    success: true,
    data: { providers, charts },
  });
}

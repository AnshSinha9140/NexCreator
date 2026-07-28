import { NextRequest, NextResponse } from "next/server";
import { verifyAdminSession } from "@/lib/adminAuth";
import { connectToDatabase } from "@/lib/mongodb";

export async function GET(request: NextRequest) {
  const auth = await verifyAdminSession(request);
  if (!auth.authorized) return auth.errorResponse!;

  try {
    const { db } = await connectToDatabase();
    const insights = await db.collection("ai_insights").find({}).sort({ createdAt: -1 }).limit(100).toArray();

    const promptLogs = insights.map((ins: any) => {
      const provider = ins.provider || ins.sourceModel || "Gemini";
      const model = ins.model || ins.modelVersion || (provider.toLowerCase().includes("groq") ? "llama-3.3-70b-versatile" : "gemini-2.5-flash");
      const estimatedTokens = ins.tokens || ins.estimatedTokens || 450;
      const latencyMs = ins.latencyMs || ins.processingTimeMs || 180;

      return {
        id: ins._id?.toString() || ins.id,
        timestamp: ins.createdAt || new Date().toISOString(),
        creator: (ins.creatorId || ins.userId || "unknown").split("@")[0],
        creatorEmail: ins.creatorId || ins.userId || "unknown",
        provider,
        model,
        promptVersion: ins.promptVersion || "v2.5",
        promptSize: `${ins.promptLength || 850} chars`,
        estimatedTokens,
        latencyMs,
        responseStatus: ins.error ? 500 : 200,
        traceDetails: {
          originalPulseSnapshot: {
            sessionId: ins.sessionId,
            timestamp: ins.createdAt,
            type: ins.type || "snapshot",
          },
          promptBuilderOutput: {
            contextWindow: "60s rolling window",
            rulesApplied: ins.rulesApplied || 2,
          },
          finalPrompt: ins.promptText || `System Prompt: Analyze stream pulse for ${ins.creatorId}\nUser Context: Active stream telemetry & representative chat messages`,
          providerResponse: ins.rawResponse || JSON.stringify(ins, null, 2),
          storedAiInsight: ins,
        },
      };
    });

    return NextResponse.json({ success: true, data: promptLogs });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

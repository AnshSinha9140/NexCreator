import { NextRequest, NextResponse } from "next/server";
import { verifyAdminSession } from "@/lib/adminAuth";

export async function GET(request: NextRequest) {
  const auth = await verifyAdminSession(request);
  if (!auth.authorized) return auth.errorResponse!;

  const promptLogs = [
    {
      id: "pr_88201",
      timestamp: new Date(Date.now() - 120000).toISOString(),
      creator: "xQc",
      session: "sess_live_1784820001",
      provider: "Gemini",
      model: "gemini-1.5-flash",
      promptVersion: "v2.4.1",
      promptSize: "4.2 KB",
      estimatedTokens: 820,
      latencyMs: 245,
      responseStatus: 200,
      traceDetails: {
        originalPulseSnapshot: {
          snapshotId: "snap_101",
          messagesCount: 150,
          chatSample: [
            "W STREAMER",
            "DRAKE IN THE HOUSE OMG",
            "KEKW KEKW",
            "is this real?",
          ],
          viewerCount: 42150,
        },
        promptBuilderOutput: {
          systemInstruction: "You are NexCreator Pulse Engine. Analyze the stream chat sample and generate key insights.",
          contextVars: { creator: "xQc", category: "Just Chatting", peakViewers: 42150 },
        },
        finalPrompt: `System: You are NexCreator Pulse Engine. Analyze stream chat.\nContext: xQc (Viewers: 42150)\nSample:\n- W STREAMER\n- DRAKE IN THE HOUSE OMG\n- KEKW KEKW`,
        providerResponse: `{\n  "hypeLevel": 92,\n  "summary": "Massive viewer excitement triggered by Drake surprise appearance.",\n  "keyEntities": ["Drake", "Streamer"],\n  "suggestedActions": ["Highlight timestamp 16:20", "Create short clip"]\n}`,
        parsedJson: {
          hypeLevel: 92,
          summary: "Massive viewer excitement triggered by Drake surprise appearance.",
          keyEntities: ["Drake", "Streamer"],
          suggestedActions: ["Highlight timestamp 16:20", "Create short clip"],
        },
        storedAiInsight: {
          insightId: "ins_991",
          category: "Viral Moment",
          confidenceScore: 0.96,
          savedToMongo: true,
        },
      },
    },
    {
      id: "pr_88202",
      timestamp: new Date(Date.now() - 360000).toISOString(),
      creator: "8BitGoldy",
      session: "sess_live_1784820002",
      provider: "Groq",
      model: "llama-3-70b-8192",
      promptVersion: "v2.4.1",
      promptSize: "2.8 KB",
      estimatedTokens: 410,
      latencyMs: 108,
      responseStatus: 200,
      traceDetails: {
        originalPulseSnapshot: {
          snapshotId: "snap_201",
          messagesCount: 45,
          chatSample: ["nice build", "crafting time!", "pog"],
          viewerCount: 1850,
        },
        promptBuilderOutput: {
          systemInstruction: "You are NexCreator Pulse Engine. Analyze stream chat.",
          contextVars: { creator: "8BitGoldy", category: "Minecraft" },
        },
        finalPrompt: `System: Analyze stream chat.\nContext: 8BitGoldy (Minecraft)\nSample: ["nice build", "crafting time!"]`,
        providerResponse: `{\n  "hypeLevel": 75,\n  "summary": "Positive chat engagement during Minecraft castle crafting phase."\n}`,
        parsedJson: {
          hypeLevel: 75,
          summary: "Positive chat engagement during Minecraft castle crafting phase.",
        },
        storedAiInsight: {
          insightId: "ins_992",
          category: "Gameplay Sentiment",
          confidenceScore: 0.88,
          savedToMongo: true,
        },
      },
    },
    {
      id: "pr_88203",
      timestamp: new Date(Date.now() - 900000).toISOString(),
      creator: "Trainwreckstv",
      session: "sess_live_1784820003",
      provider: "Gemini",
      model: "gemini-1.5-flash",
      promptVersion: "v2.4.0",
      promptSize: "3.5 KB",
      estimatedTokens: 640,
      latencyMs: 1450,
      responseStatus: 429,
      traceDetails: {
        originalPulseSnapshot: {
          snapshotId: "snap_301",
          messagesCount: 200,
          chatSample: ["squadW", "BOOK BOOK BOOK", "gambling hype"],
          viewerCount: 14200,
        },
        promptBuilderOutput: {
          systemInstruction: "Analyze stream chat",
        },
        finalPrompt: "Final prompt payload...",
        providerResponse: `HTTP 429: Resource Exceeded Rate Limit`,
        parsedJson: null,
        storedAiInsight: {
          fallbackTriggered: true,
          fallbackProvider: "Groq",
        },
      },
    },
  ];

  return NextResponse.json({ success: true, data: promptLogs });
}

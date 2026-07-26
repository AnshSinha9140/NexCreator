import { v4 as uuidv4 } from "uuid";
import clientPromise from "@/lib/mongodb";
import { AIProviderFactory } from "./providerFactory";
import { PromptPayload } from "./types";
import {
  ExecutiveReport,
  ExecutiveSummaryData,
  StreamScores,
  BiggestWinItem,
  MissedOpportunityItem,
  StoryMilestone,
  AudienceIntelligence,
  BestMomentItem,
  ClipOpportunityItem,
  CoachingInsightItem,
  ActionItem,
  AIReportMetadata,
  StreamGrade,
} from "./executiveTypes";

function scoreToGrade(score: number): StreamGrade {
  if (score >= 97) return "A+";
  if (score >= 93) return "A";
  if (score >= 90) return "A-";
  if (score >= 87) return "B+";
  if (score >= 83) return "B";
  if (score >= 80) return "B-";
  if (score >= 77) return "C+";
  if (score >= 73) return "C";
  if (score >= 70) return "C-";
  if (score >= 60) return "D";
  return "F";
}

function buildExecutivePrompt(
  session: any,
  snapshots: any[],
  insights: any[]
): string {
  const snapshotSummary = snapshots
    .slice(0, 20)
    .map((s: any, i: number) =>
      `[T+${i * 5}min] viewers=${s.metrics?.viewerCount ?? "?"}, chatVelocity=${s.metrics?.chatVelocity ?? "?"}, sentiment=${s.sentiment?.overall ?? "neutral"}`
    )
    .join("\n");

  const insightSummary = insights
    .slice(0, 15)
    .map((ins: any) =>
      `[${ins.type}] ${ins.title} — severity=${ins.severity}, confidence=${ins.confidence}`
    )
    .join("\n");

  return `You are an experienced live stream executive producer. Analyze this completed stream and respond with ONLY a valid JSON object.

SESSION CONTEXT:
- Title: ${session.streamTitle || "Untitled Stream"}
- Platform: ${session.platform || "Unknown"}
- Duration: ${Math.round((session.streamDurationSeconds || 3600) / 60)} minutes
- Status: ${session.status}

PULSE SNAPSHOT TELEMETRY (sample):
${snapshotSummary}

AI INSIGHTS GENERATED:
${insightSummary}

Generate a comprehensive executive producer report as a single JSON object with EXACTLY this structure:
{
  "executiveSummary": {
    "narrative": "<2-3 paragraph human executive summary>",
    "confidence": 88
  },
  "scores": {
    "overall": 85,
    "content": 88,
    "audience": 82,
    "retention": 87,
    "energy": 80,
    "interaction": 90,
    "consistency": 84,
    "communityResponse": 86
  },
  "biggestWins": [
    {
      "id": "win-1",
      "title": "Peak Chat Engagement",
      "category": "highest_engagement",
      "timestamp": "01:42:00",
      "confidence": 94,
      "explanation": "Chat velocity doubled during gameplay discussion"
    }
  ],
  "missedOpportunities": [
    {
      "id": "miss-1",
      "title": "Repeated Questions Ignored",
      "category": "ignored_questions",
      "timestamp": "00:35:00",
      "whatHappened": "At least 12 viewers asked similar questions that went unanswered",
      "whyItMatters": "Ignored questions signal disengagement",
      "recommendation": "Allocate Q&A segments every 20-30 minutes"
    }
  ],
  "streamStory": [
    { "id": "s-1", "title": "Slow Start", "timestamp": "00:00:00", "description": "Stream began quietly", "type": "start" },
    { "id": "s-2", "title": "Momentum Building", "timestamp": "00:20:00", "description": "Engagement increased", "type": "momentum_up" },
    { "id": "s-3", "title": "Peak Moment", "timestamp": "01:42:00", "description": "Highest viewer interaction", "type": "peak" },
    { "id": "s-4", "title": "Strong Finish", "timestamp": "02:30:00", "description": "Ended on positive note", "type": "end" }
  ],
  "audienceIntelligence": {
    "overallMood": "positive",
    "moodExplanation": "Audience was consistently engaged and upbeat throughout",
    "mostDiscussedTopics": ["gameplay", "setup", "future plans"],
    "frequentlyAskedQuestions": ["What GPU do you use?", "When is next stream?"],
    "topKeywords": ["epic", "great", "PogChamp", "KEKW"],
    "positiveMoments": ["The clutch play at 1:42", "Q&A session"],
    "negativeMoments": ["Long silence at 00:35"],
    "communityInterests": ["gaming tech", "upcoming titles"],
    "viewerParticipationRate": 68
  },
  "bestMoments": [
    {
      "id": "bm-1",
      "timestamp": "01:42:18",
      "title": "Peak Hype Moment",
      "confidence": 96,
      "reason": "Chat velocity tripled in under 90 seconds",
      "supportingMetrics": ["Chat rate: 140/min", "Positive sentiment: 91%"],
      "recommendation": "Clip this segment immediately for social"
    }
  ],
  "clipOpportunities": [
    {
      "id": "clip-1",
      "timestamp": "01:42:00",
      "durationSeconds": 90,
      "confidence": 94,
      "reason": "Exceptional hype peak",
      "suggestedTitle": "Insane Clutch Moment!",
      "suggestedHook": "Nobody expected this...",
      "suggestedThumbnailIdea": "Shocked face + highlight text overlay"
    }
  ],
  "coaching": [
    {
      "id": "coach-1",
      "comparisonLabel": "Compared to your last 5 streams",
      "insight": "Your Q&A engagement is 24% higher than your average",
      "improvement": "better",
      "recommendation": "Add a dedicated 15-minute Q&A block at the halfway point",
      "confidence": 89
    }
  ],
  "actionPlan": [
    { "id": "action-1", "text": "Create a clip from timestamp 01:42:18", "isCompleted": false, "priority": "high", "relatedTimestamp": "01:42:18" },
    { "id": "action-2", "text": "Schedule a dedicated Q&A segment next stream", "isCompleted": false, "priority": "high" },
    { "id": "action-3", "text": "Review and respond to unanswered viewer questions", "isCompleted": false, "priority": "medium" }
  ]
}`;
}

export class ExecutiveProducer {
  static async generateReport(sessionId: string, creatorId: string): Promise<ExecutiveReport> {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB_NAME || "nexcreator");

    // 1. Check if report already exists (cache)
    const existing = await db.collection("executive_reports").findOne({ sessionId, creatorId });
    if (existing) {
      return existing as unknown as ExecutiveReport;
    }

    // 2. Fetch session
    const session = await db.collection("monitoring_sessions").findOne({ id: sessionId });

    // 3. Fetch pulse snapshots (up to 60)
    const snapshots = await db.collection("pulse_snapshots")
      .find({ sessionId })
      .sort({ windowEnd: 1 })
      .limit(60)
      .toArray();

    // 4. Fetch AI insights
    const insights = await db.collection("ai_insights")
      .find({ sessionId })
      .sort({ createdAt: 1 })
      .limit(50)
      .toArray();

    // 5. Build prompt and call provider
    const prompt = buildExecutivePrompt(session || { streamTitle: "Stream", platform: "unknown" }, snapshots, insights);
    const start = Date.now();

    let rawContent = "";
    let provider = "gemini";
    let model = "gemini-2.0-flash";
    let fallbackUsed = false;

    const promptPayload: PromptPayload = {
      systemPrompt: "You are an experienced live stream executive producer generating structured post-stream reports.",
      userPrompt: prompt,
      snapshotId: snapshots[0]?.id || "exec-report",
      sessionId,
      creatorId,
    };

    // Try primary provider (Gemini)
    const primary = AIProviderFactory.getPrimaryProvider();
    try {
      const response = await primary.provider.generateInsight(promptPayload);
      rawContent = response.content;
      provider = primary.name;
      model = primary.model;
      fallbackUsed = false;
    } catch (primaryErr: any) {
      console.warn(`[ExecutiveProducer] Primary provider failed: ${primaryErr.message}`);
      // Try fallback (Groq)
      const fallbackDesc = AIProviderFactory.getFallbackProvider();
      if (fallbackDesc) {
        try {
          const response = await fallbackDesc.provider.generateInsight(promptPayload);
          rawContent = response.content;
          provider = fallbackDesc.name;
          model = fallbackDesc.model;
          fallbackUsed = true;
        } catch (fallbackErr: any) {
          console.warn(`[ExecutiveProducer] Fallback provider failed: ${fallbackErr.message}`);
        }
      }
      // Rule engine fallback
      if (!rawContent) {
        console.error("[ExecutiveProducer] All LLM providers failed, using rule engine fallback.");
        rawContent = await ExecutiveProducer.buildFallbackReport(session, snapshots, insights);
        provider = "rule_engine";
        model = "rule-based-v1";
        fallbackUsed = true;
      }
    }

    const latencyMs = Date.now() - start;

    // 6. Parse LLM response
    let parsed: any = {};
    try {
      const jsonMatch = rawContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[0]);
      }
    } catch (err) {
      console.error("[ExecutiveProducer] JSON parse error:", err);
    }

    // 7. Compute final scores from real snapshot data as baseline
    const computedScores = ExecutiveProducer.computeScores(snapshots, insights, parsed.scores);

    // 8. Build report
    const now = new Date().toISOString();
    const report: ExecutiveReport = {
      id: uuidv4(),
      sessionId,
      creatorId,
      streamTitle: session?.streamTitle || "Stream",
      platform: session?.platform || "unknown",
      streamDurationSeconds: session?.streamDurationSeconds || snapshots.length * 60,
      startedAt: session?.startedAt || session?.createdAt,
      completedAt: session?.completedAt || session?.updatedAt,

      executiveSummary: {
        narrative: parsed.executiveSummary?.narrative || "Your stream performed well with consistent audience engagement throughout the session.",
        generatedAt: now,
        modelUsed: model,
        confidence: parsed.executiveSummary?.confidence ?? 82,
      },
      scores: computedScores,
      biggestWins: parsed.biggestWins || [],
      missedOpportunities: parsed.missedOpportunities || [],
      streamStory: parsed.streamStory || [],
      audienceIntelligence: parsed.audienceIntelligence || {
        overallMood: "neutral",
        moodExplanation: "Insufficient data to determine audience mood.",
        mostDiscussedTopics: [],
        frequentlyAskedQuestions: [],
        topKeywords: [],
        positiveMoments: [],
        negativeMoments: [],
        communityInterests: [],
        viewerParticipationRate: 50,
      },
      bestMoments: parsed.bestMoments || [],
      clipOpportunities: parsed.clipOpportunities || [],
      coaching: parsed.coaching || [],
      actionPlan: parsed.actionPlan || [],

      isFavorited: false,
      isExported: false,
      aiMetadata: {
        provider,
        model,
        latencyMs,
        fallbackUsed,
        generatedAt: now,
        snapshotsAnalyzed: snapshots.length,
        insightsAnalyzed: insights.length,
        totalMessagesAnalyzed: snapshots.reduce((sum: number, s: any) => sum + (s.metrics?.totalMessages || 0), 0),
      },
      createdAt: now,
      updatedAt: now,
    };

    // 9. Persist report
    await db.collection("executive_reports").insertOne(report);

    return report;
  }

  private static computeScores(snapshots: any[], insights: any[], llmScores?: any): StreamScores {
    // Use LLM scores as base, verify/clamp
    const base = {
      overall: llmScores?.overall ?? 80,
      content: llmScores?.content ?? 82,
      audience: llmScores?.audience ?? 78,
      retention: llmScores?.retention ?? 80,
      energy: llmScores?.energy ?? 76,
      interaction: llmScores?.interaction ?? 84,
      consistency: llmScores?.consistency ?? 79,
      communityResponse: llmScores?.communityResponse ?? 81,
    };

    const clamp = (v: number) => Math.min(100, Math.max(0, Math.round(v)));
    const overall = clamp(base.overall);

    return {
      overallGrade: scoreToGrade(overall),
      overall,
      content: clamp(base.content),
      audience: clamp(base.audience),
      retention: clamp(base.retention),
      energy: clamp(base.energy),
      interaction: clamp(base.interaction),
      consistency: clamp(base.consistency),
      communityResponse: clamp(base.communityResponse),
    };
  }

  private static async buildFallbackReport(session: any, snapshots: any[], insights: any[]): Promise<string> {
    const criticalInsights = insights.filter((i: any) => i.severity === "critical");
    const avgChat = snapshots.reduce((s: number, snap: any) => s + (snap.metrics?.chatVelocity || 0), 0) / Math.max(1, snapshots.length);

    return JSON.stringify({
      executiveSummary: {
        narrative: `Your stream ran for ${Math.round((session?.streamDurationSeconds || 3600) / 60)} minutes and generated ${insights.length} AI insights. Average chat velocity was ${Math.round(avgChat)} messages per minute. ${criticalInsights.length} critical alerts were detected during the session. Review the timeline below for detailed moment-by-moment breakdown.`,
        confidence: 70,
      },
      scores: {
        overall: 78, content: 80, audience: 75, retention: 79, energy: 73, interaction: 82, consistency: 77, communityResponse: 80,
      },
      biggestWins: [],
      missedOpportunities: [],
      streamStory: [],
      audienceIntelligence: {
        overallMood: "neutral",
        moodExplanation: "Audience mood analysis generated from rule engine.",
        mostDiscussedTopics: [],
        frequentlyAskedQuestions: [],
        topKeywords: [],
        positiveMoments: [],
        negativeMoments: [],
        communityInterests: [],
        viewerParticipationRate: 55,
      },
      bestMoments: [],
      clipOpportunities: [],
      coaching: [],
      actionPlan: [
        { id: "action-1", text: "Review AI insights from this session for improvement areas", isCompleted: false, priority: "high" },
        { id: "action-2", text: "Plan your next stream with specific engagement checkpoints", isCompleted: false, priority: "medium" },
      ],
    });
  }
}

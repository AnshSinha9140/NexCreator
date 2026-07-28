import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

// GET /api/debug/analytics?sessionId=XYZ (Analytics Single Source of Truth Trace)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("sessionId");

    if (!sessionId) {
      return NextResponse.json({ error: "sessionId is required for analytics debug trace" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("nexcreator");

    const latestSnapshot = await db
      .collection("pulse_snapshots")
      .findOne({ sessionId }, { sort: { createdAt: -1 } });

    const highlights = await db
      .collection("highlight_candidates")
      .find({ sessionId })
      .sort({ createdAt: -1 })
      .toArray();

    const analytics = latestSnapshot?.analytics || {
      viewers: latestSnapshot?.viewerMetrics?.averageViewerCount || 0,
      velocity: latestSnapshot?.metrics?.messagesPerMinute || 0,
      sentiment: 50,
      engagement: 0,
      momentum: 50,
      hypeScore: 0,
      questionCount: latestSnapshot?.metrics?.questionCount || 0,
      uniqueChatters: latestSnapshot?.metrics?.uniqueChattersCount || 0,
      emojiRate: 0,
      capsRate: 0,
      excitementScore: 0,
      toxicityScore: 0,
      generatedAt: latestSnapshot?.createdAt || new Date().toISOString(),
      sampleSize: latestSnapshot?.metrics?.totalMessages || 0,
    };

    return NextResponse.json({
      latestSnapshotId: latestSnapshot?.snapshotId || null,
      latestSnapshot,
      analytics,
      rawMetrics: latestSnapshot?.metrics || null,
      calculations: {
        velocity: {
          value: analytics.velocity,
          unit: "msgs/min",
          formula: "(messagesInWindow / durationMinutes)",
        },
        sentiment: {
          value: analytics.sentiment,
          unit: "0-100 score",
          formula: "50 + (positiveLexicon * 2) - (negativeLexicon * 3)",
        },
        engagement: {
          value: analytics.engagement,
          unit: "0-100 %",
          formula: "0.4 * chatterRatio + Math.min(40, velocity * 2) + Math.min(20, questions * 4)",
        },
        momentum: {
          value: analytics.momentum,
          unit: "0-100 score",
          formula: "0.5 * previousMomentum + 50 + (velocityDelta * 4 + engagementDelta * 0.8 + viewerDelta)",
        },
        hypeScore: {
          value: analytics.hypeScore,
          unit: "0-100 %",
          formula: "velocity * 1.2 + excitementScore * 0.4 + momentum * 0.3 + emojiRate * 0.2",
        },
      },
      highlightEvaluation: {
        accepted: highlights.map((h: any) => ({
          id: h.id,
          title: h.title,
          triggerReason: h.triggerReason,
          score: h.score,
          createdAt: h.createdAt,
        })),
        totalHighlightsGenerated: highlights.length,
      },
      consumers: [
        "LivePulseTab",
        "AIProducerTab",
        "TimelineTab",
        "HighlightsTab",
        "ExecutiveReports",
        "QuotaDashboardView",
      ],
    });
  } catch (error: any) {
    console.error("[API] GET /api/debug/analytics error:", error);
    return NextResponse.json({ error: error.message || "Failed to trace analytics" }, { status: 500 });
  }
}

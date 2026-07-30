import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { IntelligenceStorage } from "@/lib/intelligence/storage";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("sessionId");

    const client = await clientPromise;
    const db = client.db("nexcreator");

    let targetSessionId = sessionId;
    if (!targetSessionId) {
      const activeSession = await db.collection("monitoring_sessions").findOne({}, { sort: { createdAt: -1 } });
      targetSessionId = activeSession?.id || "demo-session";
    }

    const safeSessionId: string = targetSessionId || "demo-session";
    const bundle = await IntelligenceStorage.fetchLatestBundle(safeSessionId);


    if (!bundle || !bundle.diagnostics) {
      return NextResponse.json({
        sessionId: targetSessionId,
        status: "NO_DIAGNOSTICS_AVAILABLE",
        recommendationsGenerated: 0,
        recommendationsFiltered: 0,
        duplicatesRemoved: 0,
        recommendationsExpired: 0,
        recommendationsCompleted: 0,
        confidenceDistribution: { high: 0, medium: 0, low: 0 },
        qualityScores: [],
        recommendationHistory: [],
        intelligenceHealth: null,
      });
    }

    return NextResponse.json({
      sessionId: targetSessionId,
      ...bundle.diagnostics,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

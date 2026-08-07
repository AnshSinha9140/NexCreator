import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { CreatorIntelligenceBundle } from "@/types/intelligence";

export async function POST(req: NextRequest) {
  try {
    // 1. Security Check: Validate Cron Secret Authorization Header
    const authHeader = req.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { success: false, error: "Unauthorized: Invalid Cron Secret" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const creatorId = body.creatorId || body.userId;

    if (!creatorId) {
      return NextResponse.json(
        { success: false, error: "Missing required parameter: creatorId" },
        { status: 400 }
      );
    }

    // 2. Database Connection
    const { db } = await connectToDatabase();
    const collection = db.collection<CreatorIntelligenceBundle>("creator_intelligence");

    const existingDoc = await collection.findOne({ userId: creatorId });
    const creatorName = existingDoc?.creatorName || existingDoc?.stage1?.creator?.name || "Creator";

    // 3. 2-Stage Pipeline Refresh for Single Creator
    const lifecyclePhases = [
      "Early-Wipe Expansion & Hype",
      "Mid-Season Meta Shift",
      "Late-Game Retention & Variety",
      "Competitive Tournament Cycle",
    ];
    const currentPhase = existingDoc?.stage1?.creator?.lifecyclePhase || "Mid-Season Meta Shift";
    const nextPhaseIndex = (lifecyclePhases.indexOf(currentPhase) + 1) % lifecyclePhases.length;
    const updatedLifecyclePhase = lifecyclePhases[nextPhaseIndex];

    const updatedBaselines = {
      ...(existingDoc?.stage1?.liveMonitoringBaselines || {
        averageChatVelocityMsgsPerMin: 145,
        typicalFatiguePointHours: 4.5,
        highEngagementTriggers: ["Viewer Q&A", "Clutch Plays"],
        dropoffTriggers: ["Extended AFK"],
      }),
      averageChatVelocityMsgsPerMin: Math.floor(
        (existingDoc?.stage1?.liveMonitoringBaselines?.averageChatVelocityMsgsPerMin || 145) * (0.95 + Math.random() * 0.1)
      ),
    };

    const updatedStage1 = {
      ...(existingDoc?.stage1 || {
        creator: {
          name: creatorName,
          platforms: ["Kick", "YouTube"],
          category: "Gaming & Variety",
          contentArchetype: "Multiplayer Social RP",
          identity: "Entertainer",
          brandTone: "Authentic",
        },
        liveMonitoringBaselines: updatedBaselines,
        archetypeCrossPollination: [],
        strengths: [],
        weaknesses: [],
        risks: [],
      }),
      creator: {
        ...(existingDoc?.stage1?.creator || {
          name: creatorName,
          platforms: ["Kick", "YouTube"],
          category: "Gaming & Variety",
          contentArchetype: "Multiplayer Social RP",
          identity: "Entertainer",
          brandTone: "Authentic",
        }),
        lifecyclePhase: updatedLifecyclePhase,
      },
      liveMonitoringBaselines: updatedBaselines,
    };

    const updatedStage2 = {
      ...(existingDoc?.stage2 || {
        executiveLetter: { opening: "", bodyParagraphs: [], closingCommitment: "" },
        archetypeStrategy: { primaryArchetype: "", recommendedCrossOverFormats: [] },
        growthRoadmap: { ninetyDayPlan: [], oneYearVision: "" },
        liveMonitoringRules: [],
      }),
      liveMonitoringRules: [
        ...(existingDoc?.stage2?.liveMonitoringRules || []),
        `Refreshed rule (${updatedLifecyclePhase}): Adjust stream fatigue thresholds for shifting meta`,
      ].slice(-4),
    };

    // 4. Update MongoDB document
    await collection.updateOne(
      { userId: creatorId },
      {
        $set: {
          userId: creatorId,
          creatorName,
          stage1: updatedStage1,
          stage2: updatedStage2,
          lastRefreshedAt: new Date().toISOString(),
        },
      },
      { upsert: true }
    );

    return NextResponse.json({
      success: true,
      creatorId,
      creatorName,
      updatedLifecyclePhase,
      lastRefreshedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("[Refresh-Single API Error]:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to refresh single creator intelligence" },
      { status: 500 }
    );
  }
}

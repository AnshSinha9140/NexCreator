import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId") || "default_user";

    const { db } = await connectToDatabase();
    const doc = await db.collection("creator_intelligence").findOne({ userId });

    if (!doc) {
      // Default baseline fallback if DB has no record yet
      return NextResponse.json({
        success: true,
        baselines: {
          averageChatVelocityMsgsPerMin: 120,
          typicalFatiguePointHours: 4.0,
          highEngagementTriggers: ["Viewer Q&A", "Clutch Plays", "Community Memes"],
          dropoffTriggers: ["Extended Silence", "Unannounced Breaks"],
        },
        rules: [
          "Trigger low-energy alert after hour 4",
          "Prompt creator if chat velocity dips below 50 msgs/min",
        ],
      });
    }

    return NextResponse.json({
      success: true,
      baselines: doc.stage1?.liveMonitoringBaselines || null,
      rules: doc.stage2?.liveMonitoringRules || [],
      creator: doc.stage1?.creator || null,
    });
  } catch (error: any) {
    console.error("[Intelligence Baselines GET Error]:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

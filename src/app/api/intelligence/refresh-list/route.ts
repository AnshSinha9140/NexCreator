import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";

export async function GET(req: NextRequest) {
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

    // 2. Database Connection
    const { db } = await connectToDatabase();
    const collection = db.collection("creator_intelligence");

    // Query creators whose document hasn't been updated in 7+ days or all active records
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const docs = await collection
      .find({
        $or: [
          { lastRefreshedAt: { $lt: sevenDaysAgo } },
          { lastRefreshedAt: { $exists: false } },
        ],
      })
      .toArray();

    // Fallback: If no document matches the 7-day filter, fetch all active creators
    const targetDocs = docs.length > 0 ? docs : await collection.find({}).toArray();

    const creators = targetDocs.map((doc) => ({
      creatorId: doc.userId || doc._id.toString(),
      creatorName: doc.creatorName || doc.stage1?.creator?.name || "Creator",
      lastRefreshedAt: doc.lastRefreshedAt || doc.generatedAt || null,
    }));

    return NextResponse.json({
      success: true,
      count: creators.length,
      creators,
    });
  } catch (error: any) {
    console.error("[Refresh-List API Error]:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch creator refresh list" },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifySessionToken } from "@/lib/session";
import { YouTubeCapacityPlanner } from "@/lib/collectors/youtube/capacityPlanner";
import clientPromise from "@/lib/mongodb";

async function getAuthAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_session")?.value;
  if (!token) return null;
  const user = await verifySessionToken(token);
  if (!user || (!user.isAdmin && user.role !== "admin")) return null;
  return user;
}

// GET /api/admin/quota (Fetch real-time quota forecast, capacity state, multi-creator simulations, AI recommendations & history)
export async function GET(request: Request) {
  try {
    const admin = await getAuthAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized admin access" }, { status: 401 });
    }

    const planner = new YouTubeCapacityPlanner();

    const client = await clientPromise;
    const db = client.db("nexcreator");

    // Active streams count
    const activeStreamsCount = await db.collection("monitoring_sessions").countDocuments({
      status: { $in: ["waiting", "starting", "live"] },
    });

    const forecast = await planner.getLiveForecast(activeStreamsCount || 1);

    // Fetch historical daily analytics
    const history = await db
      .collection("quota_history")
      .find({})
      .sort({ date: -1 })
      .limit(14)
      .toArray();

    return NextResponse.json({
      success: true,
      forecast,
      activeStreamsCount,
      history,
    });
  } catch (error: any) {
    console.error("[API] GET /api/admin/quota error:", error);
    return NextResponse.json({ error: error.message || "Failed to generate quota forecast" }, { status: 500 });
  }
}

// POST /api/admin/quota (Record historical daily snapshot)
export async function POST(request: Request) {
  try {
    const admin = await getAuthAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized admin access" }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const client = await clientPromise;
    const db = client.db("nexcreator");

    const todayStr = new Date().toISOString().split("T")[0];

    const snapshot = {
      date: todayStr,
      platform: "youtube",
      quotaUsed: body.quotaUsed || 1240,
      quotaLimit: body.quotaLimit || 10000,
      streamsMonitored: body.streamsMonitored || 1,
      avgPollIntervalMs: body.avgPollIntervalMs || 10000,
      hourlyBurnRate: body.hourlyBurnRate || 360,
      updatedAt: new Date().toISOString(),
    };

    await db.collection("quota_history").updateOne(
      { date: todayStr, platform: "youtube" },
      { $set: snapshot },
      { upsert: true }
    );

    return NextResponse.json({ success: true, snapshot });
  } catch (error: any) {
    console.error("[API] POST /api/admin/quota error:", error);
    return NextResponse.json({ error: error.message || "Failed to persist quota snapshot" }, { status: 500 });
  }
}

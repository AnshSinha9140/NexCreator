import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { cookies } from "next/headers";
import { verifySessionToken } from "@/lib/session";

export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_session")?.value;
    const authUser = token ? await verifySessionToken(token) : null;

    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    let sessionId = searchParams.get("sessionId");

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB_NAME || "nexcreator");
    const collection = db.collection("ai_insights");

    if (!sessionId) {
      // Find latest monitoring session for this specific creator
      const latestSession = await db.collection("monitoring_sessions").findOne(
        { userId: authUser.email },
        { sort: { createdAt: -1 } }
      );
      if (latestSession) {
        sessionId = latestSession.id;
      }
    }

    // If no session exists for this user, return empty array (do NOT fallback to find({}))
    if (!sessionId) {
      return NextResponse.json({ success: true, insights: [], sessionId: null }, { status: 200 });
    }

    const insights = await collection
      .find({ sessionId })
      .sort({ createdAt: -1 })
      .limit(50)
      .toArray();

    return NextResponse.json({ success: true, insights, sessionId }, { status: 200 });
  } catch (error: any) {
    console.error("[API] Error fetching AI insights:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_session")?.value;
    const authUser = token ? await verifySessionToken(token) : null;

    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const body = await req.json();
    const { id, status, isPinned, isDismissed, isCompleted, isSaved } = body;

    if (!id) {
      return NextResponse.json({ error: "Missing insight id" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB_NAME || "nexcreator");

    const updates: any = {};
    if (status !== undefined) updates.status = status;
    if (isPinned !== undefined) updates.isPinned = isPinned;
    if (isDismissed !== undefined) updates.isDismissed = isDismissed;
    if (isCompleted !== undefined) updates.isCompleted = isCompleted;
    if (isSaved !== undefined) updates.isSaved = isSaved;
    updates.updatedAt = new Date().toISOString();

    await db.collection("ai_insights").updateOne(
      { id },
      { $set: updates }
    );

    return NextResponse.json({ success: true, message: "Insight updated successfully" }, { status: 200 });
  } catch (error: any) {
    console.error("[API] Error updating AI insight:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

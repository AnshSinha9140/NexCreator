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

    console.log(`[Auth] Authenticated User: ${authUser.email} | Creator ID: ${authUser.userId} | Session Valid | Route: GET /api/ai/insights`);

    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get("sessionId");

    if (!sessionId) {
      return NextResponse.json({ error: "Missing sessionId parameter" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB_NAME || "nexcreator");
    const collection = db.collection("ai_insights");

    const insights = await collection
      .find({ sessionId })
      .sort({ createdAt: -1 })
      .limit(50)
      .toArray();

    return NextResponse.json({ insights }, { status: 200 });
  } catch (error: any) {
    console.error("[API] Error fetching AI insights:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

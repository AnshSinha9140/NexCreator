import { NextRequest, NextResponse } from "next/server";
import { verifyAdminSession } from "@/lib/adminAuth";
import { connectToDatabase } from "@/lib/mongodb";

export async function GET(request: NextRequest) {
  const auth = await verifyAdminSession(request);
  if (!auth.authorized) return auth.errorResponse!;

  try {
    const { db } = await connectToDatabase();
    const dbSessions = await db.collection("monitoring_sessions").find({}).sort({ updatedAt: -1 }).toArray();

    return NextResponse.json({
      success: true,
      data: dbSessions,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

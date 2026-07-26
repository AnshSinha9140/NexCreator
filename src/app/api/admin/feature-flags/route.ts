import { NextRequest, NextResponse } from "next/server";
import { verifyAdminSession } from "@/lib/adminAuth";
import { connectToDatabase } from "@/lib/mongodb";

const initialFlags: any[] = [];

export async function GET(request: NextRequest) {
  const auth = await verifyAdminSession(request);
  if (!auth.authorized) return auth.errorResponse!;

  try {
    const { db } = await connectToDatabase();
    const storedFlags = await db.collection("feature_flags").find({}).toArray();

    if (storedFlags.length === 0) {
      return NextResponse.json({ success: true, data: initialFlags });
    }

    return NextResponse.json({ success: true, data: storedFlags });
  } catch (e: any) {
    return NextResponse.json({ success: true, data: initialFlags });
  }
}

export async function POST(request: NextRequest) {
  const auth = await verifyAdminSession(request);
  if (!auth.authorized) return auth.errorResponse!;

  try {
    const { key, enabled, rolloutPercentage } = await request.json();

    const { db } = await connectToDatabase();
    await db.collection("feature_flags").updateOne(
      { key },
      { $set: { enabled, rolloutPercentage, updatedAt: new Date() } },
      { upsert: true }
    );

    // Record audit log
    await db.collection("admin_audit_logs").insertOne({
      timestamp: new Date().toISOString(),
      admin: auth.user?.email || "admin@nexcreator.com",
      action: "Feature Flag Updated",
      target: key,
      reason: `Set enabled=${enabled}, rolloutPercentage=${rolloutPercentage}%`,
      metadata: { key, enabled, rolloutPercentage },
    });

    return NextResponse.json({ success: true, message: `Feature flag '${key}' updated.` });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

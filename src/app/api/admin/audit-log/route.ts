import { NextRequest, NextResponse } from "next/server";
import { verifyAdminSession } from "@/lib/adminAuth";
import { connectToDatabase } from "@/lib/mongodb";

export async function GET(request: NextRequest) {
  const auth = await verifyAdminSession(request);
  if (!auth.authorized) return auth.errorResponse!;

  const { searchParams } = new URL(request.url);
  const actionFilter = searchParams.get("action");
  const search = searchParams.get("search")?.toLowerCase();

  try {
    const { db } = await connectToDatabase();
    const dbLogs = await db.collection("admin_audit_logs").find({}).sort({ timestamp: -1 }).toArray();

    const mockAuditLogs = [
      {
        id: "aud_9001",
        timestamp: new Date(Date.now() - 600000).toISOString(),
        admin: "admin@nexcreator.com",
        action: "Approved Creator",
        target: "usr_103 (@8BitGoldy)",
        reason: "Kick channel verified & follower count threshold met (>40k).",
        metadata: { status: "verified" },
      },
      {
        id: "aud_9002",
        timestamp: new Date(Date.now() - 3600000 * 3).toISOString(),
        admin: "admin@nexcreator.com",
        action: "Feature Flag Updated",
        target: "ai_live_coach",
        reason: "Increased rollout percentage from 50% to 100%.",
        metadata: { key: "ai_live_coach", rollout: 100 },
      },
      {
        id: "aud_9003",
        timestamp: new Date(Date.now() - 3600000 * 12).toISOString(),
        admin: "admin@nexcreator.com",
        action: "Changed Settings",
        target: "System Pipeline",
        reason: "Updated default snapshot interval to 60 seconds.",
        metadata: { intervalSec: 60 },
      },
      {
        id: "aud_9004",
        timestamp: new Date(Date.now() - 3600000 * 24).toISOString(),
        admin: "admin@nexcreator.com",
        action: "Rejected Creator",
        target: "usr_104 (@SpamStreamer99)",
        reason: "Bot account detection rule matched.",
        metadata: { status: "rejected" },
      },
    ];

    let result = dbLogs.length > 0 ? dbLogs.map((l: any) => ({
      id: l._id?.toString() || l.id,
      timestamp: l.timestamp,
      admin: l.admin,
      action: l.action,
      target: l.target,
      reason: l.reason,
      metadata: l.metadata || {},
    })) : mockAuditLogs;

    if (actionFilter && actionFilter !== "all") {
      result = result.filter((l: any) => l.action.toLowerCase().includes(actionFilter.toLowerCase()));
    }

    if (search) {
      result = result.filter(
        (l: any) =>
          l.admin.toLowerCase().includes(search) ||
          l.action.toLowerCase().includes(search) ||
          l.target.toLowerCase().includes(search) ||
          l.reason.toLowerCase().includes(search)
      );
    }

    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

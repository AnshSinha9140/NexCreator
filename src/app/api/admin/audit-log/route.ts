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

    let result = dbLogs.map((l: any) => ({
      id: l._id?.toString() || l.id,
      timestamp: l.timestamp,
      admin: l.admin,
      action: l.action,
      target: l.target,
      reason: l.reason,
      metadata: l.metadata || {},
    }));

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

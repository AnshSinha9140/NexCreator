import { NextRequest, NextResponse } from "next/server";
import { verifyAdminSession } from "@/lib/adminAuth";
import clientPromise from "@/lib/mongodb";

export async function GET(request: NextRequest) {
  const auth = await verifyAdminSession(request);
  if (!auth.authorized) return auth.errorResponse!;

  const { searchParams } = new URL(request.url);
  const actionFilter = searchParams.get("action");
  const search = searchParams.get("search")?.toLowerCase();

  try {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB_NAME || "nexcreator");
    const dbLogs = await db.collection("admin_audit_logs").find({}).sort({ timestamp: -1 }).limit(200).toArray();

    let result = dbLogs.map((l: any) => ({
      id: l._id?.toString() || l.id || `audit_${Math.random()}`,
      timestamp: l.timestamp || new Date().toISOString(),
      admin: l.admin || "admin@nexcreator.com",
      action: l.action || "System Action",
      target: l.target || "System",
      reason: l.reason || "Administrative activity",
      metadata: l.metadata || {},
    }));

    if (actionFilter && actionFilter !== "all") {
      result = result.filter((l: any) =>
        (l.action || "").toLowerCase().includes(actionFilter.toLowerCase())
      );
    }

    if (search) {
      result = result.filter(
        (l: any) =>
          (l.admin || "").toLowerCase().includes(search) ||
          (l.action || "").toLowerCase().includes(search) ||
          (l.target || "").toLowerCase().includes(search) ||
          (l.reason || "").toLowerCase().includes(search)
      );
    }

    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const auth = await verifyAdminSession(request);
  if (!auth.authorized) return auth.errorResponse!;

  try {
    const { action, target, reason, metadata } = await request.json();

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB_NAME || "nexcreator");

    const newLog = {
      timestamp: new Date().toISOString(),
      admin: auth.user?.email || "admin@nexcreator.com",
      action: action || "Admin Action",
      target: target || "System",
      reason: reason || "Logged from Admin Console UI",
      metadata: metadata || {},
    };

    await db.collection("admin_audit_logs").insertOne(newLog);

    return NextResponse.json({ success: true, message: "Audit log recorded." });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

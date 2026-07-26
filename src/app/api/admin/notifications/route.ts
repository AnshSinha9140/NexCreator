import { NextRequest, NextResponse } from "next/server";
import { verifyAdminSession } from "@/lib/adminAuth";
import clientPromise from "@/lib/mongodb";

export async function GET(request: NextRequest) {
  const auth = await verifyAdminSession(request);
  if (!auth.authorized) return auth.errorResponse!;

  try {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB_NAME || "nexcreator");

    const notifications = await db.collection("admin_notifications")
      .find({})
      .sort({ createdAt: -1 })
      .limit(50)
      .toArray();

    const formatted = notifications.map((n) => ({
      id: n._id?.toString() || n.id,
      title: n.title,
      message: n.message,
      type: n.type || "info",
      read: n.read || false,
      timestamp: n.createdAt || n.timestamp,
    }));

    return NextResponse.json({
      success: true,
      data: {
        notifications: formatted,
        unreadCount: formatted.filter((n) => !n.read).length,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const auth = await verifyAdminSession(request);
  if (!auth.authorized) return auth.errorResponse!;

  try {
    const { action, id } = await request.json();
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB_NAME || "nexcreator");

    if (action === "mark_read" && id) {
      const { ObjectId } = require("mongodb");
      try {
        await db.collection("admin_notifications").updateOne(
          { _id: new ObjectId(id) },
          { $set: { read: true, updatedAt: new Date().toISOString() } }
        );
      } catch (_) {
        await db.collection("admin_notifications").updateOne(
          { id },
          { $set: { read: true, updatedAt: new Date().toISOString() } }
        );
      }
    } else if (action === "mark_all_read") {
      await db.collection("admin_notifications").updateMany(
        { read: false },
        { $set: { read: true, updatedAt: new Date().toISOString() } }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Notification action '${action}' applied successfully.`,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

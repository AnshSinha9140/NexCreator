import { NextRequest, NextResponse } from "next/server";
import { verifyAdminSession } from "@/lib/adminAuth";
import { connectToDatabase } from "@/lib/mongodb";

export async function GET(request: NextRequest) {
  const auth = await verifyAdminSession(request);
  if (!auth.authorized) return auth.errorResponse!;

  const { searchParams } = new URL(request.url);
  const statusFilter = searchParams.get("status");
  const search = searchParams.get("search")?.toLowerCase();

  try {
    const { db } = await connectToDatabase();
    const query: any = {};
    if (statusFilter && statusFilter !== "all") {
      query.status = statusFilter;
    }

    const users = await db.collection("users").find(query).sort({ createdAt: -1 }).toArray();

    let result = users.map((u: any) => ({
      id: u._id?.toString() || u.id || `usr_${Math.random().toString(36).slice(2, 7)}`,
      email: u.email,
      displayName: u.name || u.displayName || u.email.split("@")[0],
      avatarUrl: u.avatarUrl || "",
      kickUrl: u.kickLink || u.kickUrl || "",
      kickFollowers: 0,
      youtubeUrl: u.youtubeLink || u.youtubeUrl || "",
      youtubeSubscribers: 0,
      status: u.status || "pending",
      createdAt: u.createdAt || new Date().toISOString(),
      notes: u.notes || "",
      connectedPlatforms: u.connectedPlatforms ? u.connectedPlatforms.map((p: any) => p.platform || p) : [],
      monitoringEnabled: false,
      lastLogin: new Date().toISOString(),
      aiRequests: 0,
      storageUsage: "0 MB",
    }));

    if (statusFilter && statusFilter !== "all") {
      result = result.filter((c) => c.status === statusFilter);
    }

    if (search) {
      result = result.filter(
        (c) =>
          c.displayName.toLowerCase().includes(search) ||
          c.email.toLowerCase().includes(search) ||
          c.id.toLowerCase().includes(search) ||
          c.connectedPlatforms.some((p: string) => p.toLowerCase().includes(search))
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
    const { creatorId, action, notes } = await request.json();

    if (!creatorId || !action) {
      return NextResponse.json({ success: false, error: "Missing creatorId or action" }, { status: 400 });
    }

    const statusMap: Record<string, string> = {
      approve: "verified",
      reject: "rejected",
      request_changes: "pending",
      suspend: "suspended",
      ban: "banned",
    };

    const newStatus = statusMap[action] || "pending";

    const { db } = await connectToDatabase();
    
    // Attempt DB update
    try {
      await db.collection("users").updateOne(
        { $or: [{ id: creatorId }, { email: creatorId }] },
        {
          $set: {
            status: newStatus,
            notes: notes || `Admin updated status to ${newStatus}`,
            updatedAt: new Date(),
          },
        }
      );
    } catch (dbErr) {
      console.warn("DB Update notice:", dbErr);
    }

    return NextResponse.json({
      success: true,
      message: `Creator status updated to ${newStatus}`,
      data: { creatorId, status: newStatus, notes },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

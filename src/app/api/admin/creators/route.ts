import { NextRequest, NextResponse } from "next/server";
import { verifyAdminSession } from "@/lib/adminAuth";
import { connectToDatabase } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

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
      if (statusFilter === "pending") {
        query.$or = [
          { status: "pending" },
          { status: "unverified" },
          { status: { $exists: false } },
          { status: null },
        ];
      } else {
        query.status = statusFilter;
      }
    }

    const users = await db.collection("users").find(query).sort({ createdAt: -1 }).toArray();

    let result = users.map((u: any) => {
      const connected = Array.isArray(u.connectedPlatforms) ? u.connectedPlatforms : [];
      const kickItem = connected.find((p: any) => p.platform === "kick" || p.id === "kick");
      const ytItem = connected.find((p: any) => p.platform === "youtube" || p.id === "youtube");

      const kickUrl = u.kickLink || u.kickUrl || kickItem?.channelUrl || kickItem?.url || "";
      const youtubeUrl = u.youtubeLink || u.youtubeUrl || ytItem?.channelUrl || ytItem?.url || "";

      return {
        id: u._id?.toString() || u.id || `usr_${Math.random().toString(36).slice(2, 7)}`,
        email: u.email,
        displayName: u.name || u.displayName || u.email.split("@")[0],
        avatarUrl: u.avatarUrl || "",
        kickUrl,
        kickFollowers: 0,
        youtubeUrl,
        youtubeSubscribers: 0,
        status: (!u.status || u.status === "unverified") ? "pending" : u.status,
        createdAt: u.createdAt || new Date().toISOString(),
        notes: u.notes || "",
        connectedPlatforms: connected.map((p: any) => p.platform || p.id || p),
        monitoringEnabled: false,
        lastLogin: new Date().toISOString(),
        aiRequests: 0,
        storageUsage: "0 MB",
      };
    });

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
    
    // Attempt DB update using ObjectId fallback
    try {
      const matchCriteria: any[] = [{ id: creatorId }, { email: creatorId }];
      if (ObjectId.isValid(creatorId)) {
        matchCriteria.push({ _id: new ObjectId(creatorId) });
      }

      await db.collection("users").updateOne(
        { $or: matchCriteria },
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

import { NextRequest, NextResponse } from "next/server";
import { verifyAdminSession } from "@/lib/adminAuth";

export async function GET(request: NextRequest) {
  const auth = await verifyAdminSession(request);
  if (!auth.authorized) return auth.errorResponse!;

  const notifications: any[] = [];

  return NextResponse.json({
    success: true,
    data: {
      notifications,
      unreadCount: notifications.filter((n) => !n.read).length,
    },
  });
}

export async function POST(request: NextRequest) {
  const auth = await verifyAdminSession(request);
  if (!auth.authorized) return auth.errorResponse!;

  try {
    const { action, id } = await request.json();
    return NextResponse.json({
      success: true,
      message: `Notification action '${action}' applied to ${id || "all"}.`,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

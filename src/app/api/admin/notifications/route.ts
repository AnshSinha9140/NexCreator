import { NextRequest, NextResponse } from "next/server";
import { verifyAdminSession } from "@/lib/adminAuth";

export async function GET(request: NextRequest) {
  const auth = await verifyAdminSession(request);
  if (!auth.authorized) return auth.errorResponse!;

  const notifications = [
    {
      id: "notif_1",
      timestamp: new Date(Date.now() - 300000).toISOString(),
      severity: "Warning",
      title: "Gemini Rate Limited",
      message: "Gemini 1.5 Flash returned 429 status. Failover to Groq Llama 3 activated automatically.",
      read: false,
    },
    {
      id: "notif_2",
      timestamp: new Date(Date.now() - 900000).toISOString(),
      severity: "Info",
      title: "New Creator Verification",
      message: "Creator @xqc submitted channel verification request.",
      read: false,
    },
    {
      id: "notif_3",
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      severity: "Critical",
      title: "YouTube Scraper Fallback Enabled",
      message: "YouTube Data API quota reached 95% threshold. Switched to scraper fallback.",
      read: true,
    },
    {
      id: "notif_4",
      timestamp: new Date(Date.now() - 7200000).toISOString(),
      severity: "Info",
      title: "Monitoring Session Started",
      message: "Collector daemon initialized live stream session sess_live_1784820001.",
      read: true,
    },
  ];

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

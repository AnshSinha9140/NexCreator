import { NextRequest, NextResponse } from "next/server";
import { verifyAdminSession } from "@/lib/adminAuth";

export async function GET(request: NextRequest) {
  const auth = await verifyAdminSession(request);
  if (!auth.authorized) return auth.errorResponse!;

  const { searchParams } = new URL(request.url);
  const subsystem = searchParams.get("subsystem");
  const search = searchParams.get("search")?.toLowerCase();

  const logs = [
    {
      id: "log_1001",
      timestamp: new Date(Date.now() - 30000).toISOString(),
      level: "INFO",
      subsystem: "Collector",
      message: "Kick Pusher WebSocket heartbeat acknowledged for chatroom 45892",
      metadata: { chatroomId: "45892", latencyMs: 12 },
    },
    {
      id: "log_1002",
      timestamp: new Date(Date.now() - 75000).toISOString(),
      level: "INFO",
      subsystem: "Snapshots",
      message: "Snapshot #142 serialized with 150 messages and sent to worker queue",
      metadata: { snapshotId: "snap_101", messagesCount: 150 },
    },
    {
      id: "log_1003",
      timestamp: new Date(Date.now() - 120000).toISOString(),
      level: "INFO",
      subsystem: "AI Operations",
      message: "Gemini 1.5 Flash returned successful insight analysis in 245ms",
      metadata: { provider: "Gemini", tokens: 820, latencyMs: 245 },
    },
    {
      id: "log_1004",
      timestamp: new Date(Date.now() - 180000).toISOString(),
      level: "WARN",
      subsystem: "AI Operations",
      message: "Gemini response time exceeded 800ms threshold; triggering latency warning",
      metadata: { provider: "Gemini", latencyMs: 840 },
    },
    {
      id: "log_1005",
      timestamp: new Date(Date.now() - 300000).toISOString(),
      level: "INFO",
      subsystem: "Authentication",
      message: "Admin user admin@nexcreator.com authorized session token successfully",
      metadata: { email: "admin@nexcreator.com", role: "admin" },
    },
    {
      id: "log_1006",
      timestamp: new Date(Date.now() - 420000).toISOString(),
      level: "INFO",
      subsystem: "System",
      message: "MongoDB connection pool health check passed (12 active connections)",
      metadata: { connections: 12, poolSize: 20 },
    },
  ];

  let filtered = logs;

  if (subsystem && subsystem !== "all") {
    filtered = filtered.filter((l) => l.subsystem.toLowerCase() === subsystem.toLowerCase());
  }

  if (search) {
    filtered = filtered.filter(
      (l) =>
        l.message.toLowerCase().includes(search) ||
        l.subsystem.toLowerCase().includes(search) ||
        l.level.toLowerCase().includes(search)
    );
  }

  return NextResponse.json({ success: true, data: filtered });
}

import { NextRequest, NextResponse } from "next/server";
import { verifyAdminSession } from "@/lib/adminAuth";

export async function GET(request: NextRequest) {
  const auth = await verifyAdminSession(request);
  if (!auth.authorized) return auth.errorResponse!;

  const { searchParams } = new URL(request.url);
  const subsystem = searchParams.get("subsystem");
  const search = searchParams.get("search")?.toLowerCase();

  const logs: any[] = [];

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

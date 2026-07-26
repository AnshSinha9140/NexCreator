import { NextRequest, NextResponse } from "next/server";
import { verifyAdminSession } from "@/lib/adminAuth";

export async function GET(request: NextRequest) {
  const auth = await verifyAdminSession(request);
  if (!auth.authorized) return auth.errorResponse!;

  const { searchParams } = new URL(request.url);
  const providerFilter = searchParams.get("provider");
  const statusFilter = searchParams.get("status");

  const streamEvents: any[] = [];

  let filtered = streamEvents;
  if (providerFilter && providerFilter !== "all") {
    filtered = filtered.filter((e) => e.provider.toLowerCase().includes(providerFilter.toLowerCase()));
  }
  if (statusFilter && statusFilter !== "all") {
    filtered = filtered.filter((e) => e.status.toLowerCase() === statusFilter.toLowerCase());
  }

  return NextResponse.json({ success: true, data: filtered });
}

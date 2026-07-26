import { NextRequest, NextResponse } from "next/server";
import { verifyAdminSession } from "@/lib/adminAuth";
import { AdminAggregationService } from "@/lib/admin/adminAggregation";

export async function GET(request: NextRequest) {
  const auth = await verifyAdminSession(request);
  if (!auth.authorized) return auth.errorResponse!;

  const { searchParams } = new URL(request.url);
  const subsystem = searchParams.get("subsystem") || undefined;
  const search = searchParams.get("search") || undefined;

  try {
    const logs = await AdminAggregationService.getLogEntries({
      subsystem,
      search,
      limit: 500,
    });

    return NextResponse.json({ success: true, data: logs });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

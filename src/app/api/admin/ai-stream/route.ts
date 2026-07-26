import { NextRequest, NextResponse } from "next/server";
import { verifyAdminSession } from "@/lib/adminAuth";
import { AdminAggregationService } from "@/lib/admin/adminAggregation";

export async function GET(request: NextRequest) {
  const auth = await verifyAdminSession(request);
  if (!auth.authorized) return auth.errorResponse!;

  const { searchParams } = new URL(request.url);
  const providerFilter = searchParams.get("provider") || undefined;
  const statusFilter = searchParams.get("status") || undefined;
  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = parseInt(searchParams.get("limit") || "200", 10);

  try {
    const streamEvents = await AdminAggregationService.getAIStreamRows({
      provider: providerFilter,
      status: statusFilter,
      page,
      limit,
    });

    return NextResponse.json({ success: true, data: streamEvents });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

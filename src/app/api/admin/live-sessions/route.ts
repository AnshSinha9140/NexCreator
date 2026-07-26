import { NextRequest, NextResponse } from "next/server";
import { verifyAdminSession } from "@/lib/adminAuth";
import { AdminAggregationService } from "@/lib/admin/adminAggregation";

export async function GET(request: NextRequest) {
  const auth = await verifyAdminSession(request);
  if (!auth.authorized) return auth.errorResponse!;

  try {
    const { searchParams } = new URL(request.url);
    const mode = (searchParams.get("mode") as "live" | "history" | "all") || "all";

    const aggregatedSessions = await AdminAggregationService.getLiveSessionsWithMetadata(mode);

    return NextResponse.json({
      success: true,
      data: aggregatedSessions,
      totalCount: aggregatedSessions.length,
    });
  } catch (error: any) {
    console.error("[API] Error fetching admin live sessions:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

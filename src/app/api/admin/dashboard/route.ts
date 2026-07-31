import { NextRequest, NextResponse } from "next/server";
import { verifyAdminSession } from "@/lib/adminAuth";
import { AdminDashboardBuilder } from "@/lib/admin/dashboardBuilder";

export async function GET(request: NextRequest) {
  const auth = await verifyAdminSession(request);
  if (!auth.authorized) return auth.errorResponse!;

  try {
    const bundle = await AdminDashboardBuilder.build();

    return NextResponse.json({
      success: true,
      status: bundle.metadata.isPartial ? "degraded" : "healthy",
      data: bundle,
    });
  } catch (error: any) {
    // Graceful error payload - dashboard continues functioning with partial status
    return NextResponse.json({
      success: false,
      status: "unreachable",
      error: error.message || "Failed to build admin dashboard bundle",
      data: null,
    }, { status: 200 }); // Return 200 so UI receives error status gracefully instead of breaking
  }
}

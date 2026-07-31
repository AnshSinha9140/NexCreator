import { NextRequest, NextResponse } from "next/server";
import { verifyAdminSession } from "@/lib/adminAuth";
import { MonitoringDashboardBuilder } from "@/lib/admin/monitoring/monitoringDashboardBuilder";

export async function GET(request: NextRequest) {
  const auth = await verifyAdminSession(request);
  if (!auth.authorized) return auth.errorResponse!;

  try {
    const bundle = await MonitoringDashboardBuilder.build();
    return NextResponse.json({
      success: true,
      data: bundle,
    });
  } catch (error: any) {
    console.error("[API] GET /api/admin/monitoring error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to generate canonical monitoring bundle" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { verifyAdminSession } from "@/lib/adminAuth";

export async function GET(request: NextRequest) {
  const auth = await verifyAdminSession(request);
  if (!auth.authorized) return auth.errorResponse!;

  const subsystems: any[] = [];
  const overallHealthScore = 0; // Percentage

  return NextResponse.json({
    success: true,
    data: {
      overallHealthScore,
      subsystems,
      lastCheckedAt: new Date().toISOString(),
    },
  });
}

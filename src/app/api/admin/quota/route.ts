import { NextRequest, NextResponse } from "next/server";
import { verifyAdminSession } from "@/lib/adminAuth";
import { QuotaPlannerBuilder } from "@/lib/admin/quota/quotaPlannerBuilder";

export async function GET(request: NextRequest) {
  const auth = await verifyAdminSession(request);
  if (!auth.authorized) return auth.errorResponse!;

  try {
    const bundle = await QuotaPlannerBuilder.build();
    return NextResponse.json({
      success: true,
      data: bundle,
    });
  } catch (error: any) {
    console.error("[API] GET /api/admin/quota error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to generate canonical quota forecast" },
      { status: 500 }
    );
  }
}

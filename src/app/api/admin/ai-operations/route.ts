import { NextRequest, NextResponse } from "next/server";
import { verifyAdminSession } from "@/lib/adminAuth";
import { AIOperationsBuilder } from "@/lib/admin/aiOperationsBuilder";

export async function GET(request: NextRequest) {
  const auth = await verifyAdminSession(request);
  if (!auth.authorized) return auth.errorResponse!;

  try {
    const bundle = await AIOperationsBuilder.build();

    return NextResponse.json({
      success: true,
      data: bundle,
    });
  } catch (error: any) {
    console.error("[API] Error generating AI Operations bundle:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

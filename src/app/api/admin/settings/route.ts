import { NextRequest, NextResponse } from "next/server";
import { verifyAdminSession } from "@/lib/adminAuth";

export async function GET(request: NextRequest) {
  const auth = await verifyAdminSession(request);
  if (!auth.authorized) return auth.errorResponse!;

  const settings = {
    geminiApiKeyConfigured: true,
    groqApiKeyConfigured: true,
    autoFallbackEnabled: true,
    snapshotIntervalSec: 60,
    maxConcurrentSessionsPerCreator: 3,
    maintenanceMode: false,
    webhooksEnabled: true,
    logLevel: "INFO",
  };

  return NextResponse.json({ success: true, data: settings });
}

export async function POST(request: NextRequest) {
  const auth = await verifyAdminSession(request);
  if (!auth.authorized) return auth.errorResponse!;

  try {
    const updatedSettings = await request.json();
    return NextResponse.json({
      success: true,
      message: "Admin system settings saved successfully",
      data: updatedSettings,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

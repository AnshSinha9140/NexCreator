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
      data: {
        currentSession: bundle.runtimeSession.isActive ? bundle.runtimeSession : null,
        collectorState: bundle.collector,
        runtimeBufferSize: bundle.rollingBuffer.currentBufferSize,
        todaysHistoricalMessages: bundle.historicalToday.messagesProcessedToday,
        snapshotsToday: bundle.historicalToday.snapshotsCompletedToday,
        runtimeMessagesPerSec: bundle.collector.messagesPerSec,
        pollingOwner: "AdminProvider",
        activePollers: 1,
        lastRefresh: bundle.metadata.generatedAt,
        builderTimeMs: bundle.metadata.buildDurationMs,
        warnings: bundle.validation.inconsistencies,
        errors: bundle.validation.reasons,
      },
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message || "Failed to query monitoring diagnostics",
    }, { status: 200 }); // Return 200 with error payload instead of 500
  }
}

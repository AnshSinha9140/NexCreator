import { NextRequest, NextResponse } from "next/server";
import { verifyAdminSession } from "@/lib/adminAuth";
import { MonitoringDashboardBuilder } from "@/lib/admin/monitoring/monitoringDashboardBuilder";

export async function GET(request: NextRequest) {
  const auth = await verifyAdminSession(request);
  if (!auth.authorized) return auth.errorResponse!;

  try {
    const bundle = await MonitoringDashboardBuilder.build();
    const pipe = bundle.runtimePipeline;
    const trans = pipe.transportState;
    const diag = pipe.collectorDiagnostics;

    return NextResponse.json({
      success: true,
      data: {
        runtimeState: pipe.phase,
        transportState: trans?.state || "STOPPED",
        provider: trans?.provider || "Disconnected",
        readyState: trans?.readyState ?? 3,
        heartbeatAge: trans?.heartbeatAgeSec || 0,
        socketAge: trans?.socketAgeSec || 0,
        connectionAge: Math.floor((pipe.connectionHistory?.connectionAgeMs || 0) / 1000),
        lastHeartbeat: trans?.lastHeartbeatAt || null,
        lastMessage: trans?.lastMessageAt || null,
        reconnectAttempts: trans?.reconnectAttempts || 0,
        reconnectSuccesses: trans?.reconnectSuccesses || 0,
        disconnectReason: trans?.disconnectReason || null,
        disconnectCode: trans?.disconnectCode || null,
        runtimeTimeline: pipe.timelineSteps,
        diagnostics: diag,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to query runtime transport diagnostics",
      },
      { status: 200 }
    );
  }
}

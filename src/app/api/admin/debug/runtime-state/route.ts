import { NextRequest, NextResponse } from "next/server";
import { verifyAdminSession } from "@/lib/adminAuth";
import { MonitoringDashboardBuilder } from "@/lib/admin/monitoring/monitoringDashboardBuilder";

export async function GET(request: NextRequest) {
  const auth = await verifyAdminSession(request);
  if (!auth.authorized) return auth.errorResponse!;

  try {
    const bundle = await MonitoringDashboardBuilder.build();
    const pipe = bundle.runtimePipeline;

    return NextResponse.json({
      success: true,
      data: {
        currentRuntimePhase: pipe.phase,
        previousRuntimePhase: pipe.previousPhase || "NONE",
        transitionReason: pipe.transitionReason,
        transitionTimestamp: pipe.transitionTimestamp,
        currentTransition: `Phase ${pipe.phase} (${pipe.explanation})`,
        pipelineHealth: pipe.health,
        reason: pipe.reason,
        impact: pipe.impact,
        recoveryAction: pipe.recoveryAction,
        collectorHistory: pipe.connectionHistory,
        sessionAgeMs: pipe.connectionHistory?.connectionAgeMs || 0,
        recoveryAttempts: pipe.connectionHistory?.reconnectAttempts || 0,
        validationErrors: bundle.validation.inconsistencies,
        synchronizationChecks: bundle.validation.reasons,
        lastTransitionTime: pipe.lastTransition,
        currentRuntimeAgeMs: Math.max(0, Date.now() - new Date(pipe.lastTransition).getTime()),
        blockingComponent: pipe.blockingComponent || null,
        recoverySuggestion: pipe.recoverySuggestion || null,
        timelineSteps: pipe.timelineSteps,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to query runtime state diagnostics",
      },
      { status: 200 }
    );
  }
}

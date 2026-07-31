import { NextRequest, NextResponse } from "next/server";
import { verifyAdminSession } from "@/lib/adminAuth";
import { AdminDashboardBuilder } from "@/lib/admin/dashboardBuilder";
import { AdminDebugDiagnostics } from "@/types/adminDashboard";

export async function GET(request: NextRequest) {
  const auth = await verifyAdminSession(request);
  if (!auth.authorized) return auth.errorResponse!;

  const startMs = Date.now();
  try {
    const bundle = await AdminDashboardBuilder.build();
    const refreshDurationMs = Date.now() - startMs;
    const bundleJson = JSON.stringify(bundle);
    const bundleSizeBytes = new Blob([bundleJson]).size;

    const diagnostics: AdminDebugDiagnostics = {
      buildTimeMs: bundle.metadata.buildDurationMs,
      queryCount: Object.keys(bundle.mongodb.collections).length * 2,
      collectionsQueried: Object.keys(bundle.mongodb.collections),
      bundleSizeBytes,
      pollingStatus: "active",
      refreshDurationMs,
      mongoDbStatus: bundle.mongodb.status,
      collectorStatus: bundle.collectors.status,
      workerStatus: bundle.workers.status,
      queueStatus: "Healthy",
      errors: bundle.metadata.errors || [],
      warnings: bundle.systemHealth.explanations.filter((e) => e.includes("Degraded") || e.includes("Warning")),
      cacheStatus: "fresh",
      lastRefreshTimestamp: bundle.metadata.generatedAt,
    };

    return NextResponse.json({
      success: true,
      diagnostics,
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message || "Failed to generate dashboard engineering diagnostics",
    }, { status: 500 });
  }
}

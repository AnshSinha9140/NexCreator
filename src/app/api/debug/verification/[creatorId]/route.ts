import { NextRequest, NextResponse } from "next/server";
import { getCreatorHydration } from "@/lib/creatorAudit/persistence";

export const dynamic = "force-dynamic";

/**
 * GET /api/debug/verification/:creatorId
 *
 * Sprint 20.6 — Verification Debug Endpoint
 * Admin-accessible, no auth required (debug only — remove auth guard if needed for internal tooling).
 *
 * Returns full verification diagnostics:
 * - User document summary
 * - Verification status
 * - Which of the 4 intelligence collections exist
 * - Missing documents list
 * - Hydration readiness
 * - Canonical creator ID mapping
 */
export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ creatorId: string }> }
) {
  try {
    const { creatorId } = await context.params;

    if (!creatorId) {
      return NextResponse.json({ error: "creatorId param is required" }, { status: 400 });
    }

    const hydration = await getCreatorHydration(creatorId);
    const creator = hydration.creator as any;
    const profile = hydration.profile as any;
    const memory = hydration.relationshipMemory as any;
    const history = hydration.creatorHistory as any[];
    const onboarding = hydration.onboardingState as any;

    return NextResponse.json({
      // User document summary
      user: creator
        ? {
            _id: creator._id?.toString(),
            email: creator.email,
            status: creator.status,
            onboardingCompleted: creator.onboardingCompleted,
            verifiedAt: creator.verifiedAt,
            moderatedBy: creator.moderatedBy,
            createdAt: creator.createdAt,
          }
        : null,

      // Canonical ID (always users._id)
      canonicalCreatorId: hydration.canonicalCreatorId,
      requestedCreatorId: creatorId,

      // Verification status
      verificationStatus: creator?.status ?? "not_found",

      // Collection presence checks
      creatorProfileExists: !!profile,
      relationshipMemoryExists: !!memory,
      creatorHistoryExists: (history?.length ?? 0) > 0,
      onboardingStateExists: !!onboarding,

      // Collection IDs (for cross-reference)
      creatorIds: {
        creator_profile: profile?.creatorId ?? null,
        relationship_memory: memory?.creatorId ?? null,
        creator_history: history?.[0]?.creatorId ?? null,
        onboarding_state: onboarding?.creatorId ?? null,
      },

      // Missing documents
      missingDocuments: hydration.diagnostics.missingCollections,

      // Hydration readiness
      hydrationReady: hydration.diagnostics.hydrationReady,
      diagnosticMessage: hydration.diagnostics.diagnosticMessage,

      // Onboarding state detail
      onboarding: onboarding
        ? {
            completed: onboarding.completed,
            currentStep: onboarding.currentStep,
            completedAt: onboarding.completedAt,
          }
        : null,

      // First creator history event
      firstHistoryEvent: history?.[history.length - 1] ?? null,

      // Full diagnostics
      diagnostics: hydration.diagnostics,
    });
  } catch (error: any) {
    console.error("[DEBUG] Verification check failed:", error.message);
    return NextResponse.json(
      { error: error.message || "Debug endpoint error" },
      { status: 500 }
    );
  }
}

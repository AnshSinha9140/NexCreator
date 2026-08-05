import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifySessionToken } from "@/lib/session";
import { getCreatorHydration, completeCreatorOnboarding, resolveCreator } from "@/lib/creatorAudit/persistence";

export const dynamic = "force-dynamic";

/**
 * GET /api/creator/hydration
 *
 * Sprint 20.6 — Loud hydration failure.
 *
 * Returns 200 with hydrationReady=true only when ALL 4 intelligence collections exist.
 * Returns 503 with HydrationDiagnostics JSON when any collection is missing.
 * NEVER silently falls back to null profile.
 */
export async function GET() {
  const token = (await cookies()).get("auth_session")?.value;
  const auth = token ? await verifySessionToken(token) : null;
  if (!auth) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const lookupId = auth.userId || auth.email;
  const hydration = await getCreatorHydration(lookupId);

  // Creator not found at all
  if (!hydration.creator) {
    return NextResponse.json(
      { success: false, error: "Creator not found", diagnostics: hydration.diagnostics },
      { status: 404 }
    );
  }

  // Hydration incomplete — fail loudly with diagnostics
  if (!hydration.diagnostics.hydrationReady) {
    return NextResponse.json(
      {
        success: false,
        hydrationReady: false,
        error: "Hydration Failed",
        diagnostics: hydration.diagnostics,
        missingCollections: hydration.diagnostics.missingCollections,
        message:
          `Creator Intelligence is incomplete. Missing: ${hydration.diagnostics.missingCollections.join(", ")}. ` +
          `Contact admin to complete the Deep Research verification pipeline.`,
      },
      { status: 503 }
    );
  }

  // Full hydration — all collections present
  const profile = hydration.profile as any;
  const onboardingState = hydration.onboardingState as any;

  return NextResponse.json({
    success: true,
    hydrationReady: true,
    creator: hydration.creator,
    profile: hydration.profile,
    relationshipMemory: hydration.relationshipMemory,
    creatorHistory: hydration.creatorHistory,
    onboardingState: hydration.onboardingState,
    knowledgeGraph: hydration.knowledgeGraph,
    creatorDNA: hydration.creatorDNA,
    creatorMission: hydration.creatorMission,
    completedSessionsCount: hydration.completedSessionsCount,
    canonicalCreatorId: hydration.canonicalCreatorId,
    diagnostics: hydration.diagnostics,
    // Convenience flags for the dashboard
    onboardingCompleted: onboardingState?.completed ?? profile?.onboardingCompleted ?? false,
    dashboardHydrated: true,
  });
}

/**
 * PATCH /api/creator/hydration
 *
 * Mark onboarding as completed.
 * Persists to: onboarding_state, creator_profile, users, creator_history.
 */
export async function PATCH() {
  const token = (await cookies()).get("auth_session")?.value;
  const auth = token ? await verifySessionToken(token) : null;
  if (!auth) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const lookupId = auth.userId || auth.email;
  const { creator, canonicalCreatorId } = await resolveCreator(lookupId);

  if (!creator || !canonicalCreatorId) {
    return NextResponse.json({ success: false, error: "Creator not found" }, { status: 404 });
  }

  await completeCreatorOnboarding(canonicalCreatorId);

  return NextResponse.json({ success: true, onboardingCompleted: true });
}

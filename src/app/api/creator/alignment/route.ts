import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifySessionToken } from "@/lib/session";
import { resolveCreator, saveCreatorAlignmentState, mergeCreatorAlignment } from "@/lib/creatorAudit/persistence";

export const dynamic = "force-dynamic";

/**
 * GET /api/creator/alignment
 * Fetch the current state of alignment session from onboarding_state.
 */
export async function GET() {
  const token = (await cookies()).get("auth_session")?.value;
  const auth = token ? await verifySessionToken(token) : null;
  if (!auth) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const lookupId = auth.userId || auth.email;
  const { creator, canonicalCreatorId, db } = await resolveCreator(lookupId);

  if (!creator || !canonicalCreatorId) {
    return NextResponse.json({ success: false, error: "Creator not found" }, { status: 404 });
  }

  const onboardingState = await db.collection("onboarding_state").findOne({ creatorId: canonicalCreatorId });

  return NextResponse.json({
    success: true,
    currentStep: onboardingState?.currentStep ?? 0,
    answers: onboardingState?.alignmentAnswers ?? {
      hypothesesAnswers: {},
      reflectionAnswers: {},
      challengeAnswers: {},
      sharedUnderstandingAnswer: null,
      agreementAccepted: false,
    },
  });
}

/**
 * POST /api/creator/alignment
 * Save step-by-step progress or complete the alignment session.
 */
export async function POST(request: NextRequest) {
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

  try {
    const { currentStep, answers, complete } = await request.json();

    if (complete) {
      // Merge answers into Knowledge Graph, finalize verification status
      await mergeCreatorAlignment(canonicalCreatorId, answers);
      return NextResponse.json({ success: true, completed: true });
    } else {
      // Save progress so user can resume later
      await saveCreatorAlignmentState(canonicalCreatorId, currentStep, answers);
      return NextResponse.json({ success: true, saved: true });
    }
  } catch (error: any) {
    console.error("[API] Creator alignment post error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

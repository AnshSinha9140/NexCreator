import { NextRequest, NextResponse } from "next/server";
import { verifyAdminSession } from "@/lib/adminAuth";
import { approveCreatorPartnership } from "@/lib/creatorAudit/persistence";

/**
 * POST /api/admin/creators/[creatorId]/intelligence
 *
 * Sprint 20.6 — Atomic verification endpoint.
 * Accepts: { audit, researchConfidence? }
 * Executes ONE Mongo transaction: 5 writes or 0 writes.
 * Returns a full verification receipt on success.
 * Returns 409 with error message on any failure — NEVER partially succeeds.
 */
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ creatorId: string }> }
) {
  const auth = await verifyAdminSession(request);
  if (!auth.authorized) return auth.errorResponse!;

  const adminEmail = auth.user?.email || "admin@nexcreator.com";

  try {
    const { creatorId } = await context.params;
    const body = await request.json();

    const { audit, researchConfidence } = body;

    if (!audit) {
      return NextResponse.json(
        { success: false, error: "Missing audit object in request body." },
        { status: 400 }
      );
    }

    // Validate minimum required audit fields
    if (!audit.executiveLetter || !audit.creatorIdentity || !audit.audiencePsychology) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Audit is missing required fields: executiveLetter, creatorIdentity, audiencePsychology. " +
            "Verify the CreatorManagerProfile JSON is complete before approving.",
        },
        { status: 400 }
      );
    }

    // Execute atomic 5-write transaction
    const saved = await approveCreatorPartnership(
      creatorId,
      audit,
      adminEmail,
      typeof researchConfidence === "number" ? researchConfidence : undefined
    );

    return NextResponse.json({
      success: true,
      status: "verified",
      creatorId: saved.canonicalCreatorId,
      profile: saved.profile,
      verificationReceipt: {
        canonicalCreatorId: saved.canonicalCreatorId,
        verifiedBy: adminEmail,
        verifiedAt: new Date().toISOString(),
        researchConfidence: researchConfidence ?? null,
        auditVersion: "20.6",
        collectionsWritten: [
          "users",
          "creator_profile",
          "relationship_memory",
          "creator_history",
          "onboarding_state",
        ],
      },
    });
  } catch (error: any) {
    console.error("[API] Creator intelligence persistence failed:", error.message);
    return NextResponse.json(
      {
        success: false,
        error:
          error.message ||
          "Verification failed. Creator Intelligence could not be saved. The creator remains PENDING.",
      },
      { status: 409 }
    );
  }
}

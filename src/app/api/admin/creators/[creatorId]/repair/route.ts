import { NextRequest, NextResponse } from "next/server";
import { verifyAdminSession } from "@/lib/adminAuth";
import { getCreatorHydration, resolveCreator } from "@/lib/creatorAudit/persistence";
import { connectToDatabase } from "@/lib/mongodb";

export const dynamic = "force-dynamic";

/**
 * POST /api/admin/creators/[creatorId]/repair
 *
 * Sprint 20.6 — Backfill Repair Endpoint
 *
 * For creators who were verified before Sprint 20.6 (via the old bypass path),
 * this endpoint initializes any MISSING intelligence collections without
 * touching documents that already exist.
 *
 * Safe to call multiple times (all writes use upsert / $setOnInsert).
 * Does NOT require re-running the Deep Research pipeline.
 * Does NOT overwrite existing creator_profile data.
 *
 * What it writes (only if missing):
 *   - relationship_memory  (initialized empty scaffolding)
 *   - creator_history      (first event: "Creator Verified (Repair)")
 *   - onboarding_state     (completed=false, currentStep=0)
 *
 * It does NOT create creator_profile — that requires the full audit JSON
 * from the Deep Research pipeline. If creator_profile is missing, the
 * response will instruct the admin to run Deep Research.
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
    const { db, creator, canonicalCreatorId } = await resolveCreator(creatorId);

    if (!creator || !canonicalCreatorId) {
      return NextResponse.json(
        { success: false, error: "Creator not found in users collection." },
        { status: 404 }
      );
    }

    if (creator.status !== "verified") {
      return NextResponse.json(
        {
          success: false,
          error: `Creator status is '${creator.status}', not 'verified'. Only verified creators need repair.`,
        },
        { status: 400 }
      );
    }

    // Check what already exists
    const [existingProfile, existingMemory, existingHistory, existingOnboarding] =
      await Promise.all([
        db.collection("creator_profile").findOne({ creatorId: canonicalCreatorId }),
        db.collection("relationship_memory").findOne({ creatorId: canonicalCreatorId }),
        db.collection("creator_history").findOne({ creatorId: canonicalCreatorId }),
        db.collection("onboarding_state").findOne({ creatorId: canonicalCreatorId }),
      ]);

    const now = new Date();
    const repaired: string[] = [];
    const alreadyExisted: string[] = [];
    const requiresDeepResearch: string[] = [];

    // creator_profile CANNOT be auto-created — requires full audit JSON
    if (!existingProfile) {
      requiresDeepResearch.push("creator_profile");
    } else {
      alreadyExisted.push("creator_profile");
    }

    // relationship_memory — initialize if missing
    if (!existingMemory) {
      await db.collection("relationship_memory").updateOne(
        { creatorId: canonicalCreatorId },
        {
          $setOnInsert: {
            creatorId: canonicalCreatorId,
            firstConversationDate: now.toISOString(),
            growthJournal: [],
            milestones: [],
            creatorHabits: [],
            recurringStrengths: [],
            recurringWeaknesses: [],
            managerNotes: [],
            adviceHistory: [],
            storyTimeline: [],
            createdAt: now,
            updatedAt: now,
          },
        },
        { upsert: true }
      );
      repaired.push("relationship_memory");
    } else {
      alreadyExisted.push("relationship_memory");
    }

    // creator_history — add repair event if no events exist
    if (!existingHistory) {
      await db.collection("creator_history").insertOne({
        creatorId: canonicalCreatorId,
        eventType: "Creator Verified (Repair)",
        timestamp: now.toISOString(),
        verifiedBy: adminEmail,
        researchConfidence: null,
        auditVersion: "20.6-repair",
        metadata: { repairedAt: now.toISOString(), repairNote: "Backfilled by Sprint 20.6 repair endpoint" },
      });
      repaired.push("creator_history");
    } else {
      alreadyExisted.push("creator_history");
    }

    // onboarding_state — initialize if missing
    if (!existingOnboarding) {
      await db.collection("onboarding_state").updateOne(
        { creatorId: canonicalCreatorId },
        {
          $setOnInsert: {
            creatorId: canonicalCreatorId,
            completed: false,
            currentStep: 0,
            completedAt: null,
            createdAt: now.toISOString(),
            updatedAt: now.toISOString(),
          },
        },
        { upsert: true }
      );
      repaired.push("onboarding_state");
    } else {
      alreadyExisted.push("onboarding_state");
    }

    // creator_knowledge_graph — build if missing and onboarding is complete
    const existingKnowledgeGraph = await db.collection("creator_knowledge_graph").findOne({ creatorId: canonicalCreatorId });
    const onboardingDone = existingOnboarding?.completed || existingProfile?.onboardingCompleted;
    
    // Extract actual alignment answers if available
    const alignmentAnswers = existingOnboarding?.alignmentAnswers || existingProfile?.alignmentSession?.answers || {
      hypothesesAnswers: {},
      reflectionAnswers: {},
      challengeAnswers: {},
    };

    if (existingProfile && onboardingDone && !existingKnowledgeGraph) {
      const { buildInitialKnowledgeGraph } = require("@/lib/creatorKnowledge/knowledgeBuilder");
      const fullKnowledgeGraph = buildInitialKnowledgeGraph(canonicalCreatorId, existingProfile.audit, alignmentAnswers);
      await db.collection("creator_knowledge_graph").updateOne(
        { creatorId: canonicalCreatorId },
        { $set: fullKnowledgeGraph },
        { upsert: true }
      );
      repaired.push("creator_knowledge_graph");
    } else if (existingKnowledgeGraph) {
      alreadyExisted.push("creator_knowledge_graph");
    }

    // creator_mission — build if missing and onboarding is complete
    const existingMission = await db.collection("creator_mission").findOne({ creatorId: canonicalCreatorId });
    if (existingProfile && onboardingDone && !existingMission) {
      const { buildInitialCreatorMission } = require("@/lib/creatorMission/missionBuilder");
      const fullMission = buildInitialCreatorMission(canonicalCreatorId, existingProfile.audit, alignmentAnswers);
      await db.collection("creator_mission").updateOne(
        { creatorId: canonicalCreatorId },
        { $set: fullMission },
        { upsert: true }
      );
      repaired.push("creator_mission");
    } else if (existingMission) {
      alreadyExisted.push("creator_mission");
    }

    // Re-check hydration after repair
    const postRepair = await getCreatorHydration(creatorId);

    return NextResponse.json({
      success: true,
      canonicalCreatorId,
      repaired,
      alreadyExisted,
      requiresDeepResearch,
      hydrationReady: postRepair.diagnostics.hydrationReady,
      missingAfterRepair: postRepair.diagnostics.missingCollections,
      message:
        requiresDeepResearch.length > 0
          ? `Repair partial. ${repaired.length} collection(s) initialized. ` +
            `creator_profile still missing — run the Deep Research pipeline (🔬) for this creator to complete verification.`
          : `Repair complete. All ${repaired.length + alreadyExisted.length} intelligence collections confirmed.`,
    });
  } catch (error: any) {
    console.error("[REPAIR] Creator intelligence repair failed:", error.message);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

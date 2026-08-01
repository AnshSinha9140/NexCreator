/**
 * Sprint 20.6 — Atomic Creator Verification Persistence
 *
 * SINGLE SOURCE OF TRUTH: MongoDB only.
 * creatorId on ALL documents = users._id.toString() — NEVER email, username, or session ID.
 *
 * approveCreatorPartnership() executes ONE atomic Mongo transaction.
 * If ANY write fails the entire transaction aborts.
 * Verification can NEVER partially succeed.
 *
 * Collections written (in order):
 *   1. users           — status=verified, onboardingCompleted=false
 *   2. creator_profile — full audit intelligence
 *   3. relationship_memory — initialized scaffolding
 *   4. creator_history — first event: Creator Verified
 *   5. onboarding_state — completed=false, currentStep=0
 */

import { ObjectId } from "mongodb";
import { connectToDatabase } from "@/lib/mongodb";
import {
  CreatorIntelligenceAudit,
  CreatorManagerProfile,
  CreatorHistoryEvent,
  OnboardingState,
  RelationshipMemory,
  HydrationDiagnostics,
} from "./types";

// ---------------------------------------------------------------------------
// Creator resolution — multi-key lookup by _id, email, or string id
// ---------------------------------------------------------------------------

export const creatorQuery = (creatorId: string) => {
  const criteria: Record<string, unknown>[] = [{ id: creatorId }, { email: creatorId.toLowerCase() }];
  if (ObjectId.isValid(creatorId)) criteria.push({ _id: new ObjectId(creatorId) });
  return { $or: criteria };
};

export async function resolveCreator(creatorId: string) {
  const { db } = await connectToDatabase();
  const creator = await db.collection("users").findOne(creatorQuery(creatorId));
  // canonical ID is ALWAYS users._id — never fallback to a string id or email
  const canonicalCreatorId = creator?._id?.toString() ?? null;
  return { db, creator, canonicalCreatorId };
}

// ---------------------------------------------------------------------------
// Approval Options
// ---------------------------------------------------------------------------

export interface ApprovalOptions {
  researchConfidence?: number; // 0-100 from Evidence JSON v2.0
  adminEmail: string;
}

// ---------------------------------------------------------------------------
// MAIN: Atomic Verification Transaction
// ---------------------------------------------------------------------------

export async function approveCreatorPartnership(
  creatorId: string,
  audit: CreatorIntelligenceAudit,
  adminEmail: string,
  researchConfidence?: number
): Promise<{ profile: CreatorManagerProfile; canonicalCreatorId: string }> {
  const { client, db } = await connectToDatabase();

  // Pre-flight: creator MUST exist in users collection
  const creator = await db.collection("users").findOne(creatorQuery(creatorId));
  if (!creator) {
    throw new Error("Creator not found in users collection. Refusing to create orphaned intelligence profile.");
  }

  const canonicalCreatorId = creator._id.toString();
  const now = new Date();

  const profile: CreatorManagerProfile = {
    creatorId: canonicalCreatorId,
    audit: { ...audit, creatorId: canonicalCreatorId },
    onboardingCompleted: false,
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
  };

  const relationshipMemory: Omit<RelationshipMemory, "_id"> = {
    creatorId: canonicalCreatorId,
    firstConversationDate: now.toISOString(),
    growthJournal: [],
    milestones: [],
    creatorHabits: [],
    recurringStrengths: audit.strengthsAndWeaknesses?.strengths?.map((s) => s.title) ?? [],
    recurringWeaknesses: audit.strengthsAndWeaknesses?.weaknesses?.map((w) => w.title) ?? [],
    managerNotes: [],
    adviceHistory: [],
    storyTimeline: [],
    createdAt: now,
    updatedAt: now,
  };

  const historyEvent: Omit<CreatorHistoryEvent, "_id"> = {
    creatorId: canonicalCreatorId,
    eventType: "Creator Verified",
    timestamp: now.toISOString(),
    verifiedBy: adminEmail,
    researchConfidence: researchConfidence ?? null,
    auditVersion: "20.6",
    metadata: { auditId: audit.auditId, creatorName: audit.creatorName },
  };

  const onboardingState: Omit<OnboardingState, "_id"> = {
    creatorId: canonicalCreatorId,
    completed: false,
    currentStep: 0,
    completedAt: null,
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
  };

  const session = client.startSession();

  try {
    await session.withTransaction(async () => {
      // ---------------------------------------------------------------
      // Write 1: Update users — status = verified
      // ---------------------------------------------------------------
      const userResult = await db.collection("users").updateOne(
        { _id: creator._id },
        {
          $set: {
            status: "verified",
            onboardingCompleted: false,
            verifiedAt: now,
            updatedAt: now,
            moderatedBy: adminEmail,
          },
        },
        { session }
      );
      if (userResult.matchedCount === 0) {
        throw new Error("Transaction abort: users.updateOne matched 0 documents.");
      }

      // Destructure profile to separate createdAt so we don't try to both $set and $setOnInsert it
      const { createdAt: profileCreatedAt, ...profileRest } = profile;

      await db.collection("creator_profile").updateOne(
        { creatorId: canonicalCreatorId },
        {
          $set: { ...profileRest, updatedAt: now.toISOString() },
          $setOnInsert: { createdAt: profileCreatedAt || now.toISOString() },
        },
        { upsert: true, session }
      );

      // ---------------------------------------------------------------
      // Write 3: Upsert relationship_memory
      // ---------------------------------------------------------------
      await db.collection("relationship_memory").updateOne(
        { creatorId: canonicalCreatorId },
        {
          $setOnInsert: relationshipMemory,
        },
        { upsert: true, session }
      );

      // ---------------------------------------------------------------
      // Write 4: Insert creator_history (first event)
      // ---------------------------------------------------------------
      await db.collection("creator_history").insertOne(historyEvent, { session });

      // ---------------------------------------------------------------
      // Write 5: Upsert onboarding_state
      // ---------------------------------------------------------------
      await db.collection("onboarding_state").updateOne(
        { creatorId: canonicalCreatorId },
        {
          $setOnInsert: onboardingState,
        },
        { upsert: true, session }
      );

      // ---------------------------------------------------------------
      // Durability verification — read back all 4 intelligence documents
      // If any are missing, throw to abort the transaction
      // ---------------------------------------------------------------
      const [savedProfile, savedMemory, savedHistory, savedOnboarding] = await Promise.all([
        db.collection("creator_profile").findOne({ creatorId: canonicalCreatorId }, { session }),
        db.collection("relationship_memory").findOne({ creatorId: canonicalCreatorId }, { session }),
        db.collection("creator_history").findOne({ creatorId: canonicalCreatorId }, { session }),
        db.collection("onboarding_state").findOne({ creatorId: canonicalCreatorId }, { session }),
      ]);

      const missing: string[] = [];
      if (!savedProfile) missing.push("creator_profile");
      if (!savedMemory) missing.push("relationship_memory");
      if (!savedHistory) missing.push("creator_history");
      if (!savedOnboarding) missing.push("onboarding_state");

      if (missing.length > 0) {
        throw new Error(
          `Transaction abort: durability check failed. Missing after write: ${missing.join(", ")}.`
        );
      }
    });
  } finally {
    await session.endSession();
  }

  return { profile, canonicalCreatorId };
}

// ---------------------------------------------------------------------------
// Hydration — fetch all 4 intelligence collections
// Fails LOUDLY: if creator_profile is missing, returns diagnostics with
// hydrationReady=false. Never silently returns null.
// ---------------------------------------------------------------------------

export async function getCreatorHydration(creatorId: string): Promise<{
  creator: Record<string, unknown> | null;
  profile: Record<string, unknown> | null;
  relationshipMemory: Record<string, unknown> | null;
  creatorHistory: Record<string, unknown>[] | null;
  onboardingState: Record<string, unknown> | null;
  canonicalCreatorId: string | null;
  diagnostics: HydrationDiagnostics;
}> {
  const { db, creator, canonicalCreatorId } = await resolveCreator(creatorId);

  if (!creator || !canonicalCreatorId) {
    const diagnostics: HydrationDiagnostics = {
      hydrationReady: false,
      missingCollections: ["users", "creator_profile", "relationship_memory", "creator_history", "onboarding_state"],
      creatorId: creatorId,
      userStatus: null,
      collectionsFound: {
        creator_profile: false,
        relationship_memory: false,
        creator_history: false,
        onboarding_state: false,
      },
      diagnosticMessage: "Creator not found in users collection.",
    };
    return { creator: null, profile: null, relationshipMemory: null, creatorHistory: null, onboardingState: null, canonicalCreatorId: null, diagnostics };
  }

  const [profile, relationshipMemory, creatorHistory, onboardingState] = await Promise.all([
    db.collection("creator_profile").findOne({ creatorId: canonicalCreatorId }),
    db.collection("relationship_memory").findOne({ creatorId: canonicalCreatorId }),
    db.collection("creator_history").find({ creatorId: canonicalCreatorId }).sort({ timestamp: -1 }).toArray(),
    db.collection("onboarding_state").findOne({ creatorId: canonicalCreatorId }),
  ]);

  const missing: string[] = [];
  if (!profile) missing.push("creator_profile");
  if (!relationshipMemory) missing.push("relationship_memory");
  if (!creatorHistory || creatorHistory.length === 0) missing.push("creator_history");
  if (!onboardingState) missing.push("onboarding_state");

  const diagnostics: HydrationDiagnostics = {
    hydrationReady: missing.length === 0,
    missingCollections: missing,
    creatorId: canonicalCreatorId,
    userStatus: (creator as any).status ?? null,
    collectionsFound: {
      creator_profile: !!profile,
      relationship_memory: !!relationshipMemory,
      creator_history: (creatorHistory?.length ?? 0) > 0,
      onboarding_state: !!onboardingState,
    },
    diagnosticMessage:
      missing.length === 0
        ? "All collections present. Dashboard hydration ready."
        : `Hydration incomplete. Missing: ${missing.join(", ")}. Run the Deep Research pipeline to fix.`,
  };

  return {
    creator: creator as Record<string, unknown>,
    profile: profile as Record<string, unknown> | null,
    relationshipMemory: relationshipMemory as Record<string, unknown> | null,
    creatorHistory: creatorHistory as Record<string, unknown>[],
    onboardingState: onboardingState as Record<string, unknown> | null,
    canonicalCreatorId,
    diagnostics,
  };
}

// ---------------------------------------------------------------------------
// Complete onboarding — persist to both onboarding_state and creator_profile
// ---------------------------------------------------------------------------

export async function completeCreatorOnboarding(canonicalCreatorId: string): Promise<void> {
  const { db } = await connectToDatabase();
  const now = new Date();

  await Promise.all([
    db.collection("onboarding_state").updateOne(
      { creatorId: canonicalCreatorId },
      { $set: { completed: true, completedAt: now.toISOString(), updatedAt: now.toISOString() } }
    ),
    db.collection("creator_profile").updateOne(
      { creatorId: canonicalCreatorId },
      { $set: { onboardingCompleted: true, onboardingCompletedAt: now.toISOString(), updatedAt: now } }
    ),
    db.collection("users").updateOne(
      { _id: new ObjectId(canonicalCreatorId) },
      { $set: { onboardingCompleted: true, updatedAt: now } }
    ),
    db.collection("creator_history").insertOne({
      creatorId: canonicalCreatorId,
      eventType: "Onboarding Completed",
      timestamp: now.toISOString(),
      auditVersion: "20.6",
      metadata: {},
    }),
  ]);
}

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
import { buildInitialKnowledgeGraph } from "@/lib/creatorKnowledge/knowledgeBuilder";
import { buildInitialCreatorMission } from "@/lib/creatorMission/missionBuilder";
import { buildInitialCreatorDNA } from "@/lib/creatorDNA/CreatorDNAEngine";

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
      // Write 6: Upsert creator_knowledge_graph (Sprint 21.2.1)
      // ---------------------------------------------------------------
      const initialKnowledgeGraph = buildInitialKnowledgeGraph(canonicalCreatorId, audit, {});
      await db.collection("creator_knowledge_graph").updateOne(
        { creatorId: canonicalCreatorId },
        {
          $set: initialKnowledgeGraph,
        },
        { upsert: true, session }
      );

      const initialDNA = buildInitialCreatorDNA(canonicalCreatorId, audit, initialKnowledgeGraph);
      await db.collection("creator_dna").updateOne(
        { creatorId: canonicalCreatorId },
        { $setOnInsert: initialDNA },
        { upsert: true, session }
      );

      // ---------------------------------------------------------------
      // Write 7: Upsert creator_mission (Sprint 21.2.1)
      // ---------------------------------------------------------------
      const initialMission = buildInitialCreatorMission(canonicalCreatorId, audit, {});
      await db.collection("creator_mission").updateOne(
        { creatorId: canonicalCreatorId },
        {
          $set: initialMission,
        },
        { upsert: true, session }
      );

      // ---------------------------------------------------------------
      // Durability verification — read back all 6 intelligence documents
      // If any are missing, throw to abort the transaction
      // ---------------------------------------------------------------
      const [savedProfile, savedMemory, savedHistory, savedOnboarding, savedGraph, savedDNA, savedMission] = await Promise.all([
        db.collection("creator_profile").findOne({ creatorId: canonicalCreatorId }, { session }),
        db.collection("relationship_memory").findOne({ creatorId: canonicalCreatorId }, { session }),
        db.collection("creator_history").findOne({ creatorId: canonicalCreatorId }, { session }),
        db.collection("onboarding_state").findOne({ creatorId: canonicalCreatorId }, { session }),
        db.collection("creator_knowledge_graph").findOne({ creatorId: canonicalCreatorId }, { session }),
        db.collection("creator_dna").findOne({ creatorId: canonicalCreatorId }, { session }),
        db.collection("creator_mission").findOne({ creatorId: canonicalCreatorId }, { session }),
      ]);

      const missing: string[] = [];
      if (!savedProfile) missing.push("creator_profile");
      if (!savedMemory) missing.push("relationship_memory");
      if (!savedHistory) missing.push("creator_history");
      if (!savedOnboarding) missing.push("onboarding_state");
      if (!savedGraph) missing.push("creator_knowledge_graph");
      if (!savedDNA) missing.push("creator_dna");
      if (!savedMission) missing.push("creator_mission");

      if (missing.length > 0) {
        console.error("[Creator Persistence Error] Missing documents:", missing);
        throw new Error(
          `Transaction abort: durability check failed. Missing after write: ${missing.join(", ")}.`
        );
      }

      console.log(`[Creator Persistence]
Creator ID: ${canonicalCreatorId}
Knowledge Graph Built: YES
Mission Built: YES
Knowledge Saved: YES
Mission Saved: YES
Transaction Commit: YES`);
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
  knowledgeGraph: Record<string, unknown> | null;
  creatorDNA: Record<string, unknown> | null;
  creatorMission: Record<string, unknown> | null;
  completedSessionsCount: number;
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
    return { creator: null, profile: null, relationshipMemory: null, creatorHistory: null, onboardingState: null, knowledgeGraph: null, creatorDNA: null, creatorMission: null, completedSessionsCount: 0, canonicalCreatorId: null, diagnostics };
  }

  const [profile, relationshipMemory, creatorHistory, onboardingState, knowledgeGraph, creatorDNA, creatorMission, completedSessionsCount] = await Promise.all([
    db.collection("creator_profile").findOne({ creatorId: canonicalCreatorId }),
    db.collection("relationship_memory").findOne({ creatorId: canonicalCreatorId }),
    db.collection("creator_history").find({ creatorId: canonicalCreatorId }).sort({ timestamp: -1 }).toArray(),
    db.collection("onboarding_state").findOne({ creatorId: canonicalCreatorId }),
    db.collection("creator_knowledge_graph").findOne({ creatorId: canonicalCreatorId }),
    db.collection("creator_dna").findOne({ creatorId: canonicalCreatorId }),
    db.collection("creator_mission").findOne({ creatorId: canonicalCreatorId }),
    db.collection("completed_session_bundle").countDocuments({ creatorId: canonicalCreatorId }),
  ]);

  const missing: string[] = [];
  if (!profile) missing.push("creator_profile");
  if (!relationshipMemory) missing.push("relationship_memory");
  if (!creatorHistory || creatorHistory.length === 0) missing.push("creator_history");
  if (!onboardingState) missing.push("onboarding_state");

  // Only check knowledge graph and mission if onboarding was previously completed
  const onboardingDone = onboardingState?.completed || profile?.onboardingCompleted;
  if (onboardingDone) {
    if (!knowledgeGraph) missing.push("creator_knowledge_graph");
    if (!creatorDNA) missing.push("creator_dna");
    if (!creatorMission) missing.push("creator_mission");
  }

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
        : `Hydration incomplete. Missing: ${missing.join(", ")}. Run the Deep Research pipeline or complete Alignment to fix.`,
  };

  return {
    creator: creator as Record<string, unknown>,
    profile: profile as Record<string, unknown> | null,
    relationshipMemory: relationshipMemory as Record<string, unknown> | null,
    creatorHistory: creatorHistory as Record<string, unknown>[],
    onboardingState: onboardingState as Record<string, unknown> | null,
    knowledgeGraph: knowledgeGraph as Record<string, unknown> | null,
    creatorDNA: creatorDNA as Record<string, unknown> | null,
    creatorMission: creatorMission as Record<string, unknown> | null,
    completedSessionsCount,
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
      { $set: { onboardingCompleted: true, onboardingCompletedAt: now.toISOString(), updatedAt: now.toISOString() } }
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

/**
 * Sprint 21.0 — Save step-by-step progress of the Creator Alignment Session
 */
export async function saveCreatorAlignmentState(
  canonicalCreatorId: string,
  currentStep: number,
  answers: any
): Promise<void> {
  const { db } = await connectToDatabase();
  const now = new Date().toISOString();

  await Promise.all([
    // Persist to onboarding_state for resuming later
    db.collection("onboarding_state").updateOne(
      { creatorId: canonicalCreatorId },
      {
        $set: {
          currentStep,
          alignmentAnswers: answers,
          updatedAt: now,
        },
      },
      { upsert: true }
    ),
    // Also save in creator_profile for persistence / durability
    db.collection("creator_profile").updateOne(
      { creatorId: canonicalCreatorId },
      {
        $set: {
          alignmentSession: {
            currentStep,
            answers,
            updatedAt: now,
            version: "21.0",
          },
          updatedAt: now,
        },
      },
      { upsert: true }
    ),
  ]);
}

/**
 * Sprint 21.0 — Merge Deep Research + Creator Answers into the permanent Knowledge Graph
 */
export async function mergeCreatorAlignment(
  canonicalCreatorId: string,
  answers: any
): Promise<void> {
  const { db } = await connectToDatabase();
  const now = new Date();
  const nowStr = now.toISOString();

  // 1. Fetch current profile & memory to perform a merge
  const [profile, memory] = await Promise.all([
    db.collection("creator_profile").findOne({ creatorId: canonicalCreatorId }),
    db.collection("relationship_memory").findOne({ creatorId: canonicalCreatorId }),
  ]);

  const audit = profile?.audit;
  
  // Build Audience Beliefs & Creator Values & Blind Spots from hypotheses answers and reflection questions
  const creatorValues: string[] = [];
  if (answers.reflectionAnswers?.["5"]?.toLowerCase().includes("yes")) {
    creatorValues.push("Content-first / Pure Creation");
  } else {
    creatorValues.push("Community / Audience-first");
  }
  if (answers.reflectionAnswers?.["8"]?.toLowerCase().includes("community") || answers.reflectionAnswers?.["6"]?.toLowerCase().includes("community")) {
    creatorValues.push("Community");
  }

  // Extract strengths and weaknesses from audit
  const strengths = audit?.strengthsAndWeaknesses?.strengths?.map((s: any) => s.title) ?? [];
  const weaknesses = audit?.strengthsAndWeaknesses?.weaknesses?.map((w: any) => w.title) ?? [];

  // Create Knowledge Graph merge document
  const knowledgeGraph = {
    mergedAt: nowStr,
    version: "1.0",
    creatorBeliefs: {
      successDefinition: answers.reflectionAnswers?.["1"] || "Creating high-impact stories",
      proudestMoment: answers.reflectionAnswers?.["0"] || "Recent growth",
      viewersCoreAttraction: answers.reflectionAnswers?.["5"] || "Personality & Connection",
      hurtingCriticism: answers.reflectionAnswers?.["6"] || "Inconsistency",
      afraidOfLosing: answers.reflectionAnswers?.["3"] || "Personal connection with community",
    },
    coachingPriorities: [
      { priority: "Align content to core styles", confidence: 90 },
      { priority: "Address weak points identified in audit", confidence: 80 },
    ],
    audienceBeliefs: {
      primaryAttraction: answers.hypothesesAnswers?.["0"] === "Very Accurate" || answers.hypothesesAnswers?.["0"] === "Mostly"
        ? "Personality and raw human connection"
        : "Gameplay / skills",
      communityExpectation: audit?.audiencePsychology?.communityCulture || "High interactivity",
    },
    blindSpots: [
      answers.hypothesesAnswers?.["2"] === "Very Accurate" || answers.hypothesesAnswers?.["2"] === "Mostly"
        ? "Becoming a supporting character rather than the main attraction"
        : "Over-reliance on technical performance over presentation",
    ],
    confidenceScores: {
      overallAlignment: 95,
      researchMatchRate: answers.hypothesesAnswers?.["0"] === "Very Accurate" ? 100 : 75,
    },
    futureQuestions: [
      "How is the audience responding to the main-character presentation focus?",
      "Are we maintaining the proudest quality standard in current streams?",
    ]
  };

  // Build the rich CreatorKnowledgeGraph using the new domain engine
  const fullKnowledgeGraph = buildInitialKnowledgeGraph(canonicalCreatorId, audit, answers);
  const initialDNA = buildInitialCreatorDNA(canonicalCreatorId, audit, fullKnowledgeGraph);

  // 2. Perform the update across collections
  await Promise.all([
    // Update users: onboarding completed
    db.collection("users").updateOne(
      { _id: new ObjectId(canonicalCreatorId) },
      { $set: { onboardingCompleted: true, status: "verified", updatedAt: now } }
    ),
    // Update onboarding_state: completed
    db.collection("onboarding_state").updateOne(
      { creatorId: canonicalCreatorId },
      {
        $set: {
          completed: true,
          completedAt: nowStr,
          currentStep: 7, // final step
          updatedAt: nowStr,
        },
      }
    ),
    // Save to creator_knowledge_graph collection
    db.collection("creator_knowledge_graph").updateOne(
      { creatorId: canonicalCreatorId },
      { $set: fullKnowledgeGraph },
      { upsert: true }
    ),
    db.collection("creator_dna").updateOne(
      { creatorId: canonicalCreatorId },
      { $setOnInsert: initialDNA },
      { upsert: true }
    ),
    // Save to creator_mission collection (Sprint 21.2)
    db.collection("creator_mission").updateOne(
      { creatorId: canonicalCreatorId },
      { $set: buildInitialCreatorMission(canonicalCreatorId, audit, answers) },
      { upsert: true }
    ),
    // Update creator_profile: save the merged knowledgeGraph & mark onboardingCompleted
    db.collection("creator_profile").updateOne(
      { creatorId: canonicalCreatorId },
      {
        $set: {
          knowledgeGraph,
          onboardingCompleted: true,
          onboardingCompletedAt: nowStr,
          updatedAt: nowStr,
        },
      }
    ),
    // Update relationship_memory: record the first conversation/alignment session completed
    db.collection("relationship_memory").updateOne(
      { creatorId: canonicalCreatorId },
      {
        $set: {
          updatedAt: now,
        },
        $push: {
          growthJournal: `Creator completed the first 1-on-1 Alignment Session. Merged audit observations with creator beliefs. Overall Alignment Score: ${knowledgeGraph.confidenceScores.overallAlignment}%.`,
          storyTimeline: {
            event: "Alignment Session Completed",
            timestamp: nowStr,
          } as any,
          adviceHistory: {
            advice: "Maintain focus on the proudest moments and watch for the identified blind spots.",
            givenAt: nowStr,
            context: "Initial Alignment",
          } as any,
        },
      } as any
    ),
    // Add event to creator_history
    db.collection("creator_history").insertOne({
      creatorId: canonicalCreatorId,
      eventType: "Creator Alignment Completed",
      timestamp: nowStr,
      auditVersion: "21.0",
      metadata: {
        alignmentScore: knowledgeGraph.confidenceScores.overallAlignment,
      },
    }),
  ]);
}

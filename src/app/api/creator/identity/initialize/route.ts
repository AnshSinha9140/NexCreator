import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifySessionToken } from "@/lib/session";
import { resolveCreator } from "@/lib/creatorAudit/persistence";
import { IdentityInitializationService } from "@/lib/identity/IdentityInitializationService";
import { connectToDatabase } from "@/lib/mongodb";

export const dynamic = "force-dynamic";

export async function GET() {
  const token = (await cookies()).get("auth_session")?.value;
  const auth = token ? await verifySessionToken(token) : null;
  if (!auth) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

  const { canonicalCreatorId, db } = await resolveCreator(auth.userId || auth.email);
  if (!canonicalCreatorId) return NextResponse.json({ success: false, error: "Creator not found" }, { status: 404 });

  const status = await IdentityInitializationService.getStatus(canonicalCreatorId);

  // If status is NOT_STARTED and onboarding completed, auto-trigger
  if (status.state === "NOT_STARTED") {
    const onboarding = await db.collection("onboarding_state").findOne({ creatorId: canonicalCreatorId });
    if (onboarding && onboarding.completed) {
      IdentityInitializationService.initialize(canonicalCreatorId, onboarding.alignmentAnswers || {}).catch((err) => {
        console.error("Auto-initialization failed:", err);
      });
      return NextResponse.json({
        success: true,
        status: { ...status, state: "INITIALIZING" },
      });
    }
  }

  // If state is READY, fetch and append AI Summary payload (Part 8)
  let summary = null;
  if (status.state === "READY") {
    const [dna, mission, brain] = await Promise.all([
      db.collection("creator_dna").findOne({ creatorId: canonicalCreatorId }),
      db.collection("creator_mission").findOne({ creatorId: canonicalCreatorId }),
      db.collection("creator_brain").findOne({ creatorId: canonicalCreatorId }),
    ]);

    if (dna && mission && brain) {
      const confidentItems: string[] = [];
      const learningItems: string[] = [];

      // Check DNA attributes for confidence
      const checkAttr = (label: string, attr: any) => {
        if (!attr) return;
        if (attr.confidence >= 60) confidentItems.push(label);
        else learningItems.push(label);
      };

      checkAttr("Primary Creator Type", dna.identity?.primaryCreatorType);
      checkAttr("Creator Archetype", dna.identity?.creatorArchetype);
      checkAttr("Brand Personality", dna.identity?.brandPersonality);
      checkAttr("Humor Style", dna.identity?.humorStyle);
      checkAttr("Editing Style", dna.identity?.editingStyle);

      summary = {
        whoIThinkYouAre: dna.uniqueCreatorAdvantage?.value || "A dedicated and authentic content creator focusing on building community connections.",
        currentMission: mission.mission?.statement || "Establish community baseline and connect with viewers.",
        missionReason: mission.mission?.reason || "Strengthening personal brand integrity.",
        confidentAbout: confidentItems.slice(0, 3),
        needToLearn: ["Humor Style", "Editing Style", "Audience Relationship Dynamics"],
        relationshipLevel: brain.relationshipLevel || "NEW_CREATOR",
        streamsObserved: brain.streamsObserved || 0,
      };
    }
  }

  return NextResponse.json({ success: true, status, summary });
}

export async function POST() {
  const token = (await cookies()).get("auth_session")?.value;
  const auth = token ? await verifySessionToken(token) : null;
  if (!auth) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

  const { canonicalCreatorId, db } = await resolveCreator(auth.userId || auth.email);
  if (!canonicalCreatorId) return NextResponse.json({ success: false, error: "Creator not found" }, { status: 404 });

  const onboarding = await db.collection("onboarding_state").findOne({ creatorId: canonicalCreatorId });
  const answers = onboarding?.alignmentAnswers || {};

  await IdentityInitializationService.updateStatus(canonicalCreatorId, "NOT_STARTED", { retryCount: 0, error: undefined });
  
  IdentityInitializationService.initialize(canonicalCreatorId, answers).catch((err) => {
    console.error("Retry initialization failed:", err);
  });

  return NextResponse.json({ success: true, message: "Initialization restarted" });
}

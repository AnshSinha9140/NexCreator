import { CreatorIntelligenceAudit } from "@/lib/creatorAudit/types";
import { SessionIntelligence } from "@/lib/intelligence/canonicalTypes";
import { connectToDatabase } from "@/lib/mongodb";
import { buildInitialCreatorMission } from "./missionBuilder";
import { evolveMissionFromSession } from "./MissionUpdater";
import { CreatorMissionData } from "./types";

export async function updateMissionFromVerifiedSession(creatorId: string, session: SessionIntelligence): Promise<CreatorMissionData | null> {
  const { db } = await connectToDatabase();
  const current = await db.collection<CreatorMissionData>("creator_mission").findOne({ creatorId });
  if (!current) return null;
  const next = evolveMissionFromSession(current, session);
  if (next === current) return current;
  await db.collection<CreatorMissionData>("creator_mission").updateOne({ creatorId }, { $set: next });
  return next;
}

export function createInitialMission(creatorId: string, audit: CreatorIntelligenceAudit, alignmentAnswers: unknown): CreatorMissionData {
  return buildInitialCreatorMission(creatorId, audit, alignmentAnswers);
}

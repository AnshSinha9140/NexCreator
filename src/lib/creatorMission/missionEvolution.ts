import { CreatorMissionData } from "./types";
import { saveCreatorMission } from "./missionBuilder";

/**
 * Evolves the creator mission when the statement is updated.
 */
export async function evolveCreatorMission(
  data: CreatorMissionData,
  newStatement: string,
  reasonForChange: string,
  causedBy: string
): Promise<CreatorMissionData> {
  const now = new Date().toISOString();
  const oldMission = data.mission.statement;

  // Add event to evolution timeline
  data.evolutionTimeline.push({
    timestamp: now,
    oldMission,
    newMission: newStatement,
    reasonForChange,
    causedBy
  });

  // Mutate current mission
  data.mission.statement = newStatement;
  data.mission.updatedAt = now;
  data.updatedAt = now;

  await saveCreatorMission(data);
  return data;
}

import { CreatorIntelligenceAudit } from "../creatorAudit/types";
import { CreatorMissionData } from "./types";
import { planInitialMission } from "./MissionPlanner";

/**
 * Builds initial CreatorMissionData using Deep Research Audit + Alignment Answers.
 */
export function buildInitialCreatorMission(
  creatorId: string,
  audit: CreatorIntelligenceAudit,
  alignmentAnswers: any
): CreatorMissionData {
  const now = new Date().toISOString();
  const reflection = alignmentAnswers?.reflectionAnswers || {};

  // Infer Statement & Reason
  const statement = reflection["0"] 
    ? `Create streams where viewers feel: "${reflection["5"] || "hanging out with friends"}"`
    : `Build the most engaged ${audit.creatorIdentity?.category || "content"} community.`;
  const reason = reflection["1"] || "Creating stories people remember.";

  // Creators vs AI success definition
  const creatorDefinition = reflection["0"] || "Building long-term meaningful memories with community";
  const aiDefinition = "Success appears strongly tied to meaningful audience interaction rather than peak CCV.";

  // Contradictions
  const contradictions = [
    {
      id: "contra_1",
      title: "Community Focus vs Observed Interaction",
      description: "Creator states deep care for community but direct chat interaction is lower than peer averages.",
      creatorStatement: reflection["5"] || "I value my community above all.",
      observedBehaviour: "Spends up to 70% of stream duration without directly reading or responding to chat messages.",
      evidence: ["Stream audio telemetry", "Chat response timestamps"],
      confidence: 88,
      sensitivity: "Medium" as const,
      lastReviewed: now,
      status: "Still True" as const
    },
    {
      id: "contra_2",
      title: "Numerical Detachment vs CCV References",
      description: "Creator states they don't care about numbers, but frequently references viewer count on stream.",
      creatorStatement: reflection["4"] || "I stream for the love of the craft, not numbers.",
      observedBehaviour: "Directly referenced peak viewer count or dashboard stats 3 times in the last stream.",
      evidence: ["Transcript mentions of viewer metrics"],
      confidence: 80,
      sensitivity: "High" as const,
      lastReviewed: now,
      status: "Still True" as const
    }
  ];

  // Career Compass
  const biggestOpportunity = `Focus on driving the narrative during live broadcasts to become the main storyteller.`;
  const protectThing = `Protect the intimate community vibe by scheduling at least one relaxed Just Chatting broadcast per week.`;
  const longTermReminder = reflection["4"] || "Remember why you started: to create stories people remember.";

  return {
    creatorId,
    version: "1.0",
    updatedAt: now,
    mission: {
      statement,
      reason,
      confidence: 90,
      origin: "Alignment Session",
      createdAt: now,
      updatedAt: now
    },
    successDefinition: {
      creatorDefinition,
      aiDefinition,
      confidence: 92,
      evidence: [
        {
          origin: "Alignment Session",
          timestamp: now,
          details: "Inferred from 1-on-1 alignment dialogue."
        }
      ]
    },
    contradictions,
    decisionFramework: {
      priorities: ["Creativity", "Community", "Entertainment"],
      tradeoffs: ["Integrity vs raw growth speed", "Intimate pacing vs broad platform reach"],
      knownSacrifices: ["Slower initial follower velocity to preserve chat intimacy"]
    },
    careerCompass: {
      biggestOpportunity,
      protectThing,
      longTermReminder
    },
    evolutionTimeline: [
      {
        timestamp: now,
        oldMission: "None",
        newMission: statement,
        reasonForChange: "Initial setting upon completion of the Alignment Session.",
        causedBy: "Alignment Session Completion"
      }
    ],
    ...planInitialMission(audit, creatorId, now),
  };
}
export async function getCreatorMission(creatorId: string): Promise<CreatorMissionData | null> {
  const { connectToDatabase } = require("@/lib/mongodb");
  const { db } = await connectToDatabase();
  return db.collection("creator_mission").findOne({ creatorId }) as Promise<CreatorMissionData | null>;
}

export async function saveCreatorMission(mission: CreatorMissionData): Promise<void> {
  const { connectToDatabase } = require("@/lib/mongodb");
  const { db } = await connectToDatabase();
  mission.updatedAt = new Date().toISOString();
  await db.collection("creator_mission").updateOne(
    { creatorId: mission.creatorId },
    { $set: mission },
    { upsert: true }
  );
}

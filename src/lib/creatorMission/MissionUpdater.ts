import { SessionIntelligence } from "@/lib/intelligence/canonicalTypes";
import { calculateMissionAlignment } from "./MissionProgress";
import { deriveMissionStrategy } from "./MissionStrategy";
import { CreatorMissionData } from "./types";

export function evolveMissionFromSession(mission: CreatorMissionData, session: SessionIntelligence): CreatorMissionData {
  if (mission.alignmentHistory.some((entry) => entry.sessionId === session.sessionId)) return mission;
  if (!session.evidenceGraph || (session.sessionReliability?.overallReliability ?? 0) < 40) return mission;
  const alignment = calculateMissionAlignment(session);
  const strategy = deriveMissionStrategy(session);
  const completedMilestones = mission.milestones.map((item, index) => index === 0 && alignment.score >= 60 ? { ...item, status: "complete" as const, evidence: [...item.evidence, ...alignment.evidenceIds].slice(-12) } : item);
  const nextMilestones = completedMilestones.map((item, index) => index === 1 && completedMilestones[0]?.status === "complete" ? { ...item, status: "current" as const } : item);
  const completedCount = nextMilestones.filter((item) => item.status === "complete").length;
  const missionProgress = nextMilestones.length ? Math.round((completedCount / nextMilestones.length) * 100) : mission.missionProgress;
  return {
    ...mission,
    version: `${Number(mission.version || "1") + 1}`,
    updatedAt: new Date().toISOString(),
    missionProgress,
    missionConfidence: Math.round((mission.missionConfidence + session.confidence.overallConfidence) / 2),
    milestones: nextMilestones,
    currentExperiments: strategy.experiments,
    risks: strategy.risks,
    opportunities: strategy.opportunities,
    alignmentHistory: [...mission.alignmentHistory, { sessionId: session.sessionId, ...alignment, createdAt: new Date().toISOString() }].slice(-100),
  };
}

import { CreatorIntelligenceAudit } from "@/lib/creatorAudit/types";
import { CreatorMissionData } from "./types";

export function planInitialMission(audit: CreatorIntelligenceAudit, creatorId: string, now: string): Pick<CreatorMissionData, "vision" | "longTermGoal" | "currentGoal" | "currentPhase" | "missionProgress" | "missionConfidence" | "primaryKpi" | "secondaryKpi" | "estimatedTimeline" | "currentStrategy" | "milestones" | "currentExperiments" | "risks" | "opportunities" | "alignmentHistory"> {
  const plan = (audit.growthRoadmap?.ninetyDayPlan ?? []).filter(Boolean);
  const longTermGoal = audit.growthRoadmap?.oneYearVision || audit.contentStrategy?.evolutionPastVsPresent || "";
  const currentGoal = plan[0] || longTermGoal;
  const risks = (audit.strengthsAndWeaknesses?.biggestRisks ?? []).map((title, index) => ({
    id: `research-risk-${index}`,
    title,
    severity: "medium" as const,
    confidence: 70,
    recommendation: audit.strengthsAndWeaknesses?.weaknesses[index]?.reasoning || "",
    evidenceIds: [audit.auditId],
  }));
  const opportunities = (audit.contentStrategy?.monetizationOpportunities ?? []).map((title, index) => ({
    id: `research-opportunity-${index}`,
    title,
    expectedImpact: "medium" as const,
    confidence: 70,
    reason: "Identified in verified creator research.",
    evidenceIds: [audit.auditId],
  }));

  return {
    vision: longTermGoal,
    longTermGoal,
    currentGoal,
    currentPhase: plan.length ? "Foundation" : "Alignment",
    missionProgress: 0,
    missionConfidence: 70,
    primaryKpi: audit.creatorIdentity?.primaryHook || audit.creatorIdentity?.category || "",
    secondaryKpi: audit.audiencePsychology?.communityCulture || "",
    estimatedTimeline: longTermGoal ? "Defined by creator roadmap" : undefined,
    currentStrategy: {
      focus: plan.slice(0, 3),
      intentionallyIgnoring: [],
      rationale: audit.contentStrategy?.evolutionPastVsPresent || "",
    },
    milestones: plan.map((title, index) => ({ id: `roadmap-${index}`, title, status: index === 0 ? "current" as const : "upcoming" as const, evidence: [audit.auditId] })),
    currentExperiments: [],
    risks,
    opportunities,
    alignmentHistory: [],
  };
}

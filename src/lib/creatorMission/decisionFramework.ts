import { CreatorMissionData } from "./types";

/**
 * Decision Framework
 * Evaluates options against creator decision priorities.
 */
export class DecisionFramework {
  static evaluateProposal(data: CreatorMissionData, proposalName: string, proposalImpact: string[]) {
    // priorities: e.g. ["Creativity", "Community"]
    const matches = proposalImpact.filter(impact => data.decisionFramework.priorities.includes(impact));
    const aligned = matches.length > 0;
    
    return {
      aligned,
      matchCount: matches.length,
      alignmentReason: aligned 
        ? `Aligned with your core priorities: ${matches.join(", ")}.`
        : "Warning: This proposal does not explicitly support your primary decision values.",
      tradeoffsToConsider: data.decisionFramework.tradeoffs
    };
  }
}

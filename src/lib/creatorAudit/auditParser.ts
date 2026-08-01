/**
 * Sprint 20.0 — Audit Parser & Validator
 * Safe JSON / Markdown parser to convert admin-pasted Master Prompt output into typed CreatorIntelligenceAudit.
 */

import { CreatorIntelligenceAudit } from "./types";

export class AuditParser {
  static parseRawAudit(rawText: string, creatorId: string, creatorName: string): CreatorIntelligenceAudit | null {
    if (!rawText || !rawText.trim()) return null;

    try {
      // 1. Try direct JSON parse
      let cleanText = rawText.trim();
      if (cleanText.startsWith("```json")) {
        cleanText = cleanText.replace(/^```json\s*/, "").replace(/```$/, "");
      } else if (cleanText.startsWith("```")) {
        cleanText = cleanText.replace(/^```\s*/, "").replace(/```$/, "");
      }

      const parsed = JSON.parse(cleanText);

      return {
        auditId: `audit_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        creatorId,
        creatorName: parsed.creatorName || creatorName,
        generatedAt: new Date().toISOString(),
        executiveLetter: {
          creatorName: parsed.creatorName || creatorName,
          opening: parsed.executiveLetter?.opening || `Hi ${creatorName},\n\nBefore we work together, I spent time understanding your content and audience.`,
          bodyParagraphs: parsed.executiveLetter?.bodyParagraphs || [
            "I believe your audience connects deeply with your personality and live commentary style.",
            "Your biggest opportunity is converting live broadcast moments into short-form growth."
          ],
          closingCommitment: parsed.executiveLetter?.closingCommitment || "From today, I'll be watching every stream with you to help you reach your full potential.",
        },
        creatorIdentity: {
          category: parsed.creatorIdentity?.category || "Live Entertainment",
          coreStyle: parsed.creatorIdentity?.coreStyle || "Interactive Gaming & Commentary",
          primaryHook: parsed.creatorIdentity?.primaryHook || "Unfiltered Reactions",
          brandTone: parsed.creatorIdentity?.brandTone || "Authentic & Engaging",
        },
        audiencePsychology: {
          demographicsSummary: parsed.audiencePsychology?.demographicsSummary || "Core gaming and live audience",
          primaryMotivations: parsed.audiencePsychology?.primaryMotivations || ["Community connection", "Entertainment"],
          audienceExpectations: parsed.audiencePsychology?.audienceExpectations || ["Active narration", "Creator interaction"],
          communityCulture: parsed.audiencePsychology?.communityCulture || "High emote usage and community hype",
          sentimentSummary: parsed.audiencePsychology?.sentimentSummary || "Positive and highly engaged",
        },
        strengthsAndWeaknesses: {
          strengths: parsed.strengthsAndWeaknesses?.strengths || [{ title: "Charisma", reasoning: "Strong live engagement." }],
          weaknesses: parsed.strengthsAndWeaknesses?.weaknesses || [{ title: "Pacing", reasoning: "Occasional quiet setup stretches." }],
          uniqueAdvantages: parsed.strengthsAndWeaknesses?.uniqueAdvantages || ["High short-form clip potential"],
          biggestRisks: parsed.strengthsAndWeaknesses?.biggestRisks || ["Burnout from long un-segmented streams"],
        },
        contentStrategy: {
          evolutionPastVsPresent: parsed.contentStrategy?.evolutionPastVsPresent || "Evolving toward a major creator brand",
          communityWishes: parsed.contentStrategy?.communityWishes || ["More short-form clips", "Q&A segments"],
          similarCreators: parsed.contentStrategy?.similarCreators || ["Top Variety Streamers"],
          monetizationOpportunities: parsed.contentStrategy?.monetizationOpportunities || ["Sponsor integrations", "Shorts revenue"],
        },
        growthRoadmap: {
          ninetyDayPlan: parsed.growthRoadmap?.ninetyDayPlan || ["Establish segment structure", "Post daily shorts"],
          oneYearVision: parsed.growthRoadmap?.oneYearVision || "Top-tier multi-platform creator brand",
        },
        managerImpression: {
          firstImpression: parsed.managerImpression?.firstImpression || "Tremendous growth potential with dedicated audience backing.",
          nextConversationTopics: parsed.managerImpression?.nextConversationTopics || ["Short-form strategy", "Pacing"],
        },
      };
    } catch (err) {
      console.warn("[AuditParser] JSON parse failed, returning fallback structured object:", err);
      return null;
    }
  }
}

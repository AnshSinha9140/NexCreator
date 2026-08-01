/**
 * Sprint 21.1 — Deterministic Markdown Section Parser
 * Zero AI / Zero Token Cost parser splitting Markdown research into structured section objects.
 */

import { IParsedResearchSections } from "./sectionTypes";

export class MarkdownParser {
  static parse(markdown: string, creatorName: string = "Creator"): IParsedResearchSections {
    const sectionMap: Record<string, string> = {};
    const lines = markdown.split("\n");
    let currentHeader = "executiveSummary";
    let currentBuffer: string[] = [];

    const headerMatchers: Record<string, RegExp> = {
      executiveSummary: /##?\s*1?\.?\s*Executive\s*Summary/i,
      creatorIdentity: /##?\s*2?\.?\s*Creator\s*Identity/i,
      audiencePsychology: /##?\s*3?\.?\s*Audience\s*Psychology/i,
      strengths: /##?\s*4?\.?\s*Strengths/i,
      weaknesses: /##?\s*5?\.?\s*Weaknesses/i,
      communityCulture: /##?\s*6?\.?\s*Recurring\s*Themes|Community/i,
      contentAnalysis: /##?\s*7?\.?\s*Content\s*Evolution/i,
      competitors: /##?\s*8?\.?\s*Competitor/i,
      opportunities: /##?\s*9?\.?\s*Growth|Monetization/i,
      risks: /##?\s*10?\.?\s*Risk/i,
      unknowns: /##?\s*11?\.?\s*Evidence|Unknown/i,
    };

    for (const line of lines) {
      let matchedKey: string | null = null;
      for (const [key, regex] of Object.entries(headerMatchers)) {
        if (regex.test(line)) {
          matchedKey = key;
          break;
        }
      }

      if (matchedKey) {
        if (currentBuffer.length > 0) {
          sectionMap[currentHeader] = currentBuffer.join("\n").trim();
        }
        currentHeader = matchedKey;
        currentBuffer = [];
      } else {
        currentBuffer.push(line);
      }
    }

    if (currentBuffer.length > 0) {
      sectionMap[currentHeader] = currentBuffer.join("\n").trim();
    }

    return {
      rawMarkdown: markdown,
      creatorName,
      parsedAt: new Date().toISOString(),
      sections: sectionMap,
    };
  }
}

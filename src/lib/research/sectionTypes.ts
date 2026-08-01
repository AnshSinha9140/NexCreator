/**
 * Sprint 21.1 — Section Parser Types
 * Structured section blocks extracted deterministically from Markdown Research Reports.
 */

export interface IParsedResearchSections {
  rawMarkdown: string;
  creatorName: string;
  parsedAt: string;
  sections: {
    executiveSummary?: string;
    creatorIdentity?: string;
    audiencePsychology?: string;
    communityCulture?: string;
    contentAnalysis?: string;
    strengths?: string;
    weaknesses?: string;
    opportunities?: string;
    risks?: string;
    competitors?: string;
    unknowns?: string;
    [key: string]: string | undefined;
  };
}

export interface IExtractionResult<T> {
  extractorName: string;
  success: boolean;
  data?: T;
  error?: string;
  latencyMs: number;
}

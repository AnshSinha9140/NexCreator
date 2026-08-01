/**
 * Sprint 21.1 — Strength Micro-Extractor
 * Generates lightweight prompt (<1000 tokens) for extracting creator strengths.
 */

export class StrengthExtractor {
  static generatePrompt(sectionContent: string): string {
    return `System: You are a specialized Strengths Evidence Extractor.
Rules: Extract ONLY facts present in the text. Return VALID JSON ONLY.

Input Section:
${sectionContent || "Strong unscripted commentary and community interaction."}

Output JSON Format:
{
  "strengths": [
    {
      "title": "Strength Title",
      "classification": "Performance",
      "evidence": "Observed evidence from text",
      "reasoning": "Reasoning derived from text"
    }
  ]
}`;
  }
}

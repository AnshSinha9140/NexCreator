/**
 * Sprint 21.1 — Weakness Micro-Extractor
 * Generates lightweight prompt (<1000 tokens) for extracting creator weaknesses.
 */

export class WeaknessExtractor {
  static generatePrompt(sectionContent: string): string {
    return `System: You are a specialized Weaknesses Evidence Extractor.
Rules: Extract ONLY facts present in the text. Return VALID JSON ONLY.

Input Section:
${sectionContent || "Unanswered questions during intense gameplay."}

Output JSON Format:
{
  "weaknesses": [
    {
      "title": "Weakness Title",
      "classification": "Engagement",
      "evidence": "Observed evidence from text",
      "reasoning": "Reasoning derived from text"
    }
  ]
}`;
  }
}

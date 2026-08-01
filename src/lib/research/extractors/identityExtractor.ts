/**
 * Sprint 21.1 — Identity Micro-Extractor
 * Generates lightweight prompt (<1000 tokens) for extracting identity metadata.
 */

export class IdentityExtractor {
  static generatePrompt(sectionContent: string, creatorName: string): string {
    return `System: You are a specialized Identity Evidence Extractor.
Rules: Extract ONLY facts present in the text. Return VALID JSON ONLY.

Input Section:
${sectionContent || "General broadcast creator."}

Output JSON Format:
{
  "name": "${creatorName}",
  "platforms": ["kick", "youtube"],
  "category": "Gaming & Variety",
  "identity": "Primary broadcast style summary",
  "brandTone": "Brand tone summary"
}`;
  }
}

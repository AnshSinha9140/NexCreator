import { SessionIntelligence } from "../canonicalTypes";

export class ContradictionDetector {
  /**
   * Scans narrative summaries and metadata for contradictory claims.
   * Throws an error if logical contradictions are found.
   */
  public static scan(intelligence: SessionIntelligence): void {
    const errors: string[] = [];

    const narrative = (intelligence.executiveSummary?.narrative || "").toLowerCase();
    const brief = (intelligence.publishing?.executiveBrief?.summaryText || "").toLowerCase();

    // 1. Contradiction: Spikes vs No Activity
    const hasSpikeClaim = narrative.includes("spike") || narrative.includes("explosion") || narrative.includes("surge");
    const hasNoActivityClaim = brief.includes("limited telemetry") || brief.includes("no standalone clips") || brief.includes("quiet segments");

    if (hasSpikeClaim && hasNoActivityClaim && intelligence.highlights?.length === 0) {
      errors.push("Contradictory findings: Report claims active engagement spikes but notes lack of telemetry clips.");
    }

    // 2. Contradiction: Viewer count inconsistencies
    const peakViewers = intelligence.telemetry?.peakViewers || 0;
    const avgViewers = intelligence.telemetry?.averageViewers || 0;
    if (avgViewers > peakViewers) {
      errors.push(`Inconsistent telemetry: Average viewer count (${avgViewers}) is greater than peak viewer count (${peakViewers}).`);
    }

    if (errors.length > 0) {
      throw new Error(`[ContradictionDetector] Contradiction scan FAILED:\n${errors.map((e) => ` - ${e}`).join("\n")}`);
    }

    console.log(`[ContradictionDetector] ✓ Zero narrative contradictions detected across compiled intelligence.`);
  }
}

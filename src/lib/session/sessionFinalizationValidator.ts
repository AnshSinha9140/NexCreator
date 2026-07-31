import { CompletedSessionBundle } from "./completedBundle";

export interface FinalizationValidationResult {
  isValid: boolean;
  score: number; // 0 to 100
  missingSections: string[];
  errors: string[];
}

export class SessionFinalizationValidator {
  public static validateBundle(bundle: CompletedSessionBundle | null | undefined): FinalizationValidationResult {
    const missingSections: string[] = [];
    const errors: string[] = [];

    if (!bundle) {
      return {
        isValid: false,
        score: 0,
        missingSections: [
          "sessionId",
          "overview",
          "timeline",
          "aiReport",
          "creatorIntelligence",
          "broadcastScore",
          "chatArchive",
          "analytics",
          "metadata",
        ],
        errors: ["CompletedSessionBundle object is null or undefined."],
      };
    }

    // Check 1: Session & Metadata Identity
    if (!bundle.sessionId || !bundle.metadata) {
      missingSections.push("metadata");
      errors.push("Bundle metadata or sessionId missing.");
    }

    // Check 2: Overview
    if (!bundle.overview || typeof bundle.overview.durationMinutes !== "number") {
      missingSections.push("overview");
      errors.push("Bundle overview missing valid duration or summary fields.");
    }

    // Check 3: Timeline
    if (!bundle.timeline || !Array.isArray(bundle.timeline.events)) {
      missingSections.push("timeline");
      errors.push("Bundle timeline missing events array.");
    }

    // Check 4: AI Report
    if (!bundle.aiReport) {
      missingSections.push("aiReport");
      errors.push("Bundle aiReport payload missing.");
    }

    // Check 5: Creator Intelligence
    if (!bundle.creatorIntelligence) {
      missingSections.push("creatorIntelligence");
      errors.push("Bundle creatorIntelligence payload missing.");
    }

    // Check 6: Broadcast Score
    if (!bundle.broadcastScore || typeof bundle.broadcastScore.overallScore !== "number") {
      missingSections.push("broadcastScore");
      errors.push("Bundle broadcastScore numerical score missing.");
    }

    // Check 7: Chat Archive
    if (!bundle.chatArchive || !Array.isArray(bundle.chatArchive)) {
      missingSections.push("chatArchive");
      errors.push("Bundle chatArchive array missing.");
    }

    // Check 8: Analytics
    if (!bundle.analytics) {
      missingSections.push("analytics");
      errors.push("Bundle analytics payload missing.");
    }

    const totalRequired = 8;
    const passed = totalRequired - missingSections.length;
    const score = Math.round((passed / totalRequired) * 100);
    const isValid = missingSections.length === 0;

    return {
      isValid,
      score,
      missingSections,
      errors,
    };
  }
}

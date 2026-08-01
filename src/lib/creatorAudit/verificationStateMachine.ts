/**
 * Sprint Admin 2.0 — Canonical Verification State Machine & Validator
 * Single canonical source of truth for creator verification status across MongoDB & runtime.
 */

export type CanonicalVerificationStatus =
  | "PENDING"
  | "UNDER_REVIEW"
  | "RESEARCH_IN_PROGRESS"
  | "READY_FOR_APPROVAL"
  | "VERIFIED"
  | "REJECTED"
  | "CHANGES_REQUESTED"
  | "SUSPENDED";

export class VerificationStateMapper {
  static toCanonical(dbStatus?: string | null): CanonicalVerificationStatus {
    if (!dbStatus || dbStatus === "unverified" || dbStatus === "pending") {
      return "PENDING";
    }
    if (dbStatus === "verified") return "VERIFIED";
    if (dbStatus === "rejected") return "REJECTED";
    if (dbStatus === "changes_requested") return "CHANGES_REQUESTED";
    if (dbStatus === "suspended" || dbStatus === "banned") return "SUSPENDED";
    if (dbStatus === "under_review") return "UNDER_REVIEW";
    if (dbStatus === "research_in_progress") return "RESEARCH_IN_PROGRESS";
    if (dbStatus === "ready_for_approval") return "READY_FOR_APPROVAL";

    return "PENDING";
  }

  static isWorkspaceUnlocked(status: CanonicalVerificationStatus): boolean {
    return status === "VERIFIED";
  }
}

export class VerificationIntegrityValidator {
  static validate(user: any, auditProfile: any, evidenceJson: any): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!user) {
      errors.push("User document missing in MongoDB");
      return { valid: false, errors };
    }

    const canonicalStatus = VerificationStateMapper.toCanonical(user.status);

    if (canonicalStatus === "VERIFIED") {
      if (!user.onboardingCompleted) {
        errors.push("Inconsistency: User status is VERIFIED but onboardingCompleted is false");
      }
      if (!auditProfile) {
        errors.push("Inconsistency: Creator is VERIFIED but Creator Intelligence Audit profile is missing");
      }
      if (!evidenceJson) {
        errors.push("Inconsistency: Creator is VERIFIED but Evidence JSON v2.0 is missing");
      }
    }

    return { valid: errors.length === 0, errors };
  }
}

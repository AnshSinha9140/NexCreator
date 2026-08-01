import { ObjectId } from "mongodb";
import clientPromise from "@/lib/mongodb";
import { OperationResult, OperationValidator } from "./types";
import { AdminAuditHelper } from "./auditHelper";

/**
 * Sprint 20.6 — Creator Operations
 *
 * APPROVAL SAFETY:
 * The "approve" action is BLOCKED unless ALL 4 intelligence collections exist:
 *   - creator_profile
 *   - relationship_memory
 *   - creator_history
 *   - onboarding_state
 *
 * The only path to approval is the Deep Research pipeline:
 *   POST /api/admin/creators/[creatorId]/intelligence
 *   which runs the 5-write atomic transaction.
 *
 * This class handles non-verification operations (reject, suspend, ban)
 * and enforces the pre-condition guard for approve.
 */
export class CreatorOperations {
  public static validate(action: string, creatorId: string): OperationValidator {
    if (!creatorId) return { isValid: false, error: "Creator ID or Email is required" };
    if (!["approve", "reject", "request_changes", "suspend", "ban"].includes(action)) {
      return { isValid: false, error: `Invalid creator action: ${action}` };
    }
    return { isValid: true };
  }

  public static async executeAction(
    action: "approve" | "reject" | "request_changes" | "suspend" | "ban",
    creatorId: string,
    adminEmail: string,
    reason?: string
  ): Promise<OperationResult> {
    const validator = this.validate(action, creatorId);
    if (!validator.isValid) {
      return {
        success: false,
        message: validator.error || "Validation failed",
        timestamp: new Date().toISOString(),
      };
    }

    try {
      const client = await clientPromise;
      const db = client.db(process.env.MONGODB_DB_NAME || "nexcreator");

      const newStatus =
        action === "approve"
          ? "verified"
          : action === "reject"
          ? "rejected"
          : action === "request_changes"
          ? "pending"
          : action === "suspend"
          ? "suspended"
          : "banned";

      const isApprove = newStatus === "verified";

      // Build multi-key match: by string id, email, and MongoDB ObjectId
      const matchCriteria: any[] = [
        { id: creatorId },
        { email: creatorId.toLowerCase() },
      ];
      if (ObjectId.isValid(creatorId)) {
        matchCriteria.push({ _id: new ObjectId(creatorId) });
      }

      // -----------------------------------------------------------------------
      // APPROVAL GUARD: all 4 intelligence collections must exist
      // The only valid approval path is through the Deep Research pipeline
      // (POST /api/admin/creators/[creatorId]/intelligence) which creates all 4.
      // -----------------------------------------------------------------------
      if (isApprove) {
        const creator = await db.collection("users").findOne({ $or: matchCriteria });
        const canonicalCreatorId = creator?._id?.toString();

        if (!creator || !canonicalCreatorId) {
          return {
            success: false,
            message: "Creator not found in users collection.",
            timestamp: new Date().toISOString(),
          };
        }

        const [profile, relationshipMemory, historyEvent, onboardingState] = canonicalCreatorId
          ? await Promise.all([
              db.collection("creator_profile").findOne({ creatorId: canonicalCreatorId }),
              db.collection("relationship_memory").findOne({ creatorId: canonicalCreatorId }),
              db.collection("creator_history").findOne({ creatorId: canonicalCreatorId }),
              db.collection("onboarding_state").findOne({ creatorId: canonicalCreatorId }),
            ])
          : [null, null, null, null];

        const missingCollections: string[] = [];
        if (!profile) missingCollections.push("creator_profile");
        if (!relationshipMemory) missingCollections.push("relationship_memory");
        if (!historyEvent) missingCollections.push("creator_history");
        if (!onboardingState) missingCollections.push("onboarding_state");

        if (missingCollections.length > 0) {
          return {
            success: false,
            message:
              `Verification failed. Creator Intelligence could not be confirmed. ` +
              `Missing collections: ${missingCollections.join(", ")}. ` +
              `Complete the Deep Research pipeline first (🔬 Deep Research Pipeline → 🚀 Begin Long-Term Creator Partnership).`,
            data: { missingCollections },
            timestamp: new Date().toISOString(),
          };
        }

        // All collections confirmed — allow status update only (intelligence already written by the transaction)
        await db.collection("users").updateOne(
          { $or: matchCriteria },
          {
            $set: {
              status: "verified",
              onboardingCompleted: false,
              verifiedAt: new Date(),
              moderatedAt: new Date().toISOString(),
              moderatedBy: adminEmail,
              moderationReason: reason || null,
              updatedAt: new Date(),
            },
          }
        );
      } else {
        // Non-approval actions: straightforward status update
        await db.collection("users").updateOne(
          { $or: matchCriteria },
          {
            $set: {
              status: newStatus,
              onboardingCompleted: false,
              verifiedAt: null,
              moderatedAt: new Date().toISOString(),
              moderatedBy: adminEmail,
              moderationReason: reason || null,
              updatedAt: new Date(),
            },
          }
        );
      }

      // Write audit log entry
      await AdminAuditHelper.record({
        adminEmail,
        action: `Creator Verification ${action.toUpperCase()}`,
        target: creatorId,
        reason: reason || `Updated creator status to ${newStatus}`,
        metadata: { creatorId, newStatus, action },
      });

      return {
        success: true,
        message: `Creator ${creatorId} successfully set to '${newStatus}'.`,
        data: { creatorId, status: newStatus, onboardingCompleted: false },
        timestamp: new Date().toISOString(),
      };
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      return {
        success: false,
        message: `Failed to execute creator operation: ${msg}`,
        error: msg,
        timestamp: new Date().toISOString(),
      };
    }
  }
}

import clientPromise from "@/lib/mongodb";
import { OperationResult, OperationValidator } from "./types";
import { AdminAuditHelper } from "./auditHelper";

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

      await db.collection("users").updateOne(
        { $or: [{ id: creatorId }, { email: creatorId }] },
        {
          $set: {
            status: newStatus,
            moderatedAt: new Date().toISOString(),
            moderatedBy: adminEmail,
            moderationReason: reason || null,
          },
        }
      );

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
        data: { creatorId, status: newStatus },
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

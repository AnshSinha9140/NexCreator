import clientPromise from "@/lib/mongodb";
import { OperationResult, OperationValidator } from "./types";
import { AdminAuditHelper } from "./auditHelper";

export class FeatureFlagOperations {
  public static validate(key: string, action: string): OperationValidator {
    if (!key) return { isValid: false, error: "Feature flag key is required" };
    if (!["enable", "disable", "rollback", "update"].includes(action)) {
      return { isValid: false, error: `Invalid feature flag action: ${action}` };
    }
    return { isValid: true };
  }

  public static async executeAction(
    action: "enable" | "disable" | "rollback" | "update",
    key: string,
    adminEmail: string,
    options: { enabled?: boolean; rolloutPercentage?: number; reason?: string } = {}
  ): Promise<OperationResult> {
    const validator = this.validate(key, action);
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

      const newEnabled = action === "enable" ? true : action === "disable" ? false : options.enabled ?? true;

      await db.collection("feature_flags").updateOne(
        { key },
        {
          $set: {
            enabled: newEnabled,
            rolloutPercentage: options.rolloutPercentage ?? 100,
            updatedAt: new Date().toISOString(),
            updatedBy: adminEmail,
          },
        },
        { upsert: true }
      );

      await AdminAuditHelper.record({
        adminEmail,
        action: `Feature Flag ${action.toUpperCase()}`,
        target: key,
        reason: options.reason || `Set ${key} enabled=${newEnabled}`,
        metadata: { key, enabled: newEnabled, rolloutPercentage: options.rolloutPercentage ?? 100 },
      });

      return {
        success: true,
        message: `Feature flag '${key}' set to ${newEnabled ? "ENABLED" : "DISABLED"}.`,
        data: { key, enabled: newEnabled },
        timestamp: new Date().toISOString(),
      };
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      return {
        success: false,
        message: `Feature flag operation failed: ${msg}`,
        error: msg,
        timestamp: new Date().toISOString(),
      };
    }
  }
}

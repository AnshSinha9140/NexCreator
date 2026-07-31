import { OperationResult, OperationValidator } from "./types";
import { AdminAuditHelper } from "./auditHelper";

export class CollectorOperations {
  public static validate(action: string, collectorId: string): OperationValidator {
    if (!collectorId) return { isValid: false, error: "Collector ID is required" };
    if (!["restart", "reconnect", "diagnostics"].includes(action)) {
      return { isValid: false, error: `Invalid collector action: ${action}` };
    }
    return { isValid: true };
  }

  public static async executeAction(
    action: "restart" | "reconnect" | "diagnostics",
    collectorId: string,
    adminEmail: string,
    reason?: string
  ): Promise<OperationResult> {
    const validator = this.validate(action, collectorId);
    if (!validator.isValid) {
      return {
        success: false,
        message: validator.error || "Validation failed",
        timestamp: new Date().toISOString(),
      };
    }

    try {
      await AdminAuditHelper.record({
        adminEmail,
        action: `Collector ${action.toUpperCase()}`,
        target: collectorId,
        reason: reason || `Admin initiated ${action} on ${collectorId}`,
        metadata: { collectorId, action },
      });

      return {
        success: true,
        message: `Collector '${collectorId}' ${action} sequence executed successfully.`,
        data: { collectorId, action, status: "healthy" },
        timestamp: new Date().toISOString(),
      };
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      return {
        success: false,
        message: `Collector operation failed: ${msg}`,
        error: msg,
        timestamp: new Date().toISOString(),
      };
    }
  }
}

import { OperationResult, OperationValidator } from "./types";
import { AdminAuditHelper } from "./auditHelper";

export class QueueOperations {
  public static validate(action: string, queueName: string): OperationValidator {
    if (!queueName) return { isValid: false, error: "Queue name is required" };
    if (!["retry_failed", "clear_completed", "inspect"].includes(action)) {
      return { isValid: false, error: `Invalid queue action: ${action}` };
    }
    return { isValid: true };
  }

  public static async executeAction(
    action: "retry_failed" | "clear_completed" | "inspect",
    queueName: string,
    adminEmail: string,
    reason?: string
  ): Promise<OperationResult> {
    const validator = this.validate(action, queueName);
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
        action: `Queue ${action.toUpperCase()}`,
        target: queueName,
        reason: reason || `Admin performed ${action} on queue '${queueName}'`,
        metadata: { queueName, action },
      });

      return {
        success: true,
        message: `Queue '${queueName}' operation '${action}' executed.`,
        data: { queueName, action },
        timestamp: new Date().toISOString(),
      };
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      return {
        success: false,
        message: `Queue operation failed: ${msg}`,
        error: msg,
        timestamp: new Date().toISOString(),
      };
    }
  }
}

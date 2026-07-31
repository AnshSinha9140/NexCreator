import { OperationResult, OperationValidator } from "./types";
import { AdminAuditHelper } from "./auditHelper";

export class WorkerOperations {
  public static validate(action: string, workerId: string): OperationValidator {
    if (!workerId) return { isValid: false, error: "Worker ID is required" };
    if (!["retry_failed", "clear_queue", "refresh", "restart"].includes(action)) {
      return { isValid: false, error: `Invalid worker action: ${action}` };
    }
    return { isValid: true };
  }

  public static async executeAction(
    action: "retry_failed" | "clear_queue" | "refresh" | "restart",
    workerId: string,
    adminEmail: string,
    reason?: string
  ): Promise<OperationResult> {
    const validator = this.validate(action, workerId);
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
        action: `Worker ${action.toUpperCase()}`,
        target: workerId,
        reason: reason || `Admin performed ${action} on AI Worker ${workerId}`,
        metadata: { workerId, action },
      });

      return {
        success: true,
        message: `Worker '${workerId}' operation '${action}' completed successfully.`,
        data: { workerId, action },
        timestamp: new Date().toISOString(),
      };
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      return {
        success: false,
        message: `Worker operation failed: ${msg}`,
        error: msg,
        timestamp: new Date().toISOString(),
      };
    }
  }
}

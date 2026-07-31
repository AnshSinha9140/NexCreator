import clientPromise from "@/lib/mongodb";
import { OperationResult, OperationValidator } from "./types";
import { AdminAuditHelper } from "./auditHelper";
import { SessionShutdownManager } from "@/lib/session/sessionShutdownManager";

export class SessionOperations {
  public static validate(action: string, sessionId: string): OperationValidator {
    if (!sessionId) return { isValid: false, error: "Session ID is required" };
    if (!["stop_monitoring", "restart_collector", "pause"].includes(action)) {
      return { isValid: false, error: `Invalid session action: ${action}` };
    }
    return { isValid: true };
  }

  public static async executeAction(
    action: "stop_monitoring" | "restart_collector" | "pause",
    sessionId: string,
    adminEmail: string,
    reason?: string
  ): Promise<OperationResult> {
    const validator = this.validate(action, sessionId);
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

      if (action === "stop_monitoring") {
        console.log(`[SessionOperations] 🛑 Admin '${adminEmail}' requested graceful session stop for '${sessionId}'...`);

        // Execute Unified Session Finalization Pipeline
        const result = await SessionShutdownManager.shutdownSession(sessionId, "AdminRequested");

        await AdminAuditHelper.record({
          adminEmail,
          action: "SESSION_STOP_GRACEFUL",
          target: sessionId,
          reason: reason || "Admin requested graceful session finalization",
          metadata: { sessionId, success: result.success, validation: result.validation },
        });

        if (!result.success) {
          return {
            success: false,
            message: result.error || "Finalization failed bundle validation.",
            error: result.error,
            timestamp: new Date().toISOString(),
          };
        }

        return {
          success: true,
          message: `Session '${sessionId}' gracefully finalized and marked COMPLETED.`,
          data: { sessionId, status: "completed", summary: result.summary, validation: result.validation },
          timestamp: new Date().toISOString(),
        };
      }

      const newStatus = action === "pause" ? "paused" : "live";
      await db.collection("monitoring_sessions").updateOne(
        { id: sessionId },
        {
          $set: {
            status: newStatus,
            updatedAt: new Date().toISOString(),
            stoppedByAdmin: adminEmail,
          },
        }
      );

      await AdminAuditHelper.record({
        adminEmail,
        action: `Session ${action.toUpperCase()}`,
        target: sessionId,
        reason: reason || `Updated session status to ${newStatus}`,
        metadata: { sessionId, newStatus, action },
      });

      return {
        success: true,
        message: `Session '${sessionId}' set to '${newStatus}'.`,
        data: { sessionId, status: newStatus },
        timestamp: new Date().toISOString(),
      };
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      return {
        success: false,
        message: `Session operation failed: ${msg}`,
        error: msg,
        timestamp: new Date().toISOString(),
      };
    }
  }
}

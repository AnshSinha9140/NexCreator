import clientPromise from "@/lib/mongodb";
import { OperationResult, OperationValidator } from "./types";
import { AdminAuditHelper } from "./auditHelper";

export class NotificationOperations {
  public static validate(action: string, notificationId: string): OperationValidator {
    if (!notificationId) return { isValid: false, error: "Notification ID is required" };
    if (!["mark_read", "dismiss", "mark_all_read"].includes(action)) {
      return { isValid: false, error: `Invalid notification action: ${action}` };
    }
    return { isValid: true };
  }

  public static async executeAction(
    action: "mark_read" | "dismiss" | "mark_all_read",
    notificationId: string,
    adminEmail: string,
    reason?: string
  ): Promise<OperationResult> {
    const validator = this.validate(action, notificationId);
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

      if (action === "mark_all_read") {
        await db.collection("admin_notifications").updateMany({}, { $set: { read: true } });
      } else if (action === "mark_read") {
        await db.collection("admin_notifications").updateOne(
          { $or: [{ id: notificationId }, { _id: notificationId as any }] },
          { $set: { read: true } }
        );
      } else if (action === "dismiss") {
        await db.collection("admin_notifications").deleteOne({
          $or: [{ id: notificationId }, { _id: notificationId as any }],
        });
      }

      await AdminAuditHelper.record({
        adminEmail,
        action: `Notification ${action.toUpperCase()}`,
        target: notificationId,
        reason: reason || `Admin performed ${action}`,
        metadata: { notificationId, action },
      });

      return {
        success: true,
        message: `Notification action '${action}' completed.`,
        data: { notificationId, action },
        timestamp: new Date().toISOString(),
      };
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      return {
        success: false,
        message: `Notification operation failed: ${msg}`,
        error: msg,
        timestamp: new Date().toISOString(),
      };
    }
  }
}

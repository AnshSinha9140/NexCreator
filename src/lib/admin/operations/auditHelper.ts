import clientPromise from "@/lib/mongodb";
import { AuditPayload } from "./types";

export class AdminAuditHelper {
  public static async record(payload: AuditPayload): Promise<void> {
    try {
      const client = await clientPromise;
      const db = client.db(process.env.MONGODB_DB_NAME || "nexcreator");

      await db.collection("admin_audit_logs").insertOne({
        timestamp: new Date().toISOString(),
        admin: payload.adminEmail || "admin@nexcreator.com",
        action: payload.action,
        target: payload.target,
        reason: payload.reason || "Executed from Operations Control Plane",
        metadata: payload.metadata || {},
        ip: payload.ip || "127.0.0.1",
        result: "success",
      });
    } catch (e) {
      console.error("[AdminAuditHelper] Failed to record audit log:", e);
    }
  }
}

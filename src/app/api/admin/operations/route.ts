import { NextRequest, NextResponse } from "next/server";
import { verifyAdminSession } from "@/lib/adminAuth";
import { CreatorOperations } from "@/lib/admin/operations/creatorOperations";
import { CollectorOperations } from "@/lib/admin/operations/collectorOperations";
import { WorkerOperations } from "@/lib/admin/operations/workerOperations";
import { SessionOperations } from "@/lib/admin/operations/sessionOperations";
import { QueueOperations } from "@/lib/admin/operations/queueOperations";
import { NotificationOperations } from "@/lib/admin/operations/notificationOperations";
import { FeatureFlagOperations } from "@/lib/admin/operations/featureFlagOperations";

export async function POST(request: NextRequest) {
  const auth = await verifyAdminSession(request);
  if (!auth.authorized) return auth.errorResponse!;

  const adminEmail = auth.user?.email || "admin@nexcreator.com";

  try {
    const body = await request.json();
    const { domain, action, targetId, reason, options } = body;

    let result;

    switch (domain) {
      case "creator":
        result = await CreatorOperations.executeAction(action, targetId, adminEmail, reason);
        break;

      case "collector":
        result = await CollectorOperations.executeAction(action, targetId, adminEmail, reason);
        break;

      case "worker":
        result = await WorkerOperations.executeAction(action, targetId, adminEmail, reason);
        break;

      case "session":
        result = await SessionOperations.executeAction(action, targetId, adminEmail, reason);
        break;

      case "queue":
        result = await QueueOperations.executeAction(action, targetId, adminEmail, reason);
        break;

      case "notification":
        result = await NotificationOperations.executeAction(action, targetId, adminEmail, reason);
        break;

      case "feature_flag":
        result = await FeatureFlagOperations.executeAction(action, targetId, adminEmail, {
          ...(options || {}),
          reason,
        });
        break;

      default:
        return NextResponse.json(
          { success: false, error: `Unsupported operations domain: ${domain}` },
          { status: 400 }
        );
    }

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to process operations command" },
      { status: 500 }
    );
  }
}

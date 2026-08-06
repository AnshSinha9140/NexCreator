import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifySessionToken } from "@/lib/session";
import clientPromise from "@/lib/mongodb";
import { ConnectedPlatformManager } from "@/lib/connectedPlatformManager";

export async function GET(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_session")?.value;

    if (!token) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const payload = await verifySessionToken(token);
    if (!payload) {
      return NextResponse.json({ success: false, error: "Invalid session token" }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db("nexcreator");
    const user = await db.collection("users").findOne({ email: payload.email });

    if (!user) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
    }

    const platforms = user.connectedPlatforms || [];

    return NextResponse.json({
      success: true,
      platforms,
      defaultPlatform: ConnectedPlatformManager.getDefaultAccount(platforms),
      monitoredPlatforms: ConnectedPlatformManager.getMonitoredAccounts(platforms),
    });
  } catch (error: any) {
    console.warn("GET /api/platforms/connected DB fallback:", error.message);
    return NextResponse.json({
      success: true,
      platforms: [],
      defaultPlatform: null,
      monitoredPlatforms: [],
    });
  }
}

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_session")?.value;

    if (!token) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const payload = await verifySessionToken(token);
    if (!payload) {
      return NextResponse.json({ success: false, error: "Invalid session token" }, { status: 401 });
    }

    const body = await request.json();
    const { action, platform, enabled, targetId } = body;
    const account = body.account || body.verifiedMeta;

    const client = await clientPromise;
    const db = client.db("nexcreator");
    const user = await db.collection("users").findOne({ email: payload.email });

    if (!user) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
    }

    let existingPlatforms = user.connectedPlatforms || [];
    let updatedPlatforms = [...existingPlatforms];

    switch (action) {
      case "add": {
        if (!account || !account.platform || !account.username) {
          return NextResponse.json(
            { success: false, error: "Missing required account information (platform, username)" },
            { status: 400 }
          );
        }

        const platformLower = account.platform.toLowerCase();
        const existingIdx = existingPlatforms.findIndex(
          (a: any) => a.platform.toLowerCase() === platformLower
        );

        if (existingIdx >= 0) {
          // Account for this platform is already connected — update/re-sync metadata instead of throwing duplicate error
          updatedPlatforms = ConnectedPlatformManager.updateVerification(
            existingPlatforms,
            platformLower,
            account
          );
        } else {
          // Brand new account connection
          updatedPlatforms = ConnectedPlatformManager.addPlatform(existingPlatforms, account);
        }
        break;
      }

      case "remove": {
        const platformToRemove = targetId || platform;
        if (!platformToRemove) {
          return NextResponse.json({ success: false, error: "Target platform/ID required" }, { status: 400 });
        }
        updatedPlatforms = ConnectedPlatformManager.removePlatform(existingPlatforms, platformToRemove);
        break;
      }

      case "setDefault": {
        const target = targetId || platform;
        if (!target) {
          return NextResponse.json({ success: false, error: "Target platform/ID required" }, { status: 400 });
        }
        updatedPlatforms = ConnectedPlatformManager.setDefaultPlatform(existingPlatforms, target);
        break;
      }

      case "toggleMonitoring": {
        const target = targetId || platform;
        if (!target) {
          return NextResponse.json({ success: false, error: "Target platform/ID required" }, { status: 400 });
        }
        updatedPlatforms = ConnectedPlatformManager.setMonitoringEnabled(
          existingPlatforms,
          target,
          enabled ?? true
        );
        break;
      }

      case "update":
      case "reverify": {
        const target = targetId || platform || account?.platform;
        if (!target || !account) {
          return NextResponse.json({ success: false, error: "Target platform and updated account metadata required" }, { status: 400 });
        }
        updatedPlatforms = ConnectedPlatformManager.updateVerification(existingPlatforms, target, account);
        break;
      }

      default:
        return NextResponse.json({ success: false, error: `Unknown action '${action}'` }, { status: 400 });
    }

    // Save to database
    await db.collection("users").updateOne(
      { email: payload.email },
      {
        $set: {
          connectedPlatforms: updatedPlatforms,
          updatedAt: new Date(),
        },
      }
    );

    return NextResponse.json({
      success: true,
      message: "Connected platforms updated successfully",
      platforms: updatedPlatforms,
      defaultPlatform: ConnectedPlatformManager.getDefaultAccount(updatedPlatforms),
    });
  } catch (error: any) {
    console.error("Connected Platforms API Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update connected platforms" },
      { status: 400 }
    );
  }
}

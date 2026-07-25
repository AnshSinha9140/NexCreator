import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifySessionToken } from "@/lib/session";
import clientPromise from "@/lib/mongodb";

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
    const { creatorProfile, connectedPlatforms, goals } = body;

    let dbConnected = true;

    try {
      const client = await clientPromise;
      const db = client.db("nexcreator");

      const platformsList = connectedPlatforms?.platformsList || [];
      const user = await db.collection("users").findOne({ email: payload.email });
      const existingPlatforms = user?.connectedPlatforms || [];

      // Combine existing and new platforms, avoiding duplicates by ID or platform name
      const mergedPlatforms = [...existingPlatforms];
      for (const p of platformsList) {
        if (!mergedPlatforms.some((m) => m.id === p.id || m.platform === p.platform)) {
          mergedPlatforms.push(p);
        }
      }

      await db.collection("users").updateOne(
        { email: payload.email },
        {
          $set: {
            name: creatorProfile?.displayName || user?.name || payload.email.split("@")[0],
            onboardingCompleted: true,
            connectedPlatforms: mergedPlatforms,
            updatedAt: new Date(),
          },
        }
      );
    } catch (dbErr: any) {
      console.warn("Database save failed during onboarding completion:", dbErr.message);
      dbConnected = false;
    }

    return NextResponse.json({
      success: true,
      message: "Onboarding completed successfully",
      redirectTo: "/dashboard",
      dbConnected,
    });
  } catch (error: any) {
    console.error("POST /api/auth/onboarding Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to complete onboarding" },
      { status: 500 }
    );
  }
}

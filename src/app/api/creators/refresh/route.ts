import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { getYoutubeChannelStats } from "@/lib/youtube";
import { getKickChannelStats } from "@/lib/kick";

export const dynamic = "force-dynamic";

const COOLDOWN_MS = 12 * 60 * 60 * 1000; // 12 Hours in milliseconds

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("nexcreator");

    const user = await db.collection("users").findOne({ email: email.toLowerCase() });
    if (!user) {
      return NextResponse.json({ error: "Creator not found" }, { status: 404 });
    }

    const now = new Date().getTime();

    // Check YouTube Cooldown (Commented out temporarily for your development testing)
    /*
    if (user.ytStats && user.ytStats.lastUpdated) {
      const lastUpdate = new Date(user.ytStats.lastUpdated).getTime();
      if (now - lastUpdate < COOLDOWN_MS) {
        const remainingMs = COOLDOWN_MS - (now - lastUpdate);
        const remainingMinutes = Math.ceil(remainingMs / (60 * 1000));
        const remainingHours = Math.floor(remainingMinutes / 60);
        const minsStr = remainingMinutes % 60;
        
        return NextResponse.json(
          { 
            error: `API Rate Limit: Please wait before refreshing again. Cooldown remaining: ${remainingHours}h ${minsStr}m.` 
          }, 
          { status: 429 }
        );
      }
    }
    */

    // Refresh YouTube stats
    let ytStats = user.ytStats || null;
    let uploadsPlaylistId = user.uploadsPlaylistId || "";
    if (user.youtubeLink) {
      try {
        const stats = await getYoutubeChannelStats(user.youtubeLink, uploadsPlaylistId);
        ytStats = {
          ...stats,
          lastUpdated: new Date(),
        };
        // Capture new playlist ID if it wasn't saved before
        if (stats.uploadsPlaylistId) {
          uploadsPlaylistId = stats.uploadsPlaylistId;
        }
      } catch (err: any) {
        console.warn("YouTube Refresh Failed:", err.message);
      }
    }

    // Refresh Kick stats
    let kickStats = user.kickStats || null;
    if (user.kickLink) {
      try {
        const stats = await getKickChannelStats(user.kickLink);
        kickStats = {
          ...stats,
          lastUpdated: new Date(),
        };
      } catch (err: any) {
        console.warn("Kick Refresh Failed:", err.message);
      }
    }

    // Update MongoDB
    const updatedFields: any = {};
    if (ytStats) updatedFields.ytStats = ytStats;
    if (kickStats) updatedFields.kickStats = kickStats;
    if (uploadsPlaylistId) updatedFields.uploadsPlaylistId = uploadsPlaylistId;

    await db.collection("users").updateOne(
      { email: email.toLowerCase() },
      { $set: updatedFields }
    );

    const updatedUser = {
      ...user,
      ...updatedFields
    };

    return NextResponse.json({ message: "Metrics refreshed successfully", user: updatedUser });
  } catch (error: any) {
    console.error("Refresh API error:", error);
    return NextResponse.json({ error: error.message || "Failed to refresh stats" }, { status: 500 });
  }
}

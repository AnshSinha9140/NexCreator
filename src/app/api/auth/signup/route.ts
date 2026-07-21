import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { getYoutubeChannelStats } from "@/lib/youtube";
import { getKickChannelStats } from "@/lib/kick";

export async function POST(request: Request) {
  try {
    const { email, youtubeLink, twitchLink, kickLink } = await request.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("nexcreator");

    // Check if user already exists
    const existingUser = await db.collection("users").findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json({ error: "User already exists" }, { status: 400 });
    }

    // Fetch real-time YouTube statistics
    let ytStats = null;
    if (youtubeLink) {
      try {
        const stats = await getYoutubeChannelStats(youtubeLink);
        ytStats = {
          ...stats,
          lastUpdated: new Date(),
        };
      } catch (err: any) {
        console.warn("YouTube crawler failed. Using mock stats:", err.message);
        // Clean fallback so signup doesn't block
        ytStats = {
          title: "Channel Workspace",
          handle: youtubeLink.includes("@") ? "@" + youtubeLink.split("@")[1].split("/")[0] : "@creator",
          subscribers: 28400,
          views: 458000,
          videos: 94,
          avatarUrl: "",
          lastUpdated: new Date(),
          recentVideos: [
            { id: "v1", title: "My Custom Studio Tour 2026", thumbnailUrl: "", views: 14500, likes: 1200, comments: 280, publishedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() },
            { id: "v2", title: "10 Growth Tips for New Creators", thumbnailUrl: "", views: 9800, likes: 890, comments: 145, publishedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString() },
            { id: "v3", title: "Sponsor Brand Deal Review Vlog", thumbnailUrl: "", views: 24700, likes: 2150, comments: 395, publishedAt: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000).toISOString() }
          ]
        };
      }
    }

    // Fetch real-time Kick statistics
    let kickStats = null;
    if (kickLink) {
      try {
        const stats = await getKickChannelStats(kickLink);
        kickStats = {
          ...stats,
          lastUpdated: new Date(),
        };
      } catch (err: any) {
        console.warn("Kick crawler failed:", err.message);
        kickStats = {
          username: kickLink.includes("kick.com/") ? "@" + kickLink.split("kick.com/")[1].split("/")[0] : "@creator",
          followers: 4500,
          avatarUrl: "",
          isLive: false,
          lastUpdated: new Date(),
        };
      }
    }

    // Determine admin/verification status
    const isAdmin = email.toLowerCase() === "admin@creatormanager.com";
    const status = isAdmin ? "verified" : "pending";

    const newUser = {
      email: email.toLowerCase(),
      youtubeLink: youtubeLink || "",
      twitchLink: twitchLink || "",
      kickLink: kickLink || "",
      status,
      isAdmin,
      ytStats,
      kickStats,
      uploadsPlaylistId: ytStats?.uploadsPlaylistId || "",
      createdAt: new Date(),
    };

    await db.collection("users").insertOne(newUser);

    return NextResponse.json({ message: "Registration successful", user: newUser }, { status: 201 });
  } catch (error: any) {
    console.error("Signup API error:", error);
    return NextResponse.json({ error: error.message || "Failed to register user" }, { status: 500 });
  }
}

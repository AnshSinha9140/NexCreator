import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

const DEFAULT_EVENTS = [
  { id: "1", title: "Publish: Custom PC Build Vlog", type: "video", date: "2026-07-22", description: "Main channel upload with Keychron sponsorship", creatorEmail: "mrbeast@gmail.com" },
  { id: "2", title: "Sub Goal Stream Extravaganza", type: "stream", date: "2026-07-24", description: "Twitch subathon starting at 2 PM EST", creatorEmail: "mrbeast@gmail.com" },
  { id: "3", title: "Collab Stream with Shroud", type: "collab", date: "2026-07-28", description: "Play testing Valorant new update", creatorEmail: "mrbeast@gmail.com" },
];

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const creatorEmail = searchParams.get("creatorEmail");

    if (!creatorEmail) {
      return NextResponse.json([]);
    }

    const client = await clientPromise;
    const db = client.db("nexcreator");

    let events = await db.collection("events").find({ creatorEmail: creatorEmail.toLowerCase() }).toArray();

    // Seed defaults for mrbeast if empty
    if (creatorEmail.toLowerCase() === "mrbeast@gmail.com" && events.length === 0) {
      const allEvents = await db.collection("events").countDocuments();
      if (allEvents === 0) {
        await db.collection("events").insertMany(DEFAULT_EVENTS);
        events = await db.collection("events").find({ creatorEmail: "mrbeast@gmail.com" }).toArray();
      }
    }

    // Sort by date ascending
    events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return NextResponse.json(events);
  } catch (error: any) {
    console.error("Events GET API error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch calendar events" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const event = await request.json();
    const client = await clientPromise;
    const db = client.db("nexcreator");

    const newEvent = {
      ...event,
      id: Math.random().toString(36).substring(2, 9),
      creatorEmail: event.creatorEmail.toLowerCase(),
      createdAt: new Date(),
    };

    await db.collection("events").insertOne(newEvent);
    return NextResponse.json(newEvent, { status: 201 });
  } catch (error: any) {
    console.error("Events POST API error:", error);
    return NextResponse.json({ error: error.message || "Failed to schedule event" }, { status: 500 });
  }
}

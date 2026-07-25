import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifySessionToken } from "@/lib/session";
import clientPromise from "@/lib/mongodb";

export async function GET(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_session")?.value;
    const authUser = token ? await verifySessionToken(token) : null;

    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const creatorEmail = authUser.email;
    console.log(`[Auth] Authenticated User: ${creatorEmail} | Creator ID: ${authUser.userId} | Session Valid | Route: GET /api/events`);

    const client = await clientPromise;
    const db = client.db("nexcreator");

    let events = await db.collection("events").find({ creatorEmail: creatorEmail.toLowerCase() }).toArray();

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
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_session")?.value;
    const authUser = token ? await verifySessionToken(token) : null;

    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const creatorEmail = authUser.email;
    console.log(`[Auth] Authenticated User: ${creatorEmail} | Creator ID: ${authUser.userId} | Session Valid | Route: POST /api/events`);

    const event = await request.json();
    const client = await clientPromise;
    const db = client.db("nexcreator");

    const newEvent = {
      ...event,
      id: Math.random().toString(36).substring(2, 9),
      creatorEmail: creatorEmail.toLowerCase(),
      createdAt: new Date(),
    };

    await db.collection("events").insertOne(newEvent);
    return NextResponse.json(newEvent, { status: 201 });
  } catch (error: any) {
    console.error("Events POST API error:", error);
    return NextResponse.json({ error: error.message || "Failed to schedule event" }, { status: 500 });
  }
}

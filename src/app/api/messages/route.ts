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

    let targetEmail = authUser.email;

    console.log(`[Auth] Authenticated User: ${authUser.email} | Creator ID: ${authUser.userId} | Session Valid | Route: GET /api/messages`);

    const client = await clientPromise;
    const db = client.db("nexcreator");

    // Fetch all messages where targetEmail is either sender or receiver
    const messages = await db
      .collection("messages")
      .find({
        $or: [
          { senderEmail: targetEmail.toLowerCase() },
          { receiverEmail: targetEmail.toLowerCase() },
        ],
      })
      .sort({ timestamp: 1 })
      .toArray();

    return NextResponse.json(messages);
  } catch (error: any) {
    console.error("Messages GET API error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch messages" }, { status: 500 });
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

    console.log(`[Auth] Authenticated User: ${authUser.email} | Creator ID: ${authUser.userId} | Session Valid | Route: POST /api/messages`);

    const { receiverEmail, content } = await request.json();

    if (!receiverEmail || !content) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("nexcreator");

    const newMessage = {
      id: Math.random().toString(36).substring(2, 9),
      senderEmail: authUser.email.toLowerCase(),
      receiverEmail: receiverEmail.toLowerCase(),
      content,
      senderRole: authUser.role || (authUser.isAdmin ? "admin" : "creator"),
      timestamp: new Date(),
    };

    await db.collection("messages").insertOne(newMessage);
    return NextResponse.json(newMessage, { status: 201 });
  } catch (error: any) {
    console.error("Messages POST API error:", error);
    return NextResponse.json({ error: error.message || "Failed to send message" }, { status: 500 });
  }
}

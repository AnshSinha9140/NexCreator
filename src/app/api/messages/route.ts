import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const creatorEmail = searchParams.get("creatorEmail");

    if (!creatorEmail) {
      return NextResponse.json({ error: "creatorEmail is required" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("nexcreator");

    // Fetch all messages where creatorEmail is either sender or receiver
    const messages = await db
      .collection("messages")
      .find({
        $or: [
          { senderEmail: creatorEmail.toLowerCase() },
          { receiverEmail: creatorEmail.toLowerCase() },
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
    const { senderEmail, receiverEmail, content, senderRole } = await request.json();

    if (!senderEmail || !receiverEmail || !content || !senderRole) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("nexcreator");

    const newMessage = {
      id: Math.random().toString(36).substring(2, 9),
      senderEmail: senderEmail.toLowerCase(),
      receiverEmail: receiverEmail.toLowerCase(),
      content,
      senderRole,
      timestamp: new Date(),
    };

    await db.collection("messages").insertOne(newMessage);
    return NextResponse.json(newMessage, { status: 201 });
  } catch (error: any) {
    console.error("Messages POST API error:", error);
    return NextResponse.json({ error: error.message || "Failed to send message" }, { status: 500 });
  }
}

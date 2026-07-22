import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import crypto from "crypto";

export const dynamic = "force-dynamic";

// Kick sends a verification challenge when you first subscribe
// We must respond with the challenge string to confirm the endpoint

// POST /api/kick/webhook - receives live chat messages from Kick EventSub
export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    const body = JSON.parse(rawBody);

    // Kick EventSub sends a verification challenge on first subscription
    if (body.challenge) {
      console.log("✅ Kick EventSub verification challenge received. Responding...");
      return new Response(body.challenge, {
        status: 200,
        headers: { "Content-Type": "text/plain" }
      });
    }

    // Real chat message event
    const event = body.event;
    const subscription = body.subscription;

    if (!event || subscription?.name !== "chat.message.sent") {
      return NextResponse.json({ received: true });
    }

    const broadcasterUserId = String(event.broadcaster_user_id || "");
    const senderUsername = event.sender?.username || event.chatter?.username || "Viewer";
    const messageContent = event.content || event.message?.content || "";
    const messageId = event.message_id || event.id || `${Date.now()}`;
    const timestamp = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    if (!messageContent.trim() || !broadcasterUserId) {
      return NextResponse.json({ received: true });
    }

    const formattedMessage = `${senderUsername} [${timestamp}]: ${messageContent}`;

    console.log(`📨 Kick chat [${broadcasterUserId}]: ${formattedMessage}`);

    // Buffer message in MongoDB (TTL: 10 minutes)
    const client = await clientPromise;
    const db = client.db("nexcreator");

    await db.collection("kick_chat_buffer").insertOne({
      broadcasterUserId,
      messageId,
      formattedMessage,
      senderUsername,
      content: messageContent,
      receivedAt: new Date(),
      expiresAt: new Date(Date.now() + 10 * 60 * 1000) // expire in 10 minutes
    });

    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error("Kick Webhook Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// GET /api/kick/webhook - health check
export async function GET() {
  return NextResponse.json({ status: "Kick EventSub webhook is active ✅" });
}

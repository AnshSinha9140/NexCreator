import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export const dynamic = "force-dynamic";

// GET /api/kick/chat?broadcasterUserId=XXX&since=ISO_TIMESTAMP
// Browser polls this every 5 seconds to get new buffered chat messages
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const broadcasterUserId = searchParams.get("broadcasterUserId");
    const since = searchParams.get("since");

    if (!broadcasterUserId) {
      return NextResponse.json({ error: "broadcasterUserId is required" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("nexcreator");

    const query: any = { broadcasterUserId };
    if (since) {
      query.receivedAt = { $gt: new Date(since) };
    }

    const messages = await db
      .collection("kick_chat_buffer")
      .find(query)
      .sort({ receivedAt: 1 })
      .limit(100)
      .toArray();

    const formatted = messages.map((m) => m.formattedMessage as string);

    return NextResponse.json({
      messages: formatted,
      count: formatted.length,
      lastTimestamp: messages.length > 0
        ? messages[messages.length - 1].receivedAt.toISOString()
        : since || new Date().toISOString()
    });
  } catch (err: any) {
    console.error("Kick Chat Buffer Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// DELETE /api/kick/chat?broadcasterUserId=XXX
// Clears the buffer after Gemini evaluation
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const broadcasterUserId = searchParams.get("broadcasterUserId");

    if (!broadcasterUserId) {
      return NextResponse.json({ error: "broadcasterUserId is required" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("nexcreator");
    await db.collection("kick_chat_buffer").deleteMany({ broadcasterUserId });

    return NextResponse.json({ success: true, message: "Chat buffer cleared" });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

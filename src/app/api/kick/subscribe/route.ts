import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { getOfficialKickToken } from "@/lib/kick";

export const dynamic = "force-dynamic";

// POST /api/kick/subscribe
// Registers our Vercel webhook URL with Kick's EventSub API for a broadcaster
export async function POST(request: Request) {
  try {
    const { broadcasterUserId, webhookUrl } = await request.json();

    if (!broadcasterUserId || !webhookUrl) {
      return NextResponse.json(
        { error: "broadcasterUserId and webhookUrl are required" },
        { status: 400 }
      );
    }

    const token = await getOfficialKickToken();
    if (!token) {
      return NextResponse.json(
        { error: "Failed to get Kick OAuth token. Check KICK_CLIENT_ID and KICK_CLIENT_SECRET." },
        { status: 500 }
      );
    }

    // Subscribe to chat.message.sent via Kick EventSub
    const subscribeRes = await fetch("https://api.kick.com/public/v1/events/subscriptions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify({
        method: "webhook",
        events: [
          {
            name: "chat.message.sent",
            version: 1
          }
        ],
        broadcaster_user_id: Number(broadcasterUserId),
        webhook_url: webhookUrl
      })
    });

    const subscribeData = await subscribeRes.json();

    if (!subscribeRes.ok) {
      console.error("Kick EventSub subscribe error:", subscribeData);
      return NextResponse.json(
        { error: "Kick EventSub subscription failed", details: subscribeData },
        { status: subscribeRes.status }
      );
    }

    // Store active subscription in MongoDB
    const client = await clientPromise;
    const db = client.db("nexcreator");
    await db.collection("kick_subscriptions").updateOne(
      { broadcasterUserId: String(broadcasterUserId) },
      {
        $set: {
          broadcasterUserId: String(broadcasterUserId),
          webhookUrl,
          subscriptionData: subscribeData,
          active: true,
          createdAt: new Date()
        }
      },
      { upsert: true }
    );

    return NextResponse.json({
      success: true,
      message: `✅ Subscribed to chat.message.sent for broadcaster ${broadcasterUserId}`,
      data: subscribeData
    });
  } catch (err: any) {
    console.error("Kick Subscribe Error:", err);
    return NextResponse.json({ error: err.message || "Failed to subscribe" }, { status: 500 });
  }
}

// DELETE /api/kick/subscribe?broadcasterUserId=XXX
// Unsubscribes from Kick EventSub
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const broadcasterUserId = searchParams.get("broadcasterUserId");

    if (!broadcasterUserId) {
      return NextResponse.json({ error: "broadcasterUserId is required" }, { status: 400 });
    }

    const token = await getOfficialKickToken();
    if (!token) {
      return NextResponse.json({ error: "Failed to get Kick OAuth token" }, { status: 500 });
    }

    // Get subscriptions from Kick API
    const listRes = await fetch("https://api.kick.com/public/v1/events/subscriptions", {
      headers: {
        "Authorization": `Bearer ${token}`,
        "Accept": "application/json"
      }
    });

    if (listRes.ok) {
      const listData = await listRes.json();
      const subs = listData.data || [];

      for (const sub of subs) {
        if (String(sub.broadcaster_user_id) === String(broadcasterUserId)) {
          await fetch(`https://api.kick.com/public/v1/events/subscriptions?id=${sub.id}`, {
            method: "DELETE",
            headers: {
              "Authorization": `Bearer ${token}`
            }
          });
        }
      }
    }

    // Remove from MongoDB
    const client = await clientPromise;
    const db = client.db("nexcreator");
    await db.collection("kick_subscriptions").deleteOne({ broadcasterUserId });

    return NextResponse.json({ success: true, message: "Unsubscribed successfully" });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to unsubscribe" }, { status: 500 });
  }
}

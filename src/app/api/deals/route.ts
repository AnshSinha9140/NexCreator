import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

const DEFAULT_DEALS = [
  { id: "1", title: "Apex Legends Stream Sponsor", brand: "EA", platform: "Twitch", payout: 5000, status: "signed", date: "2026-07-25", creatorEmail: "mrbeast@gmail.com" },
  { id: "2", title: "VPN Sponsorship Integration", brand: "NordVPN", platform: "YouTube", payout: 3500, status: "completed", date: "2026-07-15", creatorEmail: "mrbeast@gmail.com" },
  { id: "3", title: "Keyboard Review Promo", brand: "Keychron", platform: "YouTube", payout: 1200, status: "negotiating", date: "2026-08-02", creatorEmail: "mrbeast@gmail.com" },
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

    // Fetch deals only for the requested creator
    let deals = await db.collection("deals").find({ creatorEmail: creatorEmail.toLowerCase() }).toArray();

    // If mrbeast is logging in for the first time and database is empty, seed defaults
    if (creatorEmail.toLowerCase() === "mrbeast@gmail.com" && deals.length === 0) {
      const allDeals = await db.collection("deals").countDocuments();
      if (allDeals === 0) {
        await db.collection("deals").insertMany(DEFAULT_DEALS);
        deals = await db.collection("deals").find({ creatorEmail: "mrbeast@gmail.com" }).toArray();
      }
    }

    return NextResponse.json(deals);
  } catch (error: any) {
    console.error("Deals GET API error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch brand deals" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const deal = await request.json();
    const client = await clientPromise;
    const db = client.db("nexcreator");

    const newDeal = {
      ...deal,
      id: Math.random().toString(36).substring(2, 9),
      creatorEmail: deal.creatorEmail.toLowerCase(),
      createdAt: new Date(),
    };

    await db.collection("deals").insertOne(newDeal);
    return NextResponse.json(newDeal, { status: 201 });
  } catch (error: any) {
    console.error("Deals POST API error:", error);
    return NextResponse.json({ error: error.message || "Failed to create brand deal" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const { id, status } = await request.json();

    if (!id || !status) {
      return NextResponse.json({ error: "Id and status are required" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("nexcreator");

    const result = await db.collection("deals").updateOne(
      { id: id.toString() },
      { $set: { status } }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Deal not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Deal status updated successfully" });
  } catch (error: any) {
    console.error("Deals PATCH API error:", error);
    return NextResponse.json({ error: error.message || "Failed to update deal status" }, { status: 500 });
  }
}

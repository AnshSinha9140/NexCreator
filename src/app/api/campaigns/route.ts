import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

const DEFAULT_CAMPAIGNS = [
  { id: "c1", title: "NordVPN Q3 Launch Promo", brand: "NordVPN", payout: 4500, description: "60-second dedicated integration highlighting the new Threat Protection feature.", spotsLeft: 5 },
  { id: "c2", title: "Raid: Shadow Legends Campaign", brand: "Plarium", payout: 6500, description: "Direct video integration discussing the new champion drop. Must include referral QR code.", spotsLeft: 3 },
  { id: "c3", title: "Keychron K2 Keyboard Review", brand: "Keychron", payout: 2000, description: "Vlog showcase or hardware review of the new mechanical keyboard series.", spotsLeft: 8 },
];

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("nexcreator");

    let campaigns = await db.collection("campaigns").find({}).toArray();

    if (campaigns.length === 0) {
      await db.collection("campaigns").insertMany(DEFAULT_CAMPAIGNS);
      campaigns = await db.collection("campaigns").find({}).toArray();
    }

    return NextResponse.json(campaigns);
  } catch (error: any) {
    console.error("Campaigns GET API error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch global campaigns" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const campaign = await request.json();
    const client = await clientPromise;
    const db = client.db("nexcreator");

    const newCampaign = {
      ...campaign,
      id: Math.random().toString(36).substring(2, 9),
      spotsLeft: Number(campaign.spotsLeft || 5),
      createdAt: new Date(),
    };

    await db.collection("campaigns").insertOne(newCampaign);
    return NextResponse.json(newCampaign, { status: 201 });
  } catch (error: any) {
    console.error("Campaigns POST API error:", error);
    return NextResponse.json({ error: error.message || "Failed to create campaign" }, { status: 500 });
  }
}

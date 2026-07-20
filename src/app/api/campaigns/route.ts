import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("nexcreator");

    const campaigns = await db.collection("campaigns").find({}).toArray();

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

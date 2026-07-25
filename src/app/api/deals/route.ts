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
    console.log(`[Auth] Authenticated User: ${creatorEmail} | Creator ID: ${authUser.userId} | Session Valid | Route: GET /api/deals`);

    const client = await clientPromise;
    const db = client.db("nexcreator");

    // Fetch deals only for the requested creator
    let deals = await db.collection("deals").find({ creatorEmail: creatorEmail.toLowerCase() }).toArray();

    return NextResponse.json(deals);
  } catch (error: any) {
    console.error("Deals GET API error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch brand deals" }, { status: 500 });
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
    console.log(`[Auth] Authenticated User: ${creatorEmail} | Creator ID: ${authUser.userId} | Session Valid | Route: POST /api/deals`);

    const deal = await request.json();
    const client = await clientPromise;
    const db = client.db("nexcreator");

    const newDeal = {
      ...deal,
      id: Math.random().toString(36).substring(2, 9),
      creatorEmail: creatorEmail.toLowerCase(),
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

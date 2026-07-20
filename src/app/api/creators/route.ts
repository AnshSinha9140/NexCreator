import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export const dynamic = "force-dynamic"; // Prevents Vercel from caching the creators list at build time

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("nexcreator");

    const users = await db.collection("users").find({}).toArray();
    return NextResponse.json(users);
  } catch (error: any) {
    console.error("Creators GET API error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch creators" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const { email, status } = await request.json();

    if (!email || !status) {
      return NextResponse.json({ error: "Email and status are required" }, { status: 400 });
    }

    if (status !== "verified" && status !== "rejected" && status !== "pending") {
      return NextResponse.json({ error: "Invalid status value" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("nexcreator");

    const result = await db.collection("users").updateOne(
      { email: email.toLowerCase() },
      { $set: { status } }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Creator not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Creator status updated successfully" });
  } catch (error: any) {
    console.error("Creators PATCH API error:", error);
    return NextResponse.json({ error: error.message || "Failed to update status" }, { status: 500 });
  }
}

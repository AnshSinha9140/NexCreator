import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("nexcreator");

    let user: any = await db.collection("users").findOne({ email: email.toLowerCase() });

    if (!user) {
      // Auto-register admin to keep demo smooth
      if (email.toLowerCase().includes("admin")) {
        const isAdmin = true;
        const status = "verified";
        const newAdmin = {
          email: email.toLowerCase(),
          status,
          isAdmin,
          createdAt: new Date(),
        };
        await db.collection("users").insertOne(newAdmin);
        user = newAdmin;
      } else {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }
    }

    return NextResponse.json({ message: "Login successful", user });
  } catch (error: any) {
    console.error("Login API error:", error);
    return NextResponse.json({ error: error.message || "Failed to log in" }, { status: 500 });
  }
}

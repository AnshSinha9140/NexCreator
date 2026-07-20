import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function POST(request: Request) {
  try {
    const { email, youtubeLink, twitchLink, kickLink } = await request.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("nexcreator");

    // Check if user already exists
    const existingUser = await db.collection("users").findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json({ error: "User already exists" }, { status: 400 });
    }

    // Determine admin/verification status
    const isAdmin = email.toLowerCase() === "admin@creatormanager.com";
    const status = isAdmin ? "verified" : "pending";

    const newUser = {
      email: email.toLowerCase(),
      youtubeLink: youtubeLink || "",
      twitchLink: twitchLink || "",
      kickLink: kickLink || "",
      status,
      isAdmin,
      createdAt: new Date(),
    };

    await db.collection("users").insertOne(newUser);

    return NextResponse.json({ message: "Registration successful", user: newUser }, { status: 201 });
  } catch (error: any) {
    console.error("Signup API error:", error);
    return NextResponse.json({ error: error.message || "Failed to register user" }, { status: 500 });
  }
}

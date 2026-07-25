import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifySessionToken } from "@/lib/session";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_session")?.value;

    if (!token) {
      return NextResponse.json({ success: false, user: null }, { status: 401 });
    }

    const payload = await verifySessionToken(token);
    if (!payload) {
      return NextResponse.json({ success: false, user: null }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db("nexcreator");

    let query: any = { email: payload.email };
    if (payload.userId && ObjectId.isValid(payload.userId)) {
      query = { _id: new ObjectId(payload.userId) };
    }

    const user = await db.collection("users").findOne(query);

    if (!user) {
      return NextResponse.json({ success: false, user: null }, { status: 404 });
    }

    const userResponse = {
      id: user._id.toString(),
      name: user.name || user.email.split("@")[0],
      email: user.email,
      role: user.role || (user.isAdmin ? "admin" : "creator"),
      onboardingCompleted: !!user.onboardingCompleted,
      status: user.status || "verified",
      isAdmin: !!user.isAdmin,
      createdAt: user.createdAt || new Date(),
    };

    return NextResponse.json({
      success: true,
      user: userResponse,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: "Failed to verify session" },
      { status: 500 }
    );
  }
}

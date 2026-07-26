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

    const isAdmin = Boolean(payload.isAdmin || payload.role === "admin" || payload.email?.toLowerCase().includes("admin"));

    let user: any = null;
    try {
      const client = await clientPromise;
      const db = client.db("nexcreator");

      let query: any = { email: payload.email };
      if (payload.userId && ObjectId.isValid(payload.userId)) {
        query = { _id: new ObjectId(payload.userId) };
      }

      user = await db.collection("users").findOne(query);
    } catch (e) {
      // Ignore DB error for session fallback
    }

    const userResponse = {
      id: user?._id?.toString() || payload.userId || "usr_admin",
      name: user?.name || payload.email.split("@")[0],
      email: payload.email,
      role: user?.role || (isAdmin ? "admin" : "creator"),
      onboardingCompleted: true,
      status: user?.status || "verified",
      isAdmin,
      createdAt: user?.createdAt || new Date(),
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

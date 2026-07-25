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
    console.log(`[Auth] Authenticated User: ${creatorEmail} | Creator ID: ${authUser.userId} | Session Valid | Route: GET /api/tasks`);

    const client = await clientPromise;
    const db = client.db("nexcreator");

    let tasks = await db.collection("tasks").find({ creatorEmail: creatorEmail.toLowerCase() }).toArray();

    return NextResponse.json(tasks);
  } catch (error: any) {
    console.error("Tasks GET API error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch collaborator tasks" }, { status: 500 });
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
    console.log(`[Auth] Authenticated User: ${creatorEmail} | Creator ID: ${authUser.userId} | Session Valid | Route: POST /api/tasks`);

    const task = await request.json();
    const client = await clientPromise;
    const db = client.db("nexcreator");

    const newTask = {
      ...task,
      id: Math.random().toString(36).substring(2, 9),
      creatorEmail: creatorEmail.toLowerCase(),
      createdAt: new Date(),
    };

    await db.collection("tasks").insertOne(newTask);
    return NextResponse.json(newTask, { status: 201 });
  } catch (error: any) {
    console.error("Tasks POST API error:", error);
    return NextResponse.json({ error: error.message || "Failed to assign task" }, { status: 500 });
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

    const result = await db.collection("tasks").updateOne(
      { id: id.toString() },
      { $set: { status } }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Task status updated successfully" });
  } catch (error: any) {
    console.error("Tasks PATCH API error:", error);
    return NextResponse.json({ error: error.message || "Failed to update task status" }, { status: 500 });
  }
}

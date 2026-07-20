import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

const DEFAULT_TASKS = [
  { id: "1", title: "Color Grade Vlog Footage", role: "Editor", status: "in-progress", videoTitle: "Custom PC Build Vlog", creatorEmail: "mrbeast@gmail.com" },
  { id: "2", title: "Design High-CTR Thumbnail", role: "Designer", status: "todo", videoTitle: "Custom PC Build Vlog", creatorEmail: "mrbeast@gmail.com" },
  { id: "3", title: "Write Intro Script Hooks", role: "Writer", status: "done", videoTitle: "Custom PC Build Vlog", creatorEmail: "mrbeast@gmail.com" },
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

    let tasks = await db.collection("tasks").find({ creatorEmail: creatorEmail.toLowerCase() }).toArray();

    // Seed defaults for mrbeast if empty
    if (creatorEmail.toLowerCase() === "mrbeast@gmail.com" && tasks.length === 0) {
      const allTasks = await db.collection("tasks").countDocuments();
      if (allTasks === 0) {
        await db.collection("tasks").insertMany(DEFAULT_TASKS);
        tasks = await db.collection("tasks").find({ creatorEmail: "mrbeast@gmail.com" }).toArray();
      }
    }

    return NextResponse.json(tasks);
  } catch (error: any) {
    console.error("Tasks GET API error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch collaborator tasks" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const task = await request.json();
    const client = await clientPromise;
    const db = client.db("nexcreator");

    const newTask = {
      ...task,
      id: Math.random().toString(36).substring(2, 9),
      creatorEmail: task.creatorEmail.toLowerCase(),
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

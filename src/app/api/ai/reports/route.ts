import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { cookies } from "next/headers";
import { verifySessionToken } from "@/lib/session";
import { ExecutiveProducer } from "@/lib/ai/executiveProducer";

async function getAuthUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_session")?.value;
  if (!token) return null;
  return await verifySessionToken(token);
}

// GET /api/ai/reports?sessionId=xxx  OR  ?mode=history
export async function GET(req: NextRequest) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get("sessionId");
    const mode = searchParams.get("mode"); // "history"

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB_NAME || "nexcreator");

    // 1. Fetch report history
    if (mode === "history" || !sessionId) {
      const reports = await db.collection("executive_reports")
        .find({ creatorId: authUser.email })
        .sort({ createdAt: -1 })
        .limit(20)
        .toArray();

      return NextResponse.json({ success: true, reports });
    }

    // 2. Fetch or generate report for a specific session
    const existing = await db.collection("executive_reports").findOne({
      sessionId,
      creatorId: authUser.email,
    });

    if (existing) {
      return NextResponse.json({ success: true, report: existing, cached: true });
    }

    // 3. Verify session belongs to this creator and is completed
    const session = await db.collection("monitoring_sessions").findOne({
      id: sessionId,
      userId: authUser.email,
    });

    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    // Generate report (works for any session, not just completed)
    const report = await ExecutiveProducer.generateReport(sessionId, authUser.email);

    return NextResponse.json({ success: true, report, cached: false });
  } catch (error: any) {
    console.error("[API] Error fetching executive report:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// POST /api/ai/reports — Force regenerate
export async function POST(req: NextRequest) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { sessionId } = body;

    if (!sessionId) {
      return NextResponse.json({ error: "Missing sessionId" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB_NAME || "nexcreator");

    // Delete existing report to force regeneration
    await db.collection("executive_reports").deleteOne({
      sessionId,
      creatorId: authUser.email,
    });

    const report = await ExecutiveProducer.generateReport(sessionId, authUser.email);

    return NextResponse.json({ success: true, report });
  } catch (error: any) {
    console.error("[API] Error generating executive report:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// PATCH /api/ai/reports — Update metadata (favorite, action items)
export async function PATCH(req: NextRequest) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { reportId, isFavorited, actionItemId, actionCompleted } = body;

    if (!reportId) {
      return NextResponse.json({ error: "Missing reportId" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB_NAME || "nexcreator");

    const updates: any = { updatedAt: new Date().toISOString() };

    if (isFavorited !== undefined) {
      updates.isFavorited = isFavorited;
    }

    // Update individual action item
    if (actionItemId !== undefined && actionCompleted !== undefined) {
      const report = await db.collection("executive_reports").findOne({
        id: reportId,
        creatorId: authUser.email,
      });

      if (report) {
        const updatedPlan = (report.actionPlan || []).map((item: any) =>
          item.id === actionItemId ? { ...item, isCompleted: actionCompleted } : item
        );
        updates.actionPlan = updatedPlan;
      }
    }

    await db.collection("executive_reports").updateOne(
      { id: reportId, creatorId: authUser.email },
      { $set: updates }
    );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("[API] Error updating executive report:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// DELETE /api/ai/reports
export async function DELETE(req: NextRequest) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const reportId = searchParams.get("reportId");

    if (!reportId) {
      return NextResponse.json({ error: "Missing reportId" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB_NAME || "nexcreator");

    await db.collection("executive_reports").deleteOne({
      id: reportId,
      creatorId: authUser.email,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("[API] Error deleting executive report:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

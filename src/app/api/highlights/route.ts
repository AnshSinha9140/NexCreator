import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifySessionToken } from "@/lib/session";
import clientPromise from "@/lib/mongodb";
import { EditorialHighlightComposer } from "@/lib/highlights/editorialStudio";
import { HighlightCandidate } from "@/lib/highlights/generator";

async function getAuthUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_session")?.value;
  if (!token) return null;
  return await verifySessionToken(token);
}

// GET /api/highlights?sessionId=XYZ (Fetch production highlight candidates and compose Editorial Highlights)
export async function GET(request: Request) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("sessionId");

    if (!sessionId) {
      return NextResponse.json({ error: "sessionId is required" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("nexcreator");

    const rawCandidates = (await db
      .collection("highlight_candidates")
      .find({ sessionId })
      .sort({ createdAt: -1 })
      .limit(50)
      .toArray()) as unknown as HighlightCandidate[];

    // Compose Editorial Studio Highlights & Senior Editor's Report
    const { highlights: editorialHighlights, report: editorsReport } = EditorialHighlightComposer.composeFromCandidates(rawCandidates);

    return NextResponse.json({
      success: true,
      sessionId,
      highlights: rawCandidates,
      editorialHighlights,
      editorsReport,
    });
  } catch (error: any) {
    console.error("[API] GET /api/highlights error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch highlights" }, { status: 500 });
  }
}


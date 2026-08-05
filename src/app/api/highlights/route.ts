import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifySessionToken } from "@/lib/session";
import { SessionIntelligenceEngine } from "@/lib/intelligence/SessionIntelligenceEngine";

async function getAuthUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_session")?.value;
  if (!token) return null;
  return await verifySessionToken(token);
}

// GET /api/highlights?sessionId=XYZ (Fetch canonical highlights from SessionIntelligence)
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

    // Fetch canonical intelligence (AI executes once, read anywhere)
    const sessionIntelligence = await SessionIntelligenceEngine.generate(
      sessionId,
      authUser.email
    );

    const highlights = sessionIntelligence.highlights;
    const publishing = sessionIntelligence.publishing;

    // Senior Editor Report summary from canonical data
    const editorsReport = {
      summary: publishing.executiveBrief.summaryText,
      totalYieldScore: sessionIntelligence.executiveSummary.overallScore,
      topRecommendedPlatform: highlights[0]?.publishingPackage?.bestPlatform || "YouTube Shorts",
      highestPriorityAction: publishing.executiveBrief.highestPriorityAction,
      streamHighlightsCount: highlights.length,
      shortsCandidateCount: publishing.executiveBrief.shortsCount,
    };

    return NextResponse.json({
      success: true,
      sessionId,
      highlights,
      editorialHighlights: highlights,
      editorsReport,
      publishing,
      sessionIntelligence,
    });
  } catch (error: any) {
    console.error("[API] GET /api/highlights error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch highlights" }, { status: 500 });
  }
}

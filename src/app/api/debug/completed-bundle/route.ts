import { NextResponse } from "next/server";
import { CompletedSessionBundleLoader } from "@/lib/session/completedBundle";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("sessionId");

    if (!sessionId) {
      return NextResponse.json({ error: "Missing required 'sessionId' parameter" }, { status: 400 });
    }

    const bundle = await CompletedSessionBundleLoader.load(sessionId);
    if (!bundle) {
      return NextResponse.json({
        bundleExists: false,
        sessionId,
      }, { status: 404 });
    }

    return NextResponse.json({
      bundleExists: true,
      sessionId: bundle.sessionId,
      bundleSize: JSON.stringify(bundle).length,
      messagesCount: bundle.chatArchive.length,
      timelineEventsCount: bundle.timeline.events.length,
      highlightsCount: bundle.highlights.length,
      aiReportsCount: bundle.aiReport ? 1 : 0,
      creatorReport: Boolean(bundle.creatorIntelligence),
      integrityPercent: bundle.integrityReport?.overallIntegrityPercent || 0,
      bundleVersion: bundle.metadata.bundleVersion,
      createdAt: bundle.metadata.createdAt,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

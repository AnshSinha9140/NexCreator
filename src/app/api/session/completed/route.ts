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
      return NextResponse.json({ error: `CompletedSessionBundle for session '${sessionId}' not found` }, { status: 404 });
    }

    return NextResponse.json(bundle);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

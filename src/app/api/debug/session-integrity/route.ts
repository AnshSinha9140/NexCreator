import { NextResponse } from "next/server";
import { SessionArtifactValidator } from "@/lib/session/artifactValidator";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("sessionId");

    if (!sessionId) {
      return NextResponse.json({ error: "Missing required 'sessionId' parameter" }, { status: 400 });
    }

    const report = await SessionArtifactValidator.validate(sessionId);
    return NextResponse.json(report);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

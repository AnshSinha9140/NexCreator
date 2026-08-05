import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifySessionToken } from "@/lib/session";
import { resolveCreator } from "@/lib/creatorAudit/persistence";
import { getCreatorDNA, saveCreatorDNA } from "@/lib/creatorDNA/CreatorDNAMemory";
import { applyCreatorFeedback } from "@/lib/creatorDNA/CreatorDNAUpdater";
import { CreatorDNAFeedback, CreatorFeedbackResponse } from "@/lib/creatorDNA/CreatorDNATypes";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const token = (await cookies()).get("auth_session")?.value;
  const auth = token ? await verifySessionToken(token) : null;
  if (!auth) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => null);
  const allowed: CreatorFeedbackResponse[] = ["agree", "disagree", "needs_more_evidence"];
  if (!body?.field || !allowed.includes(body.response)) {
    return NextResponse.json({ success: false, error: "field and a valid response are required" }, { status: 400 });
  }

  const resolved = await resolveCreator(auth.userId || auth.email);
  if (!resolved.canonicalCreatorId) return NextResponse.json({ success: false, error: "Creator not found" }, { status: 404 });
  const dna = await getCreatorDNA(resolved.canonicalCreatorId);
  if (!dna) return NextResponse.json({ success: false, error: "Creator DNA has not been initialized" }, { status: 404 });

  const feedback: CreatorDNAFeedback = {
    id: crypto.randomUUID(),
    field: body.field,
    response: body.response,
    note: typeof body.note === "string" ? body.note.slice(0, 500) : undefined,
    createdAt: new Date().toISOString(),
  };
  const updated = await saveCreatorDNA(applyCreatorFeedback(dna, feedback));
  return NextResponse.json({ success: true, creatorDNA: updated });
}

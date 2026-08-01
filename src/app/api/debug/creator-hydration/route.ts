import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifySessionToken } from "@/lib/session";
import { getCreatorHydration } from "@/lib/creatorAudit/persistence";

export const dynamic = "force-dynamic";
export async function GET(request: NextRequest) {
  const token = (await cookies()).get("auth_session")?.value;
  const auth = token ? await verifySessionToken(token) : null;
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const id = auth.isAdmin ? new URL(request.url).searchParams.get("creatorId") || auth.userId : auth.userId || auth.email;
  const data = await getCreatorHydration(id || auth.email);
  const profile = data.profile as any;
  const creator = data.creator as any;
  const missingDependencies = [!creator && "creator", !profile && "creatorManagerProfile", !data.relationshipMemory && "relationshipMemory", !profile?.audit?.executiveLetter && "executiveLetter"].filter(Boolean);
  return NextResponse.json({ creatorFound: Boolean(creator), creatorStatus: creator?.status || null, creatorProfileFound: Boolean(profile), creatorProfileId: profile?._id?.toString() || null, relationshipMemoryFound: Boolean(data.relationshipMemory), onboardingCompleted: Boolean(profile?.onboardingCompleted), dashboardHydrated: missingDependencies.length === 0, usingFallbackContent: !profile, missingDependencies, pipelineStage: profile ? (profile.onboardingCompleted ? "dashboard" : "onboarding") : "missing_profile", lastUpdated: profile?.updatedAt || creator?.updatedAt || null });
}

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifySessionToken } from "@/lib/session";
import { WorkspaceStateService } from "@/lib/manager/workspaceState";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_session")?.value;
    if (!token) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const auth = await verifySessionToken(token);
    if (!auth || !auth.email) {
      return NextResponse.json({ success: false, error: "Invalid session" }, { status: 401 });
    }

    const state = await WorkspaceStateService.getWorkspaceState(auth.email);

    return NextResponse.json({
      success: true,
      workspaceState: state,
    });
  } catch (err: any) {
    console.error("[API] GET /api/workspace/state error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to fetch workspace state" },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifySessionToken } from "@/lib/session";
import { DiagnosticsState } from "@/lib/diagnostics/state";

export async function GET(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_session")?.value;
    const authUser = token ? await verifySessionToken(token) : null;

    if (!authUser || !authUser.isAdmin) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const state = DiagnosticsState.getState();

    return NextResponse.json(state, { status: 200 });
  } catch (error: any) {
    console.error("Pipeline API error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch pipeline state" }, { status: 500 });
  }
}

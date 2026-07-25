import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifySessionToken } from "@/lib/session";
import { DiagnosticsState } from "@/lib/diagnostics/state";
import { DiagnosticsLogger } from "@/lib/diagnostics/logger";

async function handleReset() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_session")?.value;
    const authUser = token ? await verifySessionToken(token) : null;

    if (!authUser || !authUser.isAdmin) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    DiagnosticsState.resetSessionState(authUser.email, authUser.userId);
    DiagnosticsLogger.log("DebugAPI", "Reset", `State reset by ${authUser.email}`);

    return NextResponse.json({ success: true, message: "Diagnostic state reset successfully." }, { status: 200 });
  } catch (error: any) {
    console.error("Reset API error:", error);
    return NextResponse.json({ error: error.message || "Failed to reset state" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  return handleReset();
}

export async function GET(request: Request) {
  return handleReset();
}

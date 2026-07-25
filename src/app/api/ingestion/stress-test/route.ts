import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifySessionToken } from "@/lib/session";
import { IngestionStressTester } from "@/lib/ingestion/stressTest";

async function getAuthUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_session")?.value;
  if (!token) return null;
  return await verifySessionToken(token);
}

// GET /api/ingestion/stress-test?rate=1000&duration=5 (Run chat ingestion benchmark)
export async function GET(request: Request) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const rate = Math.min(Math.max(Number(searchParams.get("rate")) || 1000, 100), 50000);
    const duration = Math.min(Math.max(Number(searchParams.get("duration")) || 5, 1), 30);

    console.log(`[StressTest API] Executing benchmark: ${rate} msgs/min for ${duration}s...`);

    const result = IngestionStressTester.runTest({
      messagesPerMinute: rate,
      durationSeconds: duration,
    });

    return NextResponse.json({
      success: true,
      benchmark: result,
    });
  } catch (error: any) {
    console.error("GET /api/ingestion/stress-test Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to execute stress test benchmark" },
      { status: 500 }
    );
  }
}

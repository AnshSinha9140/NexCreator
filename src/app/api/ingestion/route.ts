import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifySessionToken } from "@/lib/session";
import { IngestionManager } from "@/lib/ingestion/manager";
import clientPromise from "@/lib/mongodb";
import { createApiErrorResponse, safeApiHandler, validateSessionOwnership } from "@/lib/security";
import { validateQueryParam } from "@/lib/validation";

async function getAuthUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_session")?.value;
  if (!token) return null;
  return await verifySessionToken(token);
}

// GET /api/ingestion?sessionId=XYZ (Fetch lightweight chat ingestion telemetry)
export const GET = safeApiHandler(async (request: Request) => {
  const authUser = await getAuthUser();
  if (!authUser) {
    return createApiErrorResponse("Unauthorized access", "UNAUTHORIZED", 401);
  }

  const sessionId = validateQueryParam(request.url, "sessionId", true);

  // IDOR Protection: Validate session belongs to authenticated user
  const client = await clientPromise;
  const db = client.db("nexcreator");
  const ownership = await validateSessionOwnership(db, sessionId, authUser.email);

  if (!ownership.isValid) {
    return createApiErrorResponse(
      "Forbidden: Monitoring Session not found or unauthorized access",
      "FORBIDDEN",
      403
    );
  }

  const telemetry = IngestionManager.getTelemetry(sessionId);

  return NextResponse.json({
    success: true,
    telemetry: {
      sessionId: telemetry.sessionId,
      isIngesting: telemetry.isIngesting,
      platform: telemetry.platform || "kick",
      status: telemetry.status,
      health: telemetry.health,
      connectionState: telemetry.connectionState,
      bufferSize: telemetry.bufferSize,
      bufferCapacity: telemetry.bufferCapacity || 5000,
      messagesPerMinute: telemetry.messagesPerMinute,
      stats: telemetry.stats,
      metricsSummary: telemetry.metricsSummary,
      startedAt: telemetry.startedAt || null,
    },
  });
});

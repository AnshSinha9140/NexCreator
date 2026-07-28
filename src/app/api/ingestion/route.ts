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

  const telemetry = IngestionManager.getTelemetry(sessionId) || {};
  const pipeline = IngestionManager.getPipeline(sessionId);
  let liveMessages = pipeline ? pipeline.buffer.getMessages().slice(-100) : [];

  if (liveMessages.length === 0) {
    // Fallback: Query representativeMessages collection from DB
    const dbMessages = await db
      .collection("representativeMessages")
      .find({ sessionId })
      .sort({ timestamp: -1 })
      .limit(50)
      .toArray();

    liveMessages = dbMessages.map((m: any) => ({
      id: m.id || m._id?.toString() || Math.random().toString(36).substring(2, 9),
      sessionId: m.sessionId || sessionId,
      platform: m.platform || telemetry.platform || "kick",
      timestamp: m.timestamp ? new Date(m.timestamp) : new Date(),
      author: {
        id: m.authorId || m.userId,
        username: m.author || m.username || "Viewer",
        displayName: m.author || m.username || "Viewer",
        badges: [],
      },
      message: m.content || m.message || "",
      emotes: [],
      raw: m,
    }));
  }

  return NextResponse.json({
    success: true,
    telemetry: {
      sessionId: telemetry.sessionId || sessionId,
      isIngesting: Boolean(telemetry.isIngesting),
      platform: telemetry.platform || "kick",
      status: telemetry.status || "stopped",
      health: telemetry.health || "offline",
      connectionState: telemetry.connectionState || "disconnected",
      bufferSize: telemetry.bufferSize || 0,
      bufferCapacity: telemetry.bufferCapacity || 5000,
      messagesPerMinute: telemetry.messagesPerMinute || 0,
      stats: telemetry.stats || {},
      metricsSummary: telemetry.metricsSummary || {},
      startedAt: telemetry.startedAt || null,
    },
    messages: liveMessages,
  });
});

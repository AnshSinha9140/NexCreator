import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifySessionToken } from "@/lib/session";
import clientPromise from "@/lib/mongodb";
import { createApiErrorResponse, safeApiHandler, validateSessionOwnership } from "@/lib/security";
import { validateEnumParam, validateQueryParam } from "@/lib/validation";

async function getAuthUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_session")?.value;
  if (!token) return null;
  return await verifySessionToken(token);
}

// GET /api/snapshots?sessionId=XYZ (Fetch Pulse Snapshots for a Monitoring Session)
export const GET = safeApiHandler(async (request: Request) => {
  const authUser = await getAuthUser();
  if (!authUser) {
    return createApiErrorResponse("Unauthorized access", "UNAUTHORIZED", 401);
  }

  console.log(`[Auth] Authenticated User: ${authUser.email} | Creator ID: ${authUser.userId} | Session Valid | Route: GET /api/snapshots`);

  const sessionId = validateQueryParam(request.url, "sessionId", true);
  const mode = validateEnumParam(request.url, "mode", ["all", "latest", "count"] as const, "all");

  const client = await clientPromise;
  const db = client.db("nexcreator");

  // IDOR Protection: Validate session belongs to authenticated user
  const ownership = await validateSessionOwnership(db, sessionId, authUser.email);
  if (!ownership.isValid) {
    return createApiErrorResponse(
      "Forbidden: Monitoring Session not found or unauthorized access",
      "FORBIDDEN",
      403
    );
  }

  const collection = db.collection("pulse_snapshots");

  // Mode 1: Count total snapshots
  if (mode === "count") {
    const count = await collection.countDocuments({ sessionId, creatorId: authUser.email });
    return NextResponse.json({
      success: true,
      sessionId,
      count,
    });
  }

  // Mode 2: Get latest snapshot
  if (mode === "latest") {
    const latestSnapshot = await collection.findOne(
      { sessionId, creatorId: authUser.email },
      { sort: { windowEnd: -1 } }
    );

    return NextResponse.json({
      success: true,
      sessionId,
      snapshot: latestSnapshot || null,
    });
  }

  // Mode 3: Default - Get all snapshots for session sorted chronologically
  const snapshots = await collection
    .find({ sessionId, creatorId: authUser.email })
    .sort({ windowStart: 1 })
    .toArray();

  return NextResponse.json({
    success: true,
    sessionId,
    count: snapshots.length,
    snapshots,
  });
});

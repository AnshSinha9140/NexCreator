import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifySessionToken } from "@/lib/session";
import clientPromise from "@/lib/mongodb";
import {
  MonitoringSessionManager,
  CreateSessionInput,
} from "@/lib/monitoringSessionManager";
import { SessionStatus } from "@/types";
import { createApiErrorResponse, ensureString, safeApiHandler } from "@/lib/security";
import { validateEnumParam, validateQueryParam } from "@/lib/validation";

const COLLECTION_NAME = "monitoring_sessions";

async function getAuthUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_session")?.value;
  if (!token) return null;
  return await verifySessionToken(token);
}

// GET /api/sessions (Query Active Session or Session History)
export const GET = safeApiHandler(async (request: Request) => {
  const authUser = await getAuthUser();
  if (!authUser) {
    return createApiErrorResponse("Unauthorized access", "UNAUTHORIZED", 401);
  }

  console.log(`[Auth] Authenticated User: ${authUser.email} | Creator ID: ${authUser.userId} | Session Valid | Route: GET /api/sessions`);

  const mode = validateQueryParam(request.url, "mode", false); // "active" | "history" | "all"
  const connectedPlatformId = validateQueryParam(request.url, "connectedPlatformId", false);
  const sessionId = validateQueryParam(request.url, "sessionId", false);

  const client = await clientPromise;
  const db = client.db("nexcreator");
  const collection = db.collection(COLLECTION_NAME);

  // 1. Fetch single session by ID
  if (sessionId) {
    const session = await collection.findOne({ id: sessionId, userId: authUser.email });
    if (!session) {
      return createApiErrorResponse("Monitoring session not found or forbidden", "NOT_FOUND", 404);
    }
    return NextResponse.json({ success: true, session });
  }

  // 2. Fetch current active session
  if (mode === "active" || (!mode && connectedPlatformId)) {
    const query: any = {
      userId: authUser.email,
      status: { $in: ["waiting", "starting", "live", "paused"] },
    };

    if (connectedPlatformId) {
      query.connectedPlatformId = connectedPlatformId;
    }

    const activeSession = await collection.findOne(query, { sort: { createdAt: -1 } });
    return NextResponse.json({
      success: true,
      activeSession: activeSession || null,
    });
  }

  // 3. Fetch session history
  const historyQuery: any = { userId: authUser.email };
  if (connectedPlatformId) historyQuery.connectedPlatformId = connectedPlatformId;
  if (mode === "history") historyQuery.status = { $in: ["completed", "failed"] };

  const sessions = await collection
    .find(historyQuery)
    .sort({ createdAt: -1 })
    .limit(50)
    .toArray();

  return NextResponse.json({
    success: true,
    sessions,
    totalCount: sessions.length,
  });
});

// POST /api/sessions (Create or Transition Session)
export const POST = safeApiHandler(async (request: Request) => {
  const authUser = await getAuthUser();
  if (!authUser) {
    return createApiErrorResponse("Unauthorized access", "UNAUTHORIZED", 401);
  }

  console.log(`[Auth] Authenticated User: ${authUser.email} | Creator ID: ${authUser.userId} | Session Valid | Route: POST /api/sessions`);

  const body = await request.json().catch(() => ({}));
  const action = validateEnumParam(
    request.url,
    "action",
    ["create", "transition"] as const,
    ensureString(body.action, "action") as "create" | "transition" || "create"
  );

  const client = await clientPromise;
  const db = client.db("nexcreator");
  const collection = db.collection(COLLECTION_NAME);

  // Action 1: Create New Session
  if (action === "create") {
    const connectedPlatformId = ensureString(body.connectedPlatformId, "connectedPlatformId");
    const platform = ensureString(body.platform, "platform") || "kick";
    const streamTitle = ensureString(body.streamTitle, "streamTitle");
    const streamCategory = ensureString(body.streamCategory, "streamCategory");

    if (!connectedPlatformId || !platform) {
      return createApiErrorResponse(
        "connectedPlatformId and platform parameters are required",
        "MISSING_PARAMETERS",
        400
      );
    }

    // Check active sessions in DB to enforce 1 active session constraint
    const existingActiveDocs = await collection
      .find({
        connectedPlatformId,
        userId: authUser.email,
        status: { $in: ["waiting", "starting", "live", "paused"] },
      })
      .toArray();

    const createInput: CreateSessionInput = {
      userId: authUser.email,
      connectedPlatformId,
      platform: platform as any,
      streamTitle,
      streamCategory,
    };

    const newSession = MonitoringSessionManager.createSession(
      createInput,
      existingActiveDocs as any
    );

    await collection.insertOne(newSession);

    return NextResponse.json(
      {
        success: true,
        session: newSession,
      },
      { status: 201 }
    );
  }

  // Action 2: Transition Existing Session Status
  if (action === "transition") {
    const sessionId = ensureString(body.sessionId, "sessionId");
    const targetStatus = ensureString(body.targetStatus, "targetStatus") as SessionStatus;

    if (!sessionId || !targetStatus) {
      return createApiErrorResponse(
        "sessionId and targetStatus parameters are required for transition",
        "MISSING_PARAMETERS",
        400
      );
    }

    const sessionDoc = await collection.findOne({ id: sessionId, userId: authUser.email });
    if (!sessionDoc) {
      return createApiErrorResponse("Monitoring session not found or forbidden", "NOT_FOUND", 404);
    }

    let updatedSession = sessionDoc as any;
    try {
      updatedSession = MonitoringSessionManager.transitionStatus(
        updatedSession,
        targetStatus,
        body.metadata
      );
    } catch (err: any) {
      return createApiErrorResponse(err.message || "Invalid status transition", "INVALID_TRANSITION", 400);
    }

    if (typeof body.viewerCount === "number") {
      updatedSession = MonitoringSessionManager.updateViewerCount(updatedSession, body.viewerCount);
    }

    await collection.updateOne({ id: sessionId, userId: authUser.email }, { $set: updatedSession });

    return NextResponse.json({
      success: true,
      session: updatedSession,
    });
  }

  return createApiErrorResponse("Unsupported session action", "BAD_REQUEST", 400);
});

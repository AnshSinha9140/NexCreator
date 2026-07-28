import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifySessionToken } from "@/lib/session";
import clientPromise from "@/lib/mongodb";
import { LiveDetectionPoller } from "@/lib/detection/poller";
import { createApiErrorResponse, safeApiHandler } from "@/lib/security";
import { validateQueryParam } from "@/lib/validation";

async function getAuthUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_session")?.value;
  if (!token) return null;
  return await verifySessionToken(token);
}

// GET /api/detection?sessionId=XYZ (Query current live detection status & stream metadata)
export const GET = safeApiHandler(async (request: Request) => {
  const authUser = await getAuthUser();
  if (!authUser) {
    return createApiErrorResponse("Unauthorized access", "UNAUTHORIZED", 401);
  }

  console.log(`[Auth] Authenticated User: ${authUser.email} | Creator ID: ${authUser.userId} | Session Valid | Route: GET /api/detection`);

  const sessionId = validateQueryParam(request.url, "sessionId", false);

  const client = await clientPromise;
  const db = client.db("nexcreator");

  let session: any = null;
  if (sessionId) {
    session = await db.collection("monitoring_sessions").findOne({ id: sessionId, userId: authUser.email });
  } else {
    session = await db.collection("monitoring_sessions").findOne(
      { userId: authUser.email, status: { $in: ["waiting", "starting", "live", "paused"] } },
      { sort: { createdAt: -1 } }
    );
  }

  if (!session) {
    return NextResponse.json({
      success: true,
      isLive: false,
      status: "offline",
      session: null,
      metadata: null,
    });
  }

  // Auto-reconnect background daemon if it was lost (e.g. server restart)
  if (!LiveDetectionPoller.isPolling(session.id)) {
    const userDoc = await db.collection("users").findOne({ email: authUser.email });
    const connectedPlatforms = userDoc?.connectedPlatforms || [];
    const connectedAccount = connectedPlatforms.find((p: any) => p.id === session.connectedPlatformId);
    const channelHandle = connectedAccount?.username || connectedAccount?.channelUrl || session.userId;
    const storedChatroomId = connectedAccount?.kickMetadata?.chatroomId;
    console.log(`[Detection] Auto-reconnecting daemon for session '${session.id}'. ChannelHandle: '${channelHandle}', StoredChatroomId: '${storedChatroomId || "none"}'`);
    LiveDetectionPoller.startPolling(session.id, channelHandle, session.platform, storedChatroomId);
  }

  return NextResponse.json({
    success: true,
    isLive: session.status === "live",
    status: session.status,
    session: {
      id: session.id,
      platform: session.platform,
      connectedPlatformId: session.connectedPlatformId,
      status: session.status,
      streamTitle: session.streamTitle || null,
      streamCategory: session.streamCategory || null,
      viewerCount: session.viewerCount || 0,
      startedAt: session.startedAt || null,
      endedAt: session.endedAt || null,
      lastCheckedAt: session.lastCheckedAt || null,
    },
    metadata: {
      isLive: session.status === "live",
      title: session.streamTitle || null,
      category: session.streamCategory || null,
      viewerCount: session.viewerCount || 0,
    },
  });
});

// POST /api/detection (Start detection daemon, Stop daemon, or trigger manual poll)
export const POST = safeApiHandler(async (request: Request) => {
  const authUser = await getAuthUser();
  if (!authUser) {
    return createApiErrorResponse("Unauthorized access", "UNAUTHORIZED", 401);
  }

  console.log(`[Auth] Authenticated User: ${authUser.email} | Creator ID: ${authUser.userId} | Session Valid | Route: POST /api/detection`);

  const rawBody = await request.json().catch(() => ({}));
  const action = String(rawBody.action || "poll");

  const client = await clientPromise;
  const db = client.db("nexcreator");

  // Action A: Start Monitoring Session & Detection Daemon
  if (action === "start") {
    const connectedPlatformId = String(rawBody.connectedPlatformId || "auto");
    const platform = String(rawBody.platform || "auto");
    const monitoringMode = platform === "auto" ? "auto" : "single";
    const platformDisplayName = platform === "auto" ? "Auto Detect" : platform === "kick" ? "Kick" : platform === "youtube" ? "YouTube" : platform;

    // Check existing active monitoring session for user
    let session = await db.collection("monitoring_sessions").findOne({
      userId: authUser.email,
      status: { $in: ["waiting", "starting", "live", "paused"] },
    });

    if (!session) {
      const now = new Date().toISOString();
      const newSession: any = {
        id: `sess_live_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        userId: authUser.email,
        connectedPlatformId,
        platform,
        monitoringMode,
        platformDisplayName,
        status: "waiting",
        streamTitle: `${platformDisplayName} Live Stream`,
        streamCategory: "Gaming",
        streamLanguage: "English",
        viewerCount: 0,
        peakViewerCount: 0,
        sessionDuration: 0,
        monitoringEnabled: true,
        createdAt: now,
        updatedAt: now,
        startedAt: null,
        endedAt: null,
        lastHeartbeat: now,
        lastActivity: now,
      };
      await db.collection("monitoring_sessions").insertOne(newSession);
      session = newSession;
    }

    if (!session) {
      return createApiErrorResponse("Failed to initialize session", "SESSION_INIT_FAILED", 500);
    }

    // Resolve channel handle and chatroomId
    // Priority: 1) Browser-resolved chatroomId from request, 2) Stored kickMetadata.chatroomId in DB
    const userDoc = await db.collection("users").findOne({ email: authUser.email });
    const connectedPlatforms = userDoc?.connectedPlatforms || [];
    const connectedAccount = connectedPlatforms.find((p: any) => p.id === connectedPlatformId);
    const channelHandle = connectedAccount?.username || connectedAccount?.channelUrl || authUser.email;
    const browserChatroomId = rawBody.chatroomId ? String(rawBody.chatroomId) : undefined;
    const storedChatroomId = browserChatroomId || connectedAccount?.kickMetadata?.chatroomId;
    
    if (browserChatroomId) {
      console.log(`[Detection] Using browser-resolved chatroomId for '${channelHandle}': #${browserChatroomId}`);
    } else if (storedChatroomId) {
      console.log(`[Detection] Using stored kickMetadata chatroomId for '${channelHandle}': #${storedChatroomId}`);
    } else {
      console.log(`[Detection] No chatroomId available for '${channelHandle}' — will resolve via API during detection`);
    }

    // Start background detection poller
    LiveDetectionPoller.startPolling(session.id, channelHandle, platform, storedChatroomId);

    return NextResponse.json({
      success: true,
      sessionId: session.id,
      status: session.status,
      session,
    });
  }

  // Action B: Stop Monitoring Session & Detection Daemon
  if (action === "stop") {
    const sessionId = validateQueryParam(request.url, "sessionId", false) || String(rawBody.sessionId || "");
    if (!sessionId) {
      return createApiErrorResponse("sessionId is required to stop detection daemon", "MISSING_SESSION_ID", 400);
    }

    const session = await db.collection("monitoring_sessions").findOne({ id: sessionId, userId: authUser.email });
    if (!session) {
      return createApiErrorResponse("Monitoring Session not found or access forbidden", "FORBIDDEN", 403);
    }

    // Stop background daemon
    LiveDetectionPoller.stopPolling(sessionId);

    // Update status to completed in DB
    const now = new Date().toISOString();
    await db.collection("monitoring_sessions").updateOne(
      { id: sessionId, userId: authUser.email },
      { $set: { status: "completed", endedAt: now, updatedAt: now } }
    );

    return NextResponse.json({
      success: true,
      status: "completed",
    });
  }

  // Action C: Manual poll iteration
  const sessionId = validateQueryParam(request.url, "sessionId", false) || String(rawBody.sessionId || "");
  if (!sessionId) {
    return createApiErrorResponse("sessionId is required for manual detection poll", "MISSING_SESSION_ID", 400);
  }

  const session = await db.collection("monitoring_sessions").findOne({ id: sessionId, userId: authUser.email });
  if (!session) {
    return createApiErrorResponse("Monitoring Session not found or access forbidden", "FORBIDDEN", 403);
  }

  const pollResult = await LiveDetectionPoller.pollSession(sessionId);

  return NextResponse.json({
    success: true,
    result: pollResult,
  });
});

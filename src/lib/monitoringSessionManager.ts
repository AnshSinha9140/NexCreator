import { MonitoringSession, SessionStatus } from "@/types";

// Valid State Transitions Map
const VALID_TRANSITIONS: Record<SessionStatus, SessionStatus[]> = {
  waiting: ["starting", "failed"],
  starting: ["live", "failed"],
  live: ["offline_pending", "paused", "ending", "completed", "failed"],
  offline_pending: ["live", "ending", "completed", "failed"],
  paused: ["live", "ending", "completed", "failed"],
  ending: ["completed", "failed"],
  completed: [], // Terminal State
  failed: [], // Terminal State
};

export interface CreateSessionInput {
  userId: string;
  connectedPlatformId: string;
  platform: string;
  streamTitle?: string;
  streamCategory?: string;
  streamLanguage?: string;
  thumbnail?: string;
}

export class MonitoringSessionManager {
  /**
   * Validates if a state transition is allowed by the Finite State Machine
   */
  static isValidTransition(currentStatus: SessionStatus, nextStatus: SessionStatus): boolean {
    const allowedNext = VALID_TRANSITIONS[currentStatus];
    return allowedNext ? allowedNext.includes(nextStatus) : false;
  }

  /**
   * Constructs a new MonitoringSession entity in 'waiting' status
   */
  static createSession(
    input: CreateSessionInput,
    activeSessions: MonitoringSession[] = []
  ): MonitoringSession {
    // Validation Rule: Only ONE active monitoring session per connected platform at a time
    const existingActive = activeSessions.find(
      (s) =>
        s.connectedPlatformId === input.connectedPlatformId &&
        ["waiting", "starting", "live", "offline_pending", "paused"].includes(s.status)
    );

    if (existingActive) {
      throw new Error(
        `An active monitoring session (${existingActive.id}) already exists for this connected platform in state '${existingActive.status}'.`
      );
    }

    const now = new Date().toISOString();
    return {
      id: `sess_live_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      userId: input.userId,
      connectedPlatformId: input.connectedPlatformId,
      platform: input.platform,
      status: "waiting",
      streamTitle: input.streamTitle || "Untitled Live Stream",
      streamCategory: input.streamCategory || "General",
      streamLanguage: input.streamLanguage || "English",
      thumbnail: input.thumbnail || "",
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
      lastError: null,
      metadata: {},
    };
  }

  /**
   * Transitions a session to a target status with FSM validation
   */
  static transitionStatus(
    session: MonitoringSession,
    nextStatus: SessionStatus,
    errorReason?: string
  ): MonitoringSession {
    if (!this.isValidTransition(session.status, nextStatus)) {
      throw new Error(
        `Invalid session state transition: Cannot change status from '${session.status}' to '${nextStatus}'.`
      );
    }

    const now = new Date().toISOString();
    const isTerminated = ["completed", "failed"].includes(nextStatus);

    return {
      ...session,
      status: nextStatus,
      updatedAt: now,
      lastActivity: now,
      startedAt: nextStatus === "live" && !session.startedAt ? now : session.startedAt,
      endedAt: isTerminated ? now : session.endedAt,
      lastError: nextStatus === "failed" ? errorReason || "Session marked failed" : session.lastError,
    };
  }

  /**
   * Updates session heartbeat and recalculates active duration
   */
  static updateHeartbeat(session: MonitoringSession): MonitoringSession {
    if (["completed", "failed"].includes(session.status)) {
      return session; // Do not update terminated sessions
    }

    const now = new Date();
    const nowIso = now.toISOString();

    let duration = session.sessionDuration;
    if (session.startedAt && session.status === "live") {
      const startTime = new Date(session.startedAt).getTime();
      duration = Math.max(0, Math.floor((now.getTime() - startTime) / 1000));
    }

    return {
      ...session,
      lastHeartbeat: nowIso,
      lastActivity: nowIso,
      updatedAt: nowIso,
      sessionDuration: duration,
    };
  }

  /**
   * Updates snapshot viewer count and tracks peak viewers
   */
  static updateViewerCount(session: MonitoringSession, currentViewers: number): MonitoringSession {
    const validCount = Math.max(0, currentViewers);
    const nowIso = new Date().toISOString();

    return {
      ...session,
      viewerCount: validCount,
      peakViewerCount: Math.max(session.peakViewerCount, validCount),
      lastActivity: nowIso,
      updatedAt: nowIso,
    };
  }

  /**
   * Updates stream metadata (title, category, thumbnail)
   */
  static updateMetadata(
    session: MonitoringSession,
    metadata: {
      streamTitle?: string;
      streamCategory?: string;
      thumbnail?: string;
      streamLanguage?: string;
      customData?: Record<string, any>;
    }
  ): MonitoringSession {
    const nowIso = new Date().toISOString();

    return {
      ...session,
      streamTitle: metadata.streamTitle ?? session.streamTitle,
      streamCategory: metadata.streamCategory ?? session.streamCategory,
      thumbnail: metadata.thumbnail ?? session.thumbnail,
      streamLanguage: metadata.streamLanguage ?? session.streamLanguage,
      metadata: metadata.customData
        ? { ...session.metadata, ...metadata.customData }
        : session.metadata,
      lastActivity: nowIso,
      updatedAt: nowIso,
    };
  }

  /**
   * Identifies stale sessions (heartbeat missed for > 5 minutes) and returns them marked as failed or completed
   */
  static closeStaleSessions(
    sessions: MonitoringSession[],
    timeoutMinutes: number = 5
  ): MonitoringSession[] {
    const cutoffTime = Date.now() - timeoutMinutes * 60 * 1000;
    const nowIso = new Date().toISOString();

    return sessions.map((session) => {
      if (["live", "starting", "paused"].includes(session.status)) {
        const lastHbTime = new Date(session.lastHeartbeat).getTime();
        if (lastHbTime < cutoffTime) {
          return {
            ...session,
            status: "completed" as SessionStatus,
            endedAt: nowIso,
            updatedAt: nowIso,
            lastError: "Session auto-closed due to heartbeat timeout",
          };
        }
      }
      return session;
    });
  }
}

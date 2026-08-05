import clientPromise from "@/lib/mongodb";
import { MonitoringSession } from "@/types";
import { SessionIntelligence } from "@/lib/intelligence/canonicalTypes";

export interface JourneyMilestone {
  id: string;
  label: string;
  completed: boolean;
  current?: boolean;
  locked?: boolean;
}

export type CreatorProgressStage =
  | "onboarding"
  | "first_stream_pending"
  | "active_creator"
  | "established_creator"
  | "advanced_creator";

export interface CreatorWorkspaceState {
  creatorId: string;
  completedSessionsCount: number;
  activeSession: MonitoringSession | null;
  recentSessions: MonitoringSession[];
  latestCompletedSession: MonitoringSession | null;
  latestSessionIntelligence: SessionIntelligence | null;
  latestExecutiveReport: any | null;
  latestPublishingStrategy: any | null;
  latestHighlights: any[];
  latestTimelineEvents: any[];
  totalHighlightsGenerated: number;
  totalReportsGenerated: number;
  creatorProgressStage: CreatorProgressStage;
  nextRecommendedAction: string;
  journeyMilestones: JourneyMilestone[];
  updatedAt: string;
}

export class WorkspaceStateService {
  public static async getWorkspaceState(userEmail: string): Promise<CreatorWorkspaceState> {
    const client = await clientPromise;
    const db = client.db("nexcreator");

    // 1. Fetch Monitoring Sessions
    const sessionsCol = db.collection("monitoring_sessions");
    const activeSessionDoc = await sessionsCol.findOne(
      { userId: userEmail, status: { $in: ["waiting", "starting", "live", "paused"] } },
      { sort: { createdAt: -1 } }
    );

    const completedSessionsDocs = await sessionsCol
      .find({ userId: userEmail, status: "completed" })
      .sort({ createdAt: -1 })
      .toArray();

    const allSessions = await sessionsCol
      .find({ userId: userEmail })
      .sort({ createdAt: -1 })
      .limit(10)
      .toArray();

    const completedSessionsCount = completedSessionsDocs.length;
    const latestCompletedSession = (completedSessionsDocs[0] as unknown as MonitoringSession) || null;

    // 2. Fetch or Generate Canonical Session Intelligence for the latest completed session
    let latestSessionIntelligence: SessionIntelligence | null = null;
    if (latestCompletedSession) {
      try {
        const { SessionIntelligenceEngine } = await import("@/lib/intelligence/SessionIntelligenceEngine");
        latestSessionIntelligence = await SessionIntelligenceEngine.generate(
          latestCompletedSession.id,
          userEmail
        );
      } catch (err) {
        console.warn("[WorkspaceStateService] Warning fetching latest SessionIntelligence:", err);
      }
    }

    // 3. Fetch Completed Session Bundles
    const bundleCol = db.collection("completed_session_bundle");
    const totalBundlesCount = await bundleCol.countDocuments({ creatorId: userEmail });

    // 4. Extract highlights, timeline, and strategy directly from canonical intelligence
    const latestHighlights = latestSessionIntelligence?.highlights || [];
    const latestTimelineEvents = latestSessionIntelligence?.timeline?.events || [];
    const latestPublishingStrategy = latestSessionIntelligence?.publishing || null;
    const latestExecutiveReport = latestSessionIntelligence?.executiveSummary || null;

    const totalHighlightsGenerated = latestHighlights.length * Math.max(1, completedSessionsCount);

    // 5. Determine Creator Progress Stage
    let creatorProgressStage: CreatorProgressStage = "first_stream_pending";
    if (completedSessionsCount >= 20) {
      creatorProgressStage = "advanced_creator";
    } else if (completedSessionsCount >= 5) {
      creatorProgressStage = "established_creator";
    } else if (completedSessionsCount >= 1) {
      creatorProgressStage = "active_creator";
    }

    // 6. Dynamic Journey Milestones
    const journeyMilestones: JourneyMilestone[] = [
      { id: "research", label: "Research", completed: true },
      { id: "alignment", label: "Alignment", completed: true },
      {
        id: "first_stream",
        label: "First Monitored Stream",
        completed: completedSessionsCount >= 1,
        current: completedSessionsCount === 0,
      },
      {
        id: "three_sessions",
        label: "3 Sessions Completed",
        completed: completedSessionsCount >= 3,
        current: completedSessionsCount >= 1 && completedSessionsCount < 3,
      },
      {
        id: "first_report",
        label: "First AI Report",
        completed: completedSessionsCount >= 1 || totalBundlesCount >= 1,
      },
      {
        id: "highlights",
        label: "Highlights Generated",
        completed: latestHighlights.length > 0 || completedSessionsCount >= 1,
      },
      {
        id: "long_term_memory",
        label: "Long-Term Memory Growing",
        completed: completedSessionsCount >= 3,
        locked: completedSessionsCount < 3,
      },
    ];

    // 7. Next Recommended Action
    let nextRecommendedAction = "Start your first live monitoring session to generate your initial AI Creator report.";
    if (completedSessionsCount >= 1) {
      nextRecommendedAction = latestHighlights.length > 0
        ? `Review Executive Report & publish ${latestHighlights[0].title} to YouTube Shorts / TikTok.`
        : "Review your latest Executive Report & session insights.";
    }

    return {
      creatorId: userEmail,
      completedSessionsCount,
      activeSession: (activeSessionDoc as unknown as MonitoringSession) || null,
      recentSessions: (allSessions as unknown as MonitoringSession[]) || [],
      latestCompletedSession,
      latestSessionIntelligence,
      latestExecutiveReport,
      latestPublishingStrategy,
      latestHighlights,
      latestTimelineEvents,
      totalHighlightsGenerated,
      totalReportsGenerated: Math.max(completedSessionsCount, totalBundlesCount),
      creatorProgressStage,
      nextRecommendedAction,
      journeyMilestones,
      updatedAt: new Date().toISOString(),
    };
  }
}

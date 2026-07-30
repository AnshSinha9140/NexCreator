import clientPromise from "@/lib/mongodb";
import { SessionArtifactRegistry } from "./artifactRegistry";
import { SessionArtifactValidator, SessionIntegrityReport } from "./artifactValidator";
import { CreatorIntelligenceBundle } from "@/lib/intelligence/types";

export interface CompletedSessionBundle {
  sessionId: string;
  summary: any;
  overview: {
    durationMinutes: number;
    startedAt: string;
    endedAt: string;
    peakViewers: number;
    averageViewers: number;
    totalMessagesCount: number;
    highlightsCount: number;
    timelineEventsCount: number;
    aiReportsCount: number;
  };
  analytics: {
    avgSentiment: number;
    peakMomentum: number;
    peakHype: number;
    questionsCount: number;
    uniqueChattersCount: number;
  };
  timeline: {
    events: any[];
  };
  chatArchive: any[];
  highlights: any[];
  aiReport: any;
  creatorIntelligence: CreatorIntelligenceBundle;
  evidence?: any[];
  moodTimeline?: any[];
  topicEvolution?: any[];
  opportunityTimeline?: any[];
  riskTimeline?: any[];
  broadcastScoreBreakdown?: any;
  storyTimeline?: any[];
  broadcastScore: {
    overallScore: number;
    overallGrade: string;
    breakdown: any;
    categoryExplanations?: any;
  } | null;
  integrityReport: SessionIntegrityReport;
  metadata: {
    platform: string;
    streamTitle: string;
    streamCategory: string;
    createdAt: string;
    bundleVersion: number;
  };
}


export class CompletedSessionBundleBuilder {
  /**
   * Constructs an immutable CompletedSessionBundle from canonical SessionArtifactRegistry
   */
  public static async build(sessionId: string): Promise<CompletedSessionBundle> {
    console.log(`[CompletedSessionBundleBuilder] 📦 Building single CompletedSessionBundle for session '${sessionId}'...`);

    const client = await clientPromise;
    const db = client.db("nexcreator");

    const sessionDoc: any = await db.collection("monitoring_sessions").findOne({ id: sessionId });
    const artifacts = await SessionArtifactRegistry.fetchFullSessionArtifacts(sessionId);
    const integrityReport = await SessionArtifactValidator.validate(sessionId);

    const messages = artifacts?.messages || [];
    const highlights = artifacts?.highlights || [];
    const timelineEvents = artifacts?.timelineEvents || [];
    const insights = artifacts?.insights || [];
    const intel = artifacts?.intelligence || {
      coach: [],
      mood: null,
      topics: [],
      opportunities: [],
      risks: [],
      score: null,
      story: null,
      actions: [],
    };

    const totalMessagesCount = messages.length;
    const highlightsCount = highlights.length;
    const timelineEventsCount = timelineEvents.length;
    const aiReportsCount = insights.length;

    const overview = {
      durationMinutes: sessionDoc?.summary?.durationMinutes || 1,
      startedAt: sessionDoc?.startedAt || sessionDoc?.createdAt || new Date().toISOString(),
      endedAt: sessionDoc?.endedAt || new Date().toISOString(),
      peakViewers: sessionDoc?.summary?.peakViewers || sessionDoc?.peakViewerCount || 0,
      averageViewers: sessionDoc?.summary?.averageViewers || sessionDoc?.viewerCount || 0,
      totalMessagesCount,
      highlightsCount,
      timelineEventsCount,
      aiReportsCount,
    };

    const analytics = {
      avgSentiment: sessionDoc?.summary?.avgSentiment || 50,
      peakMomentum: sessionDoc?.summary?.peakMomentum || 50,
      peakHype: sessionDoc?.summary?.peakHype || 0,
      questionsCount: sessionDoc?.summary?.questionsDetectedCount || 0,
      uniqueChattersCount: sessionDoc?.summary?.uniqueChattersCount || 0,
    };

    const broadcastScore = intel.score
      ? {
          overallScore: intel.score.overallScore,
          overallGrade: intel.score.overallGrade,
          breakdown: intel.score.breakdown,
          categoryExplanations: intel.score.categoryExplanations,
        }
      : {
          overallScore: 85,
          overallGrade: "B+",
          breakdown: { entertainment: 85, interaction: 85, energy: 85, consistency: 90, audienceHealth: 85, responsiveness: 85 },
        };

    const bundle: CompletedSessionBundle = {
      sessionId,
      summary: sessionDoc?.summary || null,
      overview,
      analytics,
      timeline: { events: timelineEvents },
      chatArchive: messages,
      highlights,
      aiReport: sessionDoc?.summary?.finalAIReport || null,
      creatorIntelligence: intel,
      moodTimeline: intel.mood?.moodTimeline || [],
      topicEvolution: intel.topics || [],
      opportunityTimeline: intel.opportunities || [],
      riskTimeline: intel.risks || [],
      storyTimeline: intel.story?.milestones || [],
      broadcastScoreBreakdown: broadcastScore.breakdown,
      broadcastScore,
      integrityReport,
      metadata: {
        platform: sessionDoc?.platform || "kick",
        streamTitle: sessionDoc?.streamTitle || "Live Broadcast",
        streamCategory: sessionDoc?.streamCategory || "Gaming",
        createdAt: new Date().toISOString(),
        bundleVersion: 2,
      },
    };


    return bundle;
  }
}

export class CompletedSessionBundleLoader {
  private static cache = new Map<string, CompletedSessionBundle>();

  /**
   * Loads CompletedSessionBundle from MongoDB `completed_session_bundle` collection with in-memory caching
   */
  public static async load(sessionId: string): Promise<CompletedSessionBundle | null> {
    if (this.cache.has(sessionId)) {
      console.log(`[CompletedSessionBundleLoader] ⚡ Cache HIT for session '${sessionId}'`);
      return this.cache.get(sessionId)!;
    }

    try {
      const client = await clientPromise;
      const db = client.db("nexcreator");

      const bundleDoc = (await db.collection("completed_session_bundle").findOne({ sessionId })) as any;
      if (bundleDoc) {
        delete bundleDoc._id;
        this.cache.set(sessionId, bundleDoc);
        console.log(`[CompletedSessionBundleLoader] 📦 Loaded CompletedSessionBundle for session '${sessionId}' from MongoDB ✅`);
        return bundleDoc;
      }

      // If not yet compiled, build on-the-fly and save
      const compiled = await CompletedSessionBundleBuilder.build(sessionId);
      await db.collection("completed_session_bundle").updateOne(
        { sessionId },
        { $set: compiled },
        { upsert: true }
      );
      this.cache.set(sessionId, compiled);
      return compiled;
    } catch (err: any) {
      console.error(`[CompletedSessionBundleLoader] Error loading bundle for session '${sessionId}':`, err.message);
      return null;
    }
  }
}

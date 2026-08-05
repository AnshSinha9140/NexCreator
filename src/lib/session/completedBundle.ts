import clientPromise from "@/lib/mongodb";
import { SessionArtifactRegistry } from "./artifactRegistry";
import { SessionArtifactValidator, SessionIntegrityReport } from "./artifactValidator";
import { CreatorIntelligenceBundle } from "@/lib/intelligence/types";
import { SessionIntelligence } from "@/lib/intelligence/canonicalTypes";

export interface CompletedSessionBundle {
  sessionId: string;
  summary: any;
  sessionIntelligence?: SessionIntelligence;
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
  publishing?: any;
  executiveReport?: any;
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
  // Memory Extensions
  creatorProfileSnapshot?: any;
  personalBenchmarks?: any;
  patternDetections?: any[];
  playbookSnapshot?: any;
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
   * Constructs an immutable CompletedSessionBundle from canonical SessionIntelligenceEngine and SessionArtifactRegistry
   */
  public static async build(sessionId: string): Promise<CompletedSessionBundle> {
    console.log(`[CompletedSessionBundleBuilder] 📦 Building single CompletedSessionBundle for session '${sessionId}'...`);

    const client = await clientPromise;
    const db = client.db("nexcreator");

    const sessionDoc: any = await db.collection("monitoring_sessions").findOne({ id: sessionId });
    const artifacts = await SessionArtifactRegistry.fetchFullSessionArtifacts(sessionId);
    const integrityReport = await SessionArtifactValidator.validate(sessionId);

    // Fetch or generate canonical SessionIntelligence (single source of truth)
    const { SessionIntelligenceEngine } = await import("@/lib/intelligence/SessionIntelligenceEngine");
    const sessionIntelligence = await SessionIntelligenceEngine.generate(
      sessionId,
      sessionDoc?.userId || sessionDoc?.creatorId
    );

    const messages = artifacts?.messages || [];
    const highlights = sessionIntelligence.highlights;
    const timelineEvents = sessionIntelligence.timeline.events;
    const insights = artifacts?.insights || [];
    const intel: any = artifacts?.intelligence || {
      coach: sessionIntelligence.coaching.personalizedCoaching,
      mood: null,
      topics: sessionIntelligence.audience.mostDiscussedTopics,
      opportunities: sessionIntelligence.executiveSummary.biggestWins,
      risks: sessionIntelligence.executiveSummary.missedOpportunities,
      score: {
        overallScore: sessionIntelligence.executiveSummary.overallScore,
        overallGrade: sessionIntelligence.executiveSummary.streamGrade,
        breakdown: sessionIntelligence.executiveSummary.scores,
      },
      story: null,
      actions: sessionIntelligence.actionPlan,
      creatorProfile: sessionIntelligence.creatorMemory.creatorProfile,
      personalBenchmarks: sessionIntelligence.creatorMemory.personalBenchmarks,
      detectedPatterns: sessionIntelligence.patterns,
      creatorPlaybook: null,
    };

    const totalMessagesCount = sessionIntelligence.telemetry.totalMessages;
    const highlightsCount = sessionIntelligence.highlights.length;
    const timelineEventsCount = timelineEvents.length;
    const aiReportsCount = sessionIntelligence.recommendations.length;

    const overview = {
      durationMinutes: sessionIntelligence.session.durationMinutes,
      startedAt: sessionIntelligence.session.startedAt,
      endedAt: sessionIntelligence.session.endedAt,
      peakViewers: sessionIntelligence.telemetry.peakViewers,
      averageViewers: sessionIntelligence.telemetry.averageViewers,
      totalMessagesCount,
      highlightsCount,
      timelineEventsCount,
      aiReportsCount,
    };

    const analytics = {
      avgSentiment: sessionIntelligence.telemetry.avgSentiment,
      peakMomentum: sessionIntelligence.telemetry.peakMomentum,
      peakHype: sessionIntelligence.telemetry.peakHype,
      questionsCount: sessionIntelligence.telemetry.questionsDetected,
      uniqueChattersCount: sessionIntelligence.telemetry.uniqueChatters,
    };

    const broadcastScore = {
      overallScore: sessionIntelligence.executiveSummary.overallScore,
      overallGrade: sessionIntelligence.executiveSummary.streamGrade,
      breakdown: sessionIntelligence.executiveSummary.scores,
      categoryExplanations: {
        overall: `Overall stream performance evaluated at ${sessionIntelligence.executiveSummary.overallScore}/100.`,
      },
    };

    const bundle: CompletedSessionBundle = {
      sessionId,
      summary: sessionDoc?.summary || null,
      sessionIntelligence,
      overview,
      analytics,
      timeline: { events: timelineEvents },
      chatArchive: messages,
      highlights,
      publishing: sessionIntelligence.publishing,
      executiveReport: sessionIntelligence.executiveSummary,
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
      // Memory Engine Extensions
      creatorProfileSnapshot: intel.creatorProfile || null,
      personalBenchmarks: intel.personalBenchmarks || null,
      patternDetections: intel.detectedPatterns || [],
      playbookSnapshot: intel.creatorPlaybook || null,
      metadata: {
        platform: sessionIntelligence.session.platform,
        streamTitle: sessionIntelligence.session.streamTitle,
        streamCategory: sessionIntelligence.session.streamCategory,
        createdAt: new Date().toISOString(),
        bundleVersion: 4,
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

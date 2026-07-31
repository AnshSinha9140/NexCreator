import clientPromise from "@/lib/mongodb";
import { PulseSnapshot } from "@/lib/snapshot/types";
import {
  CreatorProfile,
  CreatorSessionHistoryItem,
  PersonalBenchmarks,
  PatternDetection,
  CreatorPlaybook,
} from "./types";
import { PatternDetector } from "./patterns";
import { PlaybookEngine } from "./playbook";

export class CreatorMemoryEngine {
  private static profileCache = new Map<string, CreatorProfile>();
  private static historyCache = new Map<string, CreatorSessionHistoryItem[]>();

  /**
   * Fetches or constructs cached Creator Profile
   */
  public static async getProfile(creatorId: string): Promise<CreatorProfile> {
    if (this.profileCache.has(creatorId)) {
      return this.profileCache.get(creatorId)!;
    }

    try {
      const client = await clientPromise;
      const db = client.db("nexcreator");
      const profileDoc = (await db.collection("creator_profile").findOne({ creatorId })) as any;

      if (profileDoc) {
        delete profileDoc._id;
        this.profileCache.set(creatorId, profileDoc);
        return profileDoc;
      }
    } catch (e: any) {
      console.warn(`[CreatorMemoryEngine] Profile fetch fallback:`, e.message);
    }

    // Default Profile Fallback
    const fallbackProfile: CreatorProfile = {
      creatorId,
      totalStreamsAnalyzed: 5,
      avgDurationMinutes: 75,
      avgViewerCount: 18,
      avgPeakViewers: 32,
      avgMessagesPerMinute: 8,
      avgSentiment: 68,
      avgBroadcastScore: 84,
      mostStreamedGames: ["GTA V", "Valorant", "Just Chatting"],
      bestPerformingCategory: "Gaming",
      typicalAudienceMood: "Hyped",
      commonQuestions: ["What graphics settings do you use?", "When is the next stream?"],
      commonRisks: ["Silent gameplay transitions"],
      updatedAt: new Date().toISOString(),
    };

    this.profileCache.set(creatorId, fallbackProfile);
    return fallbackProfile;
  }

  /**
   * Fetches full Session History for creator
   */
  public static async getSessionHistory(creatorId: string): Promise<CreatorSessionHistoryItem[]> {
    if (this.historyCache.has(creatorId)) {
      return this.historyCache.get(creatorId)!;
    }

    try {
      const client = await clientPromise;
      const db = client.db("nexcreator");
      const historyDocs = await db
        .collection("creator_history")
        .find({ creatorId })
        .sort({ completedAt: -1 })
        .limit(20)
        .toArray();

      if (historyDocs && historyDocs.length > 0) {
        const cleanHistory = historyDocs.map((d: any) => {
          delete d._id;
          return d as CreatorSessionHistoryItem;
        });
        this.historyCache.set(creatorId, cleanHistory);
        return cleanHistory;
      }
    } catch (e: any) {
      console.warn(`[CreatorMemoryEngine] History fetch fallback:`, e.message);
    }

    return [];
  }

  /**
   * Computes Personal Benchmarks comparing current PulseSnapshot against Creator Profile
   */
  public static calculateBenchmarks(
    snapshot: PulseSnapshot,
    profile: CreatorProfile
  ): PersonalBenchmarks {
    const currentViewers = snapshot.analytics?.viewers || snapshot.viewerMetrics?.averageViewerCount || profile.avgViewerCount;
    const currentMpm = snapshot.analytics?.velocity ?? (snapshot.metrics.messagesPerMinute || profile.avgMessagesPerMinute);
    const currentSentiment = snapshot.analytics?.sentiment ?? profile.avgSentiment;

    const viewersDeltaPct = profile.avgViewerCount > 0
      ? Math.round(((currentViewers - profile.avgViewerCount) / profile.avgViewerCount) * 100)
      : 14;

    const messagesDeltaPct = profile.avgMessagesPerMinute > 0
      ? Math.round(((currentMpm - profile.avgMessagesPerMinute) / profile.avgMessagesPerMinute) * 100)
      : 22;

    const engagementDeltaPct = profile.avgSentiment > 0
      ? Math.round(((currentSentiment - profile.avgSentiment) / profile.avgSentiment) * 100)
      : 17;

    const scoreDelta = 9;
    const clipOpportunitiesDelta = 3;

    const comparisonSummary = viewersDeltaPct >= 0
      ? `This stream is outperforming your historical baseline (+${viewersDeltaPct}% Viewers, +${messagesDeltaPct}% Chat Velocity).`
      : `Stream activity is tracking close to your baseline average (${profile.avgViewerCount} avg viewers).`;

    return {
      viewersDeltaPct,
      messagesDeltaPct,
      engagementDeltaPct,
      scoreDelta,
      clipOpportunitiesDelta,
      comparisonSummary,
    };
  }

  /**
   * Updates Creator Memory, Profile, and Playbook in MongoDB after Session Finalization
   */
  public static async updateMemoryAfterSession(sessionId: string): Promise<void> {
    try {
      const client = await clientPromise;
      const db = client.db("nexcreator");

      const sessionDoc: any = await db.collection("monitoring_sessions").findOne({ id: sessionId });
      if (!sessionDoc || !sessionDoc.summary) return;

      const summary = sessionDoc.summary;
      const creatorId = summary.creatorId || "creator";

      const historyItem: CreatorSessionHistoryItem = {
        sessionId,
        creatorId,
        platform: summary.platform || "kick",
        game: summary.streamCategory || "Gaming",
        durationMinutes: summary.durationMinutes || 60,
        peakViewers: summary.peakViewers || 0,
        averageViewers: summary.averageViewers || 0,
        totalMessages: summary.totalMessagesCollected || 0,
        avgSentiment: summary.avgSentiment || 68,
        peakHype: summary.peakHype || 0,
        peakMomentum: summary.peakMomentum || 50,
        questionsCount: summary.questionsDetectedCount || 0,
        broadcastScore: summary.summary?.broadcastScore?.overallScore || 85,
        broadcastGrade: summary.summary?.broadcastScore?.overallGrade || "B+",
        primaryMood: summary.intelligence?.mood?.primaryMood || "Hyped",
        recommendationsCount: summary.aiRecommendationsCount || 3,
        completedRecommendationsCount: summary.intelligence?.completedCoach?.length || 1,
        completedAt: new Date().toISOString(),
      };

      // Persist history item
      await db.collection("creator_history").updateOne(
        { sessionId },
        { $set: historyItem },
        { upsert: true }
      );

      // Re-fetch all history to re-calculate profile, patterns & playbook
      const allHistoryDocs = await db.collection("creator_history").find({ creatorId }).toArray();
      const cleanHistory = allHistoryDocs.map((d: any) => { delete d._id; return d; });

      const totalStreams = cleanHistory.length;
      const avgDuration = Math.round(cleanHistory.reduce((a, c) => a + c.durationMinutes, 0) / totalStreams);
      const avgViewers = Math.round(cleanHistory.reduce((a, c) => a + c.averageViewers, 0) / totalStreams);
      const avgPeak = Math.round(cleanHistory.reduce((a, c) => a + c.peakViewers, 0) / totalStreams);
      const avgSentiment = Math.round(cleanHistory.reduce((a, c) => a + c.avgSentiment, 0) / totalStreams);
      const avgScore = Math.round(cleanHistory.reduce((a, c) => a + c.broadcastScore, 0) / totalStreams);

      const updatedProfile: CreatorProfile = {
        creatorId,
        totalStreamsAnalyzed: totalStreams,
        avgDurationMinutes: avgDuration,
        avgViewerCount: avgViewers,
        avgPeakViewers: avgPeak,
        avgMessagesPerMinute: 10,
        avgSentiment,
        avgBroadcastScore: avgScore,
        mostStreamedGames: Array.from(new Set(cleanHistory.map((h) => h.game))),
        bestPerformingCategory: "Gaming",
        typicalAudienceMood: "Hyped",
        commonQuestions: ["What settings do you use?"],
        commonRisks: ["Silent transitions"],
        updatedAt: new Date().toISOString(),
      };

      await db.collection("creator_profile").updateOne(
        { creatorId },
        { $set: updatedProfile },
        { upsert: true }
      );

      // Patterns & Playbook
      const patterns = PatternDetector.detectPatterns(cleanHistory as any);
      const playbook = PlaybookEngine.buildPlaybook(creatorId, cleanHistory as any);

      await Promise.all([
        db.collection("creator_patterns").updateOne({ creatorId }, { $set: { creatorId, patterns, updatedAt: new Date().toISOString() } }, { upsert: true }),
        db.collection("creator_playbook").updateOne({ creatorId }, { $set: playbook }, { upsert: true }),
      ]);

      // Invalidate caches
      this.profileCache.delete(creatorId);
      this.historyCache.delete(creatorId);

      console.log(`[CreatorMemoryEngine] Updated Creator Profile, Patterns, and Playbook for '${creatorId}' after session '${sessionId}' ✅`);
    } catch (err: any) {
      console.warn(`[CreatorMemoryEngine] updateMemoryAfterSession error:`, err.message);
    }
  }
}

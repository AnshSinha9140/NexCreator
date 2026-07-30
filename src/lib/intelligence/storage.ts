import clientPromise from "@/lib/mongodb";
import {
  CoachRecommendation,
  AudienceMood,
  TopicDetectionDoc,
  OpportunityItem,
  RiskItem,
  BroadcastScoreDoc,
  SessionStoryDoc,
  CreatorActionItem,
  CreatorIntelligenceBundle,
} from "./types";

export class IntelligenceStorage {
  /**
   * Persists generated Creator Intelligence Bundle to MongoDB collections
   */
  public static async saveBundle(sessionId: string, snapshotId: string, bundle: CreatorIntelligenceBundle): Promise<void> {
    try {
      const client = await clientPromise;
      const db = client.db("nexcreator");

      const operations: Promise<any>[] = [];

      if (bundle.coach.length > 0) {
        operations.push(db.collection("creator_coach").insertMany(bundle.coach as any[]));
      }
      if (bundle.mood) {
        operations.push(db.collection("creator_moods").insertOne(bundle.mood as any));
      }
      if (bundle.topics.length > 0) {
        operations.push(db.collection("creator_topics").insertOne({ sessionId, snapshotId, topics: bundle.topics, createdAt: new Date().toISOString() }));
      }
      if (bundle.opportunities.length > 0) {
        operations.push(db.collection("creator_opportunities").insertMany(bundle.opportunities as any[]));
      }
      if (bundle.risks.length > 0) {
        operations.push(db.collection("creator_risks").insertMany(bundle.risks as any[]));
      }
      if (bundle.score) {
        operations.push(db.collection("broadcast_scores").insertOne(bundle.score as any));
      }
      if (bundle.story) {
        operations.push(
          db.collection("session_story").updateOne(
            { sessionId },
            { $set: bundle.story },
            { upsert: true }
          )
        );
      }
      if (bundle.actions.length > 0) {
        operations.push(db.collection("creator_actions").insertMany(bundle.actions as any[]));
      }

      await Promise.all(operations);
      console.log(`[IntelligenceStorage] Successfully stored Intelligence Bundle for session '${sessionId}' ✅`);
    } catch (err: any) {
      console.warn(`[IntelligenceStorage] Storage error for session '${sessionId}':`, err.message);
    }
  }

  /**
   * Fetches latest bundle from MongoDB for session
   */
  public static async fetchLatestBundle(sessionId: string): Promise<CreatorIntelligenceBundle | null> {
    try {
      const client = await clientPromise;
      const db = client.db("nexcreator");

      const [coach, mood, topicsDoc, opportunities, risks, score, story, actions] = await Promise.all([
        db.collection("creator_coach").find({ sessionId }).sort({ createdAt: -1 }).limit(5).toArray(),
        db.collection("creator_moods").findOne({ sessionId }, { sort: { createdAt: -1 } }),
        db.collection("creator_topics").findOne({ sessionId }, { sort: { createdAt: -1 } }),
        db.collection("creator_opportunities").find({ sessionId }).sort({ createdAt: -1 }).limit(5).toArray(),
        db.collection("creator_risks").find({ sessionId }).sort({ createdAt: -1 }).limit(5).toArray(),
        db.collection("broadcast_scores").findOne({ sessionId }, { sort: { createdAt: -1 } }),
        db.collection("session_story").findOne({ sessionId }),
        db.collection("creator_actions").find({ sessionId }).sort({ createdAt: -1 }).limit(10).toArray(),
      ]);

      return {
        coach: (coach as any[]) || [],
        mood: (mood as any) || null,
        topics: topicsDoc?.topics || [],
        opportunities: (opportunities as any[]) || [],
        risks: (risks as any[]) || [],
        score: (score as any) || null,
        story: (story as any) || null,
        actions: (actions as any[]) || [],
      };
    } catch (err: any) {
      console.warn(`[IntelligenceStorage] Fetch error for session '${sessionId}':`, err.message);
      return null;
    }
  }
}

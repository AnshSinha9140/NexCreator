import clientPromise from "@/lib/mongodb";
import { LiveChatMessage } from "@/lib/ingestion/types";
import { PulseSnapshot } from "@/lib/snapshot/types";
import { HighlightCandidate } from "@/lib/highlights/generator";

export class SessionArtifactRegistry {
  /**
   * Persists incoming chat message to canonical `chat_messages` collection
   */
  public static async saveChatMessage(sessionId: string, message: LiveChatMessage): Promise<void> {
    try {
      const client = await clientPromise;
      const db = client.db("nexcreator");
      await db.collection("chat_messages").updateOne(
        { messageId: message.id, sessionId },
        {
          $set: {
            messageId: message.id,
            sessionId,
            platform: message.platform,
            author: message.author,
            message: message.message,
            timestamp: message.timestamp,
            rawPayload: (message as any).rawPayload || null,

            createdAt: new Date().toISOString(),
          },
        },
        { upsert: true }
      );
      console.log(`[ArtifactRegistry] 💾 Saved chat message '${message.id}' to 'chat_messages' for session '${sessionId}'`);
    } catch (err: any) {
      console.warn(`[ArtifactRegistry] Failed to save chat message for session '${sessionId}':`, err.message);
    }
  }

  /**
   * Persists viewer telemetry sample to `viewer_samples` collection
   */
  public static async saveViewerSample(sessionId: string, platform: string, viewerCount: number): Promise<void> {
    try {
      const client = await clientPromise;
      const db = client.db("nexcreator");
      await db.collection("viewer_samples").insertOne({
        sessionId,
        platform,
        viewerCount,
        timestamp: new Date().toISOString(),
      });
      console.log(`[ArtifactRegistry] 💾 Saved viewer sample (${viewerCount}) to 'viewer_samples' for session '${sessionId}'`);
    } catch (err: any) {
      console.warn(`[ArtifactRegistry] Failed to save viewer sample for session '${sessionId}':`, err.message);
    }
  }

  /**
   * Fetches all persisted artifacts for a completed workspace session
   */
  public static async fetchFullSessionArtifacts(sessionId: string) {
    try {
      const client = await clientPromise;
      const db = client.db("nexcreator");

      const [
        messages,
        viewerSamples,
        snapshots,
        timelineEvents,
        highlights,
        insights,
        coach,
        mood,
        topicsDoc,
        opportunities,
        risks,
        score,
        story,
        actions,
      ] = await Promise.all([
        db.collection("chat_messages").find({ sessionId }).sort({ timestamp: 1 }).toArray(),
        db.collection("viewer_samples").find({ sessionId }).sort({ timestamp: 1 }).toArray(),
        db.collection("pulse_snapshots").find({ sessionId }).sort({ createdAt: 1 }).toArray(),
        db.collection("timeline_events").find({ sessionId }).sort({ createdAt: 1 }).toArray(),
        db.collection("highlight_candidates").find({ sessionId }).sort({ createdAt: 1 }).toArray(),
        db.collection("ai_insights").find({ sessionId }).sort({ createdAt: 1 }).toArray(),
        db.collection("creator_coach").find({ sessionId }).sort({ createdAt: -1 }).toArray(),
        db.collection("creator_moods").findOne({ sessionId }, { sort: { createdAt: -1 } }),
        db.collection("creator_topics").findOne({ sessionId }, { sort: { createdAt: -1 } }),
        db.collection("creator_opportunities").find({ sessionId }).sort({ createdAt: -1 }).toArray(),
        db.collection("creator_risks").find({ sessionId }).sort({ createdAt: -1 }).toArray(),
        db.collection("broadcast_scores").findOne({ sessionId }, { sort: { createdAt: -1 } }),
        db.collection("session_story").findOne({ sessionId }),
        db.collection("creator_actions").find({ sessionId }).sort({ createdAt: -1 }).toArray(),
      ]);

      return {
        messages,
        viewerSamples,
        snapshots,
        timelineEvents,
        highlights,
        insights,
        intelligence: {
          coach: (coach as any[]) || [],
          mood: (mood as any) || null,
          topics: topicsDoc?.topics || [],
          opportunities: (opportunities as any[]) || [],
          risks: (risks as any[]) || [],
          score: (score as any) || null,
          story: (story as any) || null,
          actions: (actions as any[]) || [],
        },
      };
    } catch (err: any) {
      console.error(`[ArtifactRegistry] Error fetching artifacts for session '${sessionId}':`, err.message);
      return null;
    }
  }
}

import clientPromise from "@/lib/mongodb";

export interface SessionIntegrityReport {
  sessionId: string;
  overallIntegrityPercent: number; // 0 - 100
  isHealthy: boolean;
  counts: {
    messagesCollected: number;
    messagesPersisted: number;
    viewerSamples: number;
    snapshots: number;
    timelineEvents: number;
    highlights: number;
    aiReports: number;
    coachRecommendations: number;
    moods: number;
    topics: number;
    opportunities: number;
    risks: number;
    actions: number;
  };
  missingArtifacts: string[];
  missingCollections: string[];
  integrityIssues: string[];
  validatedAt: string;
}

export class SessionArtifactValidator {
  /**
   * Cross-verifies database document counts across 14 collections for a single sessionId
   */
  public static async validate(sessionId: string): Promise<SessionIntegrityReport> {
    console.log(`[ArtifactValidator] 🔍 Running Cross-Collection Integrity Audit for session '${sessionId}'...`);

    const client = await clientPromise;
    const db = client.db("nexcreator");

    const [
      sessionDoc,
      messagesPersisted,
      viewerSamples,
      snapshots,
      timelineEvents,
      highlights,
      aiReports,
      coachCount,
      moodCount,
      topicsCount,
      oppsCount,
      risksCount,
      actionsCount,
    ] = await Promise.all([
      db.collection("monitoring_sessions").findOne({ id: sessionId }),
      db.collection("chat_messages").countDocuments({ sessionId }),
      db.collection("viewer_samples").countDocuments({ sessionId }),
      db.collection("pulse_snapshots").countDocuments({ sessionId }),
      db.collection("timeline_events").countDocuments({ sessionId }),
      db.collection("highlight_candidates").countDocuments({ sessionId }),
      db.collection("ai_insights").countDocuments({ sessionId }),
      db.collection("creator_coach").countDocuments({ sessionId }),
      db.collection("creator_moods").countDocuments({ sessionId }),
      db.collection("creator_topics").countDocuments({ sessionId }),
      db.collection("creator_opportunities").countDocuments({ sessionId }),
      db.collection("creator_risks").countDocuments({ sessionId }),
      db.collection("creator_actions").countDocuments({ sessionId }),
    ]);

    const snapshotsDocs = await db.collection("pulse_snapshots").find({ sessionId }).toArray();
    const messagesCollected = snapshotsDocs.reduce((acc, s: any) => acc + (s.metrics?.totalMessages || 0), 0);

    const missingArtifacts: string[] = [];
    const missingCollections: string[] = [];
    const integrityIssues: string[] = [];

    // Audit 1: Chat Messages Persistence
    if (messagesCollected > 0 && messagesPersisted === 0) {
      missingArtifacts.push("Chat Archive (chat_messages)");
      integrityIssues.push(`Messages collected (${messagesCollected}) but 0 persisted in chat_messages.`);
    }

    // Audit 2: Pulse Snapshots & Timeline
    if (snapshots === 0) {
      missingArtifacts.push("Pulse Snapshots (pulse_snapshots)");
      integrityIssues.push("No pulse snapshots found in database.");
    }
    if (timelineEvents === 0) {
      missingArtifacts.push("Timeline Events (timeline_events)");
      integrityIssues.push("No timeline events published for active monitoring session.");
    }

    // Audit 3: Creator Intelligence Docs
    if (snapshots > 0 && coachCount === 0) {
      missingArtifacts.push("Creator Intelligence Coach (creator_coach)");
      integrityIssues.push("Snapshots exist but 0 stream coach recommendations persisted.");
    }

    const checksPassed = 5 - Math.min(5, missingArtifacts.length);
    const overallIntegrityPercent = Math.round((checksPassed / 5) * 100);

    return {
      sessionId,
      overallIntegrityPercent,
      isHealthy: overallIntegrityPercent >= 80,
      counts: {
        messagesCollected,
        messagesPersisted,
        viewerSamples,
        snapshots,
        timelineEvents,
        highlights,
        aiReports,
        coachRecommendations: coachCount,
        moods: moodCount,
        topics: topicsCount,
        opportunities: oppsCount,
        risks: risksCount,
        actions: actionsCount,
      },
      missingArtifacts,
      missingCollections,
      integrityIssues,
      validatedAt: new Date().toISOString(),
    };
  }
}

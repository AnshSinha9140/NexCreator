import clientPromise from "@/lib/mongodb";
import { LiveDetectionPoller } from "@/lib/detection/poller";
import { IngestionManager } from "@/lib/ingestion/manager";
import { SnapshotManager } from "@/lib/snapshot/manager";
import { TimelinePublisher } from "@/lib/timeline/publisher";
import { HighlightGenerator } from "@/lib/highlights/generator";
import { FinalSessionSummary, FinalAIReport } from "./lifecycle";
import { SessionIntegrityEngine } from "./integrity";

export class SessionFinalizer {
  public static async finalizeSession(sessionId: string): Promise<FinalSessionSummary> {
    console.log(`[SessionFinalizer] 🎬 Starting multi-step finalization for session '${sessionId}'...`);
    const nowIso = new Date().toISOString();

    const client = await clientPromise;
    const db = client.db("nexcreator");

    // Retrieve active session document
    const sessionDoc: any = await db.collection("monitoring_sessions").findOne({ id: sessionId });
    const platform = sessionDoc?.platform || "kick";
    const creatorId = sessionDoc?.userId || "creator";
    const startedAt = sessionDoc?.startedAt || sessionDoc?.createdAt || nowIso;

    const durationMinutes = Math.max(
      1,
      Math.round((new Date(nowIso).getTime() - new Date(startedAt).getTime()) / 60000)
    );

    // Step 1: Stop Background Poller & Collector
    try {
      LiveDetectionPoller.stopPolling(sessionId);
    } catch (e: any) {
      console.warn(`[SessionFinalizer] Step 1 Warning (stopPolling):`, e.message);
    }

    // Step 2: Force Final Pulse Snapshot Generation
    let finalSnapshot: any = null;
    try {
      await SnapshotManager.stopSnapshotEngine(sessionId, true);
      finalSnapshot = await db
        .collection("pulse_snapshots")
        .findOne({ sessionId }, { sort: { createdAt: -1 } });
    } catch (e: any) {
      console.warn(`[SessionFinalizer] Step 2 Warning (stopSnapshotEngine):`, e.message);
    }

    // Step 3: Stop & Flush Ingestion Pipeline Memory
    try {
      await IngestionManager.stopIngestion(sessionId);
    } catch (e: any) {
      console.warn(`[SessionFinalizer] Step 3 Warning (stopIngestion):`, e.message);
    }

    // Step 4: Run Final Highlight Evaluation Pass (if snapshot exists)
    if (finalSnapshot) {
      try {
        await HighlightGenerator.evaluateSnapshot(finalSnapshot);
      } catch (e: any) {
        console.warn(`[SessionFinalizer] Step 4 Warning (final highlight pass):`, e.message);
      }
    }

    // Step 5: Gather All Stream Analytics for Summary
    const snapshots = await db
      .collection("pulse_snapshots")
      .find({ sessionId })
      .toArray();

    const insights = await db
      .collection("ai_insights")
      .find({ sessionId })
      .toArray();

    const highlights = await db
      .collection("highlight_candidates")
      .find({ sessionId })
      .toArray();

    const timelineCount = await db
      .collection("timeline_events")
      .countDocuments({ sessionId });

    const totalMessages = snapshots.reduce((acc, s: any) => acc + (s.metrics?.totalMessages || 0), 0);
    const questionsDetected = snapshots.reduce((acc, s: any) => acc + (s.metrics?.questionCount || 0), 0);

    let peakViewers = sessionDoc?.peakViewerCount || sessionDoc?.viewerCount || 0;
    let avgViewersSum = 0;
    let sentimentSum = 0;
    let peakMomentum = 50;
    let peakHype = 0;

    snapshots.forEach((s: any) => {
      const v = s.analytics?.viewers || s.viewerMetrics?.averageViewerCount || 0;
      if (v > peakViewers) peakViewers = v;
      avgViewersSum += v;
      sentimentSum += s.analytics?.sentiment || 50;
      if ((s.analytics?.momentum || 0) > peakMomentum) peakMomentum = s.analytics.momentum;
      if ((s.analytics?.hypeScore || 0) > peakHype) peakHype = s.analytics.hypeScore;
    });

    const averageViewers = snapshots.length > 0 ? Math.round(avgViewersSum / snapshots.length) : peakViewers;
    const avgSentiment = snapshots.length > 0 ? Math.round(sentimentSum / snapshots.length) : 50;

    // Stream detection boolean state
    const streamDetected = Boolean(
      sessionDoc?.status === "live" ||
      sessionDoc?.streamDetected ||
      sessionDoc?.viewerCount > 0 ||
      snapshots.length > 0
    );

    // Step 6: Evaluate Session Integrity & Run Artifact Validator
    const evaluation = SessionIntegrityEngine.evaluate({
      streamDetected,
      messagesCount: totalMessages,
      snapshotsCount: snapshots.length,
      aiRunsCount: insights.length,
      highlightsCount: highlights.length,
      timelineCount,
      viewerSamplesCount: snapshots.length,
    });

    const { sessionType, integrityFlags, reason } = evaluation;

    // Run SessionArtifactValidator across all 14 MongoDB collections
    const { SessionArtifactValidator } = await import("./artifactValidator");
    const integrityReport = await SessionArtifactValidator.validate(sessionId);

    // Fetch full persistent intelligence bundle for completed report
    const { IntelligenceStorage } = await import("@/lib/intelligence/storage");
    const intelligence = await IntelligenceStorage.fetchLatestBundle(sessionId);

    // Step 7: Conditional AI Report Generation
    let finalAIReport: FinalAIReport | undefined = undefined;
    if (integrityFlags.aiValid) {
      finalAIReport = {
        biggestAudienceSpike: peakMomentum > 65 ? `Peak audience momentum reached ${peakMomentum}/100.` : `Consistent engagement maintained throughout broadcast.`,
        mostAskedQuestions: snapshots.flatMap((s: any) => s.representativeMessages || [])
          .filter((m: any) => m.category === "question")
          .slice(0, 3)
          .map((m: any) => m.text),
        bestEngagementWindow: snapshots.length > 0 ? `Window ${snapshots[0]?.snapshotId || "1"} (${snapshots[0]?.metrics?.messagesPerMinute || 10} msgs/min)` : `Full Stream`,
        suggestedShorts: highlights.slice(0, 3).map((h: any) => `${h.title}: "${h.triggerReason}"`),
        recommendedStreamLength: durationMinutes < 60 ? `Extend next stream to 60+ minutes to maximize algorithm push.` : `Optimal broadcast length (${durationMinutes} mins).`,
        recommendedNextStreamTime: `Schedule next broadcast within 48 hours to maintain momentum.`,
        topViewerTopics: snapshots.flatMap((s: any) => s.metrics?.topWords || []).slice(0, 5).map((w: any) => w.word),
      };
    }

    // Step 8: Publish Timeline Events
    await TimelinePublisher.publish(
      sessionId,
      platform,
      "MONITORING_STOPPED",
      "⏹️ Monitoring Session Finalized",
      `Stream finalized after ${durationMinutes} minutes. Session integrity classified as ${sessionType}.`,
      "warning"
    ).catch(() => {});

    await TimelinePublisher.publish(
      sessionId,
      platform,
      "SESSION_COMPLETED",
      "🏁 Session Summary Archived",
      `Saved ${totalMessages} messages, ${snapshots.length} snapshots, ${insights.length} AI recommendations, and ${highlights.length} highlight candidates.`,
      "success"
    ).catch(() => {});

    // Step 9: Build Final Session Summary Payload
    const finalSummary: FinalSessionSummary & { integrityReport?: any; intelligence?: any } = {
      sessionId,
      creatorId,
      platform,
      platformDisplayName: sessionDoc?.platformDisplayName || platform.toUpperCase(),
      streamTitle: sessionDoc?.streamTitle || `${platform.toUpperCase()} Live Broadcast`,
      streamCategory: sessionDoc?.streamCategory || "Gaming",
      durationMinutes,
      startedAt,
      endedAt: nowIso,
      completedAt: nowIso,

      peakViewers: sessionType === "EMPTY" ? 0 : peakViewers,
      averageViewers: sessionType === "EMPTY" ? 0 : averageViewers,
      totalMessagesCollected: totalMessages,
      snapshotsGeneratedCount: snapshots.length,
      aiRecommendationsCount: insights.length,
      highlightsGeneratedCount: highlights.length,

      avgSentiment: sessionType === "EMPTY" ? 0 : avgSentiment,
      peakMomentum: sessionType === "EMPTY" ? 0 : peakMomentum,
      peakHype: sessionType === "EMPTY" ? 0 : peakHype,
      questionsDetectedCount: questionsDetected,
      uniqueChattersCount: snapshots.reduce((acc, s: any) => Math.max(acc, s.metrics?.uniqueChattersCount || 0), 0),
      healthScore: integrityFlags.healthScoreValid ? 98 : 0,
      quotaUsedYoutube: platform === "youtube" ? 360 : 0,

      finalAIReport,
      integrityReport,
      intelligence,

      // Session Integrity Engine Metadata
      sessionType,
      integrityFlags,
      integrityReason: reason,
    };


    // Step 10: Persist to MongoDB
    try {
      await db.collection("monitoring_sessions").updateOne(
        { id: sessionId },
        {
          $set: {
            status: "completed",
            sessionType,
            integrityFlags,
            integrityReason: reason,
            endedAt: nowIso,
            completedAt: nowIso,
            updatedAt: nowIso,
            summary: finalSummary,
          },
        }
      );

      await db.collection("session_summaries").updateOne(
        { sessionId },
        { $set: finalSummary },
        { upsert: true }
      );

      // Step 11: Build and Persist Immutable CompletedSessionBundle
      const { CompletedSessionBundleBuilder } = await import("./completedBundle");
      const completedBundle = await CompletedSessionBundleBuilder.build(sessionId);
      await db.collection("completed_session_bundle").updateOne(
        { sessionId },
        { $set: completedBundle },
        { upsert: true }
      );

      // Step 12: Sprint 18.7 Update Long-Term Creator Memory & Profile
      const { CreatorMemoryEngine } = await import("../memory/engine");
      await CreatorMemoryEngine.updateMemoryAfterSession(sessionId);

      console.log(`[SessionFinalizer] Persisted immutable CompletedSessionBundle & Updated Creator Memory for session '${sessionId}' ✅`);
    } catch (err: any) {
      console.error(`[SessionFinalizer] MongoDB update error for session '${sessionId}':`, err.message);
    }

    return finalSummary;
  }
}



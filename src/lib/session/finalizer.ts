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

    // Step 7: Generate Canonical Session Intelligence (Executes ONCE)
    const { SessionIntelligenceEngine } = await import("@/lib/intelligence/SessionIntelligenceEngine");
    const canonicalIntelligence = await SessionIntelligenceEngine.generate(sessionId, creatorId);

    // Final AI Report derived from canonical intelligence
    const finalAIReport: FinalAIReport = {
      biggestAudienceSpike: canonicalIntelligence.discoveries[0]?.discovery || `Peak engagement reached ${canonicalIntelligence.telemetry.peakMomentum}/100.`,
      mostAskedQuestions: canonicalIntelligence.audience.frequentlyAskedQuestions.slice(0, 3),
      bestEngagementWindow: canonicalIntelligence.highlights[0]
        ? `Highlight #1 (${canonicalIntelligence.highlights[0].timestamp})`
        : `Full Stream`,
      suggestedShorts: canonicalIntelligence.highlights.slice(0, 3).map((h) => `${h.title}: "${h.triggerReason}"`),
      recommendedStreamLength: durationMinutes < 60 ? `Extend next stream to 60+ minutes to maximize algorithm push.` : `Optimal broadcast length (${durationMinutes} mins).`,
      recommendedNextStreamTime: `Schedule next broadcast within 48 hours to maintain momentum.`,
      topViewerTopics: canonicalIntelligence.audience.mostDiscussedTopics,
    };

    // Step 8: Publish Timeline Events (Internal diagnostic archive)
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
      `Saved ${totalMessages} messages, ${canonicalIntelligence.highlights.length} approved highlights, and full Canonical Session Intelligence.`,
      "success"
    ).catch(() => {});

    // Step 9: Build Final Session Summary Payload
    const finalSummary: FinalSessionSummary & { integrityReport?: any; intelligence?: any; sessionIntelligence?: any } = {
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

      peakViewers: sessionType === "EMPTY" ? 0 : canonicalIntelligence.telemetry.peakViewers,
      averageViewers: sessionType === "EMPTY" ? 0 : canonicalIntelligence.telemetry.averageViewers,
      totalMessagesCollected: canonicalIntelligence.telemetry.totalMessages,
      snapshotsGeneratedCount: snapshots.length,
      aiRecommendationsCount: canonicalIntelligence.recommendations.length,
      highlightsGeneratedCount: canonicalIntelligence.highlights.length,

      avgSentiment: sessionType === "EMPTY" ? 0 : canonicalIntelligence.telemetry.avgSentiment,
      peakMomentum: sessionType === "EMPTY" ? 0 : canonicalIntelligence.telemetry.peakMomentum,
      peakHype: sessionType === "EMPTY" ? 0 : canonicalIntelligence.telemetry.peakHype,
      questionsDetectedCount: canonicalIntelligence.telemetry.questionsDetected,
      uniqueChattersCount: canonicalIntelligence.telemetry.uniqueChatters,
      healthScore: canonicalIntelligence.telemetry.healthScore,
      quotaUsedYoutube: platform === "youtube" ? 360 : 0,

      finalAIReport,
      integrityReport,
      intelligence: canonicalIntelligence,
      sessionIntelligence: canonicalIntelligence,

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

      // Step 12: Update Long-Term Creator Memory & Profile
      const { CreatorMemoryEngine } = await import("../memory/engine");
      await CreatorMemoryEngine.updateMemoryAfterSession(sessionId);

      // Step 13: Evolve the living DNA and mission only from validated canonical intelligence.
      try {
        const { resolveCreator } = await import("@/lib/creatorAudit/persistence");
        const { IdentityUpdateEngine } = await import("@/lib/identity/IdentityUpdateEngine");
        const resolved = await resolveCreator(creatorId);
        if (resolved.canonicalCreatorId) {
          await IdentityUpdateEngine.processSession(resolved.canonicalCreatorId, canonicalIntelligence);
        }
      } catch (identityError: any) {
        console.warn(`[SessionFinalizer] Living identity update skipped: ${identityError.message}`);
      }

      console.log(`[SessionFinalizer] Persisted immutable CompletedSessionBundle & Updated Creator Memory for session '${sessionId}' ✅`);
    } catch (err: any) {
      console.error(`[SessionFinalizer] MongoDB update error for session '${sessionId}':`, err.message);
    }

    return finalSummary;
  }
}

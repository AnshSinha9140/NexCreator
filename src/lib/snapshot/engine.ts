import clientPromise from "@/lib/mongodb";
import { IngestionPipeline } from "@/lib/ingestion/manager";
import { PulseSnapshot, PulseSnapshotMetrics } from "./types";
import { selectRepresentativeMessages } from "./selector";
import { computeEngagementSignals } from "./signals";
import { SNAPSHOT_CONFIG } from "./config";
import { AIProducer } from "@/lib/ai/producer";
import { DiagnosticsLogger } from "@/lib/diagnostics/logger";
import { DiagnosticsState } from "@/lib/diagnostics/state";

export class SnapshotEngine {
  /**
   * Generates a single PulseSnapshot from working memory and persists 1 document to MongoDB
   */
  public static async generateSnapshot(
    pipeline: IngestionPipeline,
    isFinalPartial: boolean = false
  ): Promise<PulseSnapshot | null> {
    const { sessionId, platform, buffer, accumulator, collector } = pipeline;

    const messages = buffer.getMessages();
    const metricsSummary = accumulator.getMetricsSummary();

    // Skip snapshots when there is zero chat activity (channel offline or not yet live)
    if (messages.length === 0) {
      if (isFinalPartial) {
        console.log(`[SnapshotEngine] Skipping empty final partial snapshot for session '${sessionId}'`);
      } else {
        console.log(`[SnapshotEngine] ⏭️ Skipping regular snapshot — 0 messages in buffer for session '${sessionId}'. Channel may be offline or ingestion not receiving messages.`);
      }
      return null;
    }

    console.log(`[SnapshotEngine] 📸 Generating snapshot for session '${sessionId}' with ${messages.length} messages.`);

    const now = new Date();
    const windowStart = buffer.getMetadata().oldestTimestamp
      ? new Date(buffer.getMetadata().oldestTimestamp!)
      : new Date(now.getTime() - SNAPSHOT_CONFIG.SNAPSHOT_INTERVAL_MS);

    const windowEnd = now;
    const durationSeconds = Math.max(
      1,
      Math.round((windowEnd.getTime() - windowStart.getTime()) / 1000)
    );

    // Resolve creatorId, viewer metrics, and stream metadata from active DB session
    let creatorId = "creator";
    let streamTitle = `${platform.toUpperCase()} Live Broadcast`;
    let streamCategory = "Gaming";
    let streamLanguage: string | null = "English";
    let currentViewerCount: number | null = null;
    let peakViewerCount: number | null = null;

    try {
      const client = await clientPromise;
      const db = client.db("nexcreator");
      const sessionDoc = await db.collection("monitoring_sessions").findOne({ id: sessionId });
      if (sessionDoc) {
        if (sessionDoc.userId) creatorId = sessionDoc.userId;
        if (sessionDoc.streamTitle) streamTitle = sessionDoc.streamTitle;
        if (sessionDoc.streamCategory) streamCategory = sessionDoc.streamCategory;
        if (sessionDoc.streamLanguage) streamLanguage = sessionDoc.streamLanguage;
        if (typeof sessionDoc.viewerCount === "number") currentViewerCount = sessionDoc.viewerCount;
        if (typeof sessionDoc.peakViewerCount === "number") peakViewerCount = sessionDoc.peakViewerCount;
      }
    } catch (e) {}

    // Calculate metrics payload
    const snapshotMetrics: PulseSnapshotMetrics = {
      totalMessages: metricsSummary.totalMessages,
      messagesPerMinute: metricsSummary.messagesPerMinute,
      peakMessagesPerMinute: Math.max(metricsSummary.messagesPerMinute, metricsSummary.totalMessages),
      uniqueChattersCount: metricsSummary.uniqueChattersCount,
      avgMessageLength: metricsSummary.messageLengthStats.avgLength,
      questionCount: metricsSummary.questionCount,
      replyCount: metricsSummary.replyCount,
      topEmojis: metricsSummary.topEmojis,
      topWords: metricsSummary.topWords,
    };

    // Extract Ingestion Health Stats
    const stats = collector.getStats();
    const rawReceived = stats.totalMessagesReceived;
    const processed = snapshotMetrics.totalMessages;
    const duplicatesIgnored = Math.max(0, rawReceived - processed);

    const ingestionHealth = {
      messagesProcessed: processed,
      messagesDropped: 0,
      duplicateMessagesIgnored: duplicatesIgnored,
      reconnectCount: stats.reconnectCount,
    };

    // Viewer Metrics
    const viewerMetrics = {
      averageViewerCount: currentViewerCount,
      peakViewerCount: peakViewerCount || currentViewerCount,
      minimumViewerCount: currentViewerCount,
    };

    // Stream Metadata
    const streamMetadata = {
      title: streamTitle,
      category: streamCategory,
      language: streamLanguage,
    };

    // Intelligently select 10 - 20 representative messages for future AI analysis
    const representativeMessages = selectRepresentativeMessages(
      messages,
      SNAPSHOT_CONFIG.MAX_REPRESENTATIVE_MESSAGES
    );

    // Compute rule-based engagement signals
    const engagementSignals = SNAPSHOT_CONFIG.ENABLE_RULE_SIGNALS
      ? computeEngagementSignals(snapshotMetrics, durationSeconds)
      : [];

    const snapshotId = `snap_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    const snapshotDoc: PulseSnapshot = {
      snapshotVersion: 1, // Schema versioning
      snapshotId,
      sessionId,
      creatorId,
      platform,
      windowStart: windowStart.toISOString(),
      windowEnd: windowEnd.toISOString(),
      durationSeconds,
      viewerMetrics,
      streamMetadata,
      ingestionHealth,
      metrics: snapshotMetrics,
      representativeMessages,
      engagementSignals,
      isFinalPartial,
      createdAt: now.toISOString(),
    };

    // Persist EXACTLY ONE MongoDB Document to pulse_snapshots collection
    try {
      const client = await clientPromise;
      const db = client.db("nexcreator");
      await db.collection("pulse_snapshots").insertOne(snapshotDoc);
      console.log(
        `[SnapshotEngine] Persisted 1 Enriched PulseSnapshot (v1) document for session '${sessionId}' (${snapshotMetrics.totalMessages} msgs, ${representativeMessages.length} samples) ✅`
      );
      DiagnosticsLogger.log("Snapshot", "Persist", `Persisted snapshot for session '${sessionId}'`);
      const state = DiagnosticsState.getState();
      DiagnosticsState.updateSubsystem("snapshot", {
        status: "healthy",
        lastSuccess: new Date().toISOString(),
        lastSnapshot: snapshotId,
        representativeMessages: representativeMessages.length,
        generatedSnapshots: (state.snapshot.generatedSnapshots || 0) + 1
      });

      // Asynchronously trigger AI Producer platform pipeline in isolated background boundary
      AIProducer.processSnapshot(snapshotDoc).catch((aiErr) => {
        console.warn(`[SnapshotEngine] AI Producer background trigger warning for session '${sessionId}': ${aiErr.message}`);
      });
    } catch (err: any) {
      console.error(`[SnapshotEngine] MongoDB persist error for session '${sessionId}':`, err.message);
      DiagnosticsLogger.error("Snapshot", "Persist", `MongoDB persist error for session '${sessionId}'`, err.message);
      DiagnosticsState.updateSubsystem("snapshot", { status: "failed", lastFailure: new Date().toISOString(), lastError: err.message });
    }

    // Reset buffer and accumulator working memory for the next window
    buffer.clear();
    accumulator.reset();

    return snapshotDoc;
  }
}

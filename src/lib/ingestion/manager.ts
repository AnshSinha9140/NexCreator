import { SupportedPlatform } from "@/types";
import { ChatCollector, LiveChatMessage } from "./types";
import { KickChatCollector } from "./kickCollector";
import { RollingSessionBuffer } from "./buffer";
import { LiveMetricsAccumulator } from "./accumulator";
import { DiagnosticsState } from "@/lib/diagnostics/state";
import { CollectorFactory } from "@/lib/collectors/base/collectorFactory";
import { CollectorManager } from "@/lib/collectors/base/collectorManager";

export interface IngestionPipeline {
  sessionId: string;
  platform: SupportedPlatform;
  collector: ChatCollector;
  buffer: RollingSessionBuffer;
  accumulator: LiveMetricsAccumulator;
  unsubscribe: () => void;
  startedAt: string;
}

const globalWithIngestion = global as typeof globalThis & {
  _activeIngestions?: Map<string, IngestionPipeline>;
};

if (!globalWithIngestion._activeIngestions) {
  globalWithIngestion._activeIngestions = new Map();
}

export class IngestionManager {
  /**
   * Checks if an ingestion pipeline is active for the given sessionId
   */
  public static isIngesting(sessionId: string): boolean {
    return globalWithIngestion._activeIngestions!.has(sessionId);
  }

  /**
   * Starts live chat ingestion for a Monitoring Session
   */
  public static async startIngestion(
    sessionId: string,
    platform: SupportedPlatform,
    channelHandle?: string,
    chatroomId?: string
  ): Promise<void> {
    if (this.isIngesting(sessionId)) {
      console.log(`[IngestionManager] Ingestion already active for session '${sessionId}'`);
      return;
    }

    console.log(`[IngestionManager] Starting live chat ingestion for session '${sessionId}' (${platform})...`);

    // 1. Initialize In-Memory Buffer & Accumulator
    const buffer = new RollingSessionBuffer(sessionId);
    const accumulator = new LiveMetricsAccumulator(sessionId);

    // 2. Instantiate Platform Collector via CollectorFactory
    const collector: ChatCollector = CollectorFactory.create(platform, sessionId, { channelHandle, chatroomId });
    CollectorManager.register(sessionId, collector as any);

    // 3. Connect Pipeline: Collector ➔ Buffer + Accumulator
    const unsubscribe = collector.onMessage((msg: LiveChatMessage) => {
      // Add to 10-minute Rolling Buffer (FIFO)
      buffer.add(msg);
      // Process real-time in-memory metrics
      accumulator.processMessage(msg);
      console.log(`[Parser E2E Trace] -> Rolling Buffer Write -> Accumulator Updated -> Representative Candidate Added -> Snapshot Eligible`);
      DiagnosticsState.updateSubsystem("collector", { lastBufferWrite: new Date().toISOString() });
    });

    const pipeline: IngestionPipeline = {
      sessionId,
      platform,
      collector,
      buffer,
      accumulator,
      unsubscribe,
      startedAt: new Date().toISOString(),
    };

    globalWithIngestion._activeIngestions!.set(sessionId, pipeline);

    // 4. Connect Chat Collector
    try {
      await collector.connect();
    } catch (err: any) {
      console.error(`[IngestionManager] Failed to connect collector for session '${sessionId}':`, err.message);
    }
  }

  /**
   * Stops live chat ingestion and cleans up memory
   */
  public static async stopIngestion(sessionId: string): Promise<void> {
    const pipeline = globalWithIngestion._activeIngestions!.get(sessionId);
    if (!pipeline) return;

    console.log(`[IngestionManager] Stopping live chat ingestion for session '${sessionId}'...`);

    // 1. Unsubscribe listener
    try {
      pipeline.unsubscribe();
    } catch (e) {}

    // 2. Disconnect Collector
    try {
      await pipeline.collector.disconnect();
    } catch (e) {}

    // 3. Clear In-Memory Buffer & Accumulator
    pipeline.buffer.clear();
    pipeline.accumulator.reset();

    // 4. Remove from active registry
    CollectorManager.unregister(sessionId);
    globalWithIngestion._activeIngestions!.delete(sessionId);
    console.log(`[IngestionManager] Cleared ingestion pipeline memory for session '${sessionId}' ✅`);
  }

  /**
   * Retrieves lightweight telemetry for a session
   */
  public static getTelemetry(sessionId: string) {
    const pipeline = globalWithIngestion._activeIngestions!.get(sessionId);
    if (!pipeline) {
      return {
        sessionId,
        isIngesting: false,
        status: "stopped",
        health: "healthy",
        connectionState: "Disconnected",
        bufferSize: 0,
        messagesPerMinute: 0,
        stats: null,
        metricsSummary: null,
      };
    }

    const collectorStats = pipeline.collector.getStats();
    const metricsSummary = pipeline.accumulator.getMetricsSummary();
    const bufferMeta = pipeline.buffer.getMetadata();

    return {
      sessionId,
      isIngesting: true,
      platform: pipeline.platform,
      status: pipeline.collector.getStatus(),
      health: pipeline.collector.getHealth(),
      connectionState: pipeline.collector.getStatus() === "connected" ? "Connected" : "Reconnecting",
      bufferSize: bufferMeta.count,
      bufferCapacity: bufferMeta.maxCapacity,
      messagesPerMinute: metricsSummary.messagesPerMinute,
      stats: collectorStats,
      metricsSummary,
      startedAt: pipeline.startedAt,
    };
  }

  /**
   * Retrieves active session pipeline instance (for future Pulse Snapshot Engine)
   */
  public static getPipeline(sessionId: string): IngestionPipeline | undefined {
    return globalWithIngestion._activeIngestions!.get(sessionId);
  }
}

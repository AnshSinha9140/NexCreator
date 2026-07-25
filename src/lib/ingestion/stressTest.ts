import { LiveChatMessage } from "./types";
import { RollingSessionBuffer } from "./buffer";
import { LiveMetricsAccumulator } from "./accumulator";
import { INGESTION_CONFIG } from "./config";

export interface StressTestOptions {
  messagesPerMinute: number;
  durationSeconds?: number;
}

export interface StressTestResult {
  targetRatePerMin: number;
  durationSeconds: number;
  totalMessagesSimulated: number;
  totalMessagesProcessed: number;
  droppedMessagesCount: number;
  actualRatePerMin: number;
  avgLatencyMicrosPerMessage: number;
  memoryUsageBeforeMb: {
    heapUsed: number;
    heapTotal: number;
    rss: number;
  };
  memoryUsageAfterMb: {
    heapUsed: number;
    heapTotal: number;
    rss: number;
  };
  heapDeltaMb: number;
  bufferSizeAtEnd: number;
  metricsSummaryAtEnd: any;
}

const SAMPLE_USERS = ["Xqc", "KaiCenat", "Pokimane", "Ninja", "Shroud", "Ludwig", "Asmongold", "Amouranth"];
const SAMPLE_MESSAGES = [
  "POGGERS OMG THAT WAS INSANE 🔥🔥",
  "LMAO what is happening here??? 😂",
  "w stream fr fr",
  "Can you play Minecraft next stream?",
  "GG WP bro that final kill was clean",
  "@KaiCenat check Discord DMs!",
  "Is this recorded or live right now?",
  "sub hype!! 🚀🚀🚀",
  "chat moving so fast nobody will see I love cats ❤️",
  "clip that!! clip it fast!!",
];

export class IngestionStressTester {
  /**
   * Generates a realistic mock normalized LiveChatMessage
   */
  private static generateMockMessage(index: number, sessionId: string): LiveChatMessage {
    const user = SAMPLE_USERS[index % SAMPLE_USERS.length];
    const text = SAMPLE_MESSAGES[index % SAMPLE_MESSAGES.length];

    return {
      id: `stress_msg_${Date.now()}_${index}_${Math.random().toString(36).substring(2, 6)}`,
      sessionId,
      platform: "kick",
      timestamp: new Date(),
      author: {
        id: `usr_${index % 100}`,
        username: user,
        displayName: user,
        badges: index % 3 === 0 ? ["sub", "vip"] : [],
      },
      message: text,
      emotes: index % 2 === 0 ? ["🔥", "🚀"] : [],
      raw: INGESTION_CONFIG.DEBUG_MODE ? { mockIndex: index } : undefined,
    };
  }

  /**
   * Executes a high-volume chat ingestion stress test
   */
  public static runTest(options: StressTestOptions): StressTestResult {
    const targetRate = options.messagesPerMinute;
    const durationSec = options.durationSeconds || 5; // Default 5 seconds run
    const totalToSimulate = Math.round((targetRate / 60) * durationSec);

    const sessionId = `stress_test_sess_${Date.now()}`;
    const buffer = new RollingSessionBuffer(sessionId);
    const accumulator = new LiveMetricsAccumulator(sessionId);

    // Record initial memory
    const memBefore = process.memoryUsage();

    let processedCount = 0;
    let droppedCount = 0;

    const startTime = performance.now();

    for (let i = 0; i < totalToSimulate; i++) {
      const msg = this.generateMockMessage(i, sessionId);
      try {
        buffer.add(msg);
        accumulator.processMessage(msg);
        processedCount++;
      } catch (err) {
        droppedCount++;
      }
    }

    const endTime = performance.now();
    const elapsedMs = endTime - startTime;

    // Record final memory
    const memAfter = process.memoryUsage();

    const bytesToMb = (bytes: number) => Math.round((bytes / 1024 / 1024) * 100) / 100;

    const heapBeforeMb = bytesToMb(memBefore.heapUsed);
    const heapAfterMb = bytesToMb(memAfter.heapUsed);

    const avgLatencyMicros =
      processedCount > 0 ? Math.round((elapsedMs * 1000) / processedCount) : 0;
    const actualRatePerMin =
      elapsedMs > 0 ? Math.round((processedCount / (elapsedMs / 1000)) * 60) : 0;

    return {
      targetRatePerMin: targetRate,
      durationSeconds: durationSec,
      totalMessagesSimulated: totalToSimulate,
      totalMessagesProcessed: processedCount,
      droppedMessagesCount: droppedCount,
      actualRatePerMin,
      avgLatencyMicrosPerMessage: avgLatencyMicros,
      memoryUsageBeforeMb: {
        heapUsed: heapBeforeMb,
        heapTotal: bytesToMb(memBefore.heapTotal),
        rss: bytesToMb(memBefore.rss),
      },
      memoryUsageAfterMb: {
        heapUsed: heapAfterMb,
        heapTotal: bytesToMb(memAfter.heapTotal),
        rss: bytesToMb(memAfter.rss),
      },
      heapDeltaMb: Math.round((heapAfterMb - heapBeforeMb) * 100) / 100,
      bufferSizeAtEnd: buffer.size(),
      metricsSummaryAtEnd: accumulator.getMetricsSummary(),
    };
  }
}

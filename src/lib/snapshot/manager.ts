import { IngestionManager } from "@/lib/ingestion/manager";
import { SnapshotEngine } from "./engine";
import { SNAPSHOT_CONFIG } from "./config";

const globalWithSnapshotTimers = global as typeof globalThis & {
  _activeSnapshotTimers?: Map<string, NodeJS.Timeout>;
};

if (!globalWithSnapshotTimers._activeSnapshotTimers) {
  globalWithSnapshotTimers._activeSnapshotTimers = new Map();
}

export class SnapshotManager {
  /**
   * Checks if snapshot engine timer is running for sessionId
   */
  public static isEngineRunning(sessionId: string): boolean {
    return globalWithSnapshotTimers._activeSnapshotTimers!.has(sessionId);
  }

  /**
   * Starts the 10-minute recurring Pulse Snapshot generation loop
   */
  public static startSnapshotEngine(sessionId: string): void {
    if (this.isEngineRunning(sessionId)) return;

    console.log(
      `[SnapshotManager] Starting 10-minute Pulse Snapshot timer for session '${sessionId}'...`
    );

    const intervalId = setInterval(async () => {
      try {
        const pipeline = IngestionManager.getPipeline(sessionId);
        if (pipeline) {
          await SnapshotEngine.generateSnapshot(pipeline, false);
        } else {
          console.warn(`[SnapshotManager] Ingestion pipeline missing for session '${sessionId}' during snapshot cycle.`);
        }
      } catch (err: any) {
        console.error(`[SnapshotManager] Snapshot generation error for session '${sessionId}':`, err.message);
      }
    }, SNAPSHOT_CONFIG.SNAPSHOT_INTERVAL_MS);

    globalWithSnapshotTimers._activeSnapshotTimers!.set(sessionId, intervalId);
  }

  /**
   * Stops snapshot engine and automatically generates ONE FINAL PARTIAL SNAPSHOT if buffered data exists
   */
  public static async stopSnapshotEngine(
    sessionId: string,
    generateFinalPartial: boolean = true
  ): Promise<void> {
    const timerId = globalWithSnapshotTimers._activeSnapshotTimers!.get(sessionId);
    if (timerId) {
      clearInterval(timerId);
      globalWithSnapshotTimers._activeSnapshotTimers!.delete(sessionId);
      console.log(`[SnapshotManager] Cleared snapshot timer for session '${sessionId}'`);
    }

    if (generateFinalPartial) {
      try {
        const pipeline = IngestionManager.getPipeline(sessionId);
        if (pipeline) {
          console.log(`[SnapshotManager] Compiling final partial snapshot for session '${sessionId}'...`);
          await SnapshotEngine.generateSnapshot(pipeline, true);
        }
      } catch (err: any) {
        console.error(`[SnapshotManager] Final partial snapshot error for session '${sessionId}':`, err.message);
      }
    }
  }
}

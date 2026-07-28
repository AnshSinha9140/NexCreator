import { BaseCollector } from "./collector";
import { CollectorDiagnostics } from "./types";
import { SupportedPlatform } from "@/types";

const globalWithCollectors = global as typeof globalThis & {
  _activeCollectorInstances?: Map<string, BaseCollector>;
};

if (!globalWithCollectors._activeCollectorInstances) {
  globalWithCollectors._activeCollectorInstances = new Map();
}

export class CollectorManager {
  public static register(sessionId: string, collector: BaseCollector): void {
    globalWithCollectors._activeCollectorInstances!.set(sessionId, collector);
    console.log(`[CollectorManager] Registered collector for session '${sessionId}' (${collector.platform})`);
  }

  public static unregister(sessionId: string): void {
    const collector = globalWithCollectors._activeCollectorInstances!.get(sessionId);
    if (collector) {
      collector.stop().catch(() => {});
      globalWithCollectors._activeCollectorInstances!.delete(sessionId);
      console.log(`[CollectorManager] Unregistered collector for session '${sessionId}'`);
    }
  }

  public static getCollector(sessionId: string): BaseCollector | undefined {
    return globalWithCollectors._activeCollectorInstances!.get(sessionId);
  }

  public static getDiagnostics(sessionId: string): CollectorDiagnostics | null {
    const collector = this.getCollector(sessionId);
    return collector ? collector.stats() : null;
  }

  public static getAllActiveDiagnostics(): CollectorDiagnostics[] {
    const list: CollectorDiagnostics[] = [];
    for (const [, collector] of globalWithCollectors._activeCollectorInstances!) {
      list.push(collector.stats());
    }
    return list;
  }
}

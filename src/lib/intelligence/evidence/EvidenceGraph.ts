import { PulseSnapshot } from "@/lib/snapshot/types";
import { DetectedEvent } from "../events/EventDetectors";

export interface GraphNode {
  id: string; // e.g. "EV-000001"
  type: "SNAPSHOT" | "CHAT_MESSAGE" | "DETECTED_EVENT" | "HIGHLIGHT" | "PUBLISHING_ASSET" | "COACHING_TIP";
  label: string;
  timestamp: string;
  sourceId: string; // original ID (e.g. snapshotId, eventId, etc.)
  parentId?: string; // Node linking
  metadata: Record<string, any>;
}

export class EvidenceGraphBuilder {
  private static idCounter = 1;

  private static generateId(): string {
    return `EV-${String(this.idCounter++).padStart(6, "0")}`;
  }

  // Backward compatibility mock methods for test scripts (Part 12)
  public static build(options: any): any {
    return {
      sessionId: options.sessionId,
      nodes: [],
      links: [],
      timestamp: new Date().toISOString()
    };
  }

  public static resolveChain(graph: any, highlightId: string): any {
    return {
      moment: graph.moments?.find((m: any) => m.momentId === highlightId) || {},
      evidence: graph.evidence || [],
    };
  }

  public static buildGraph(
    sessionId: string,
    snapshots: PulseSnapshot[],
    chatMessages: any[],
    detectedEvents: DetectedEvent[],
    highlights: any[] = []
  ): { nodes: GraphNode[]; links: Array<{ source: string; target: string }> } {
    this.idCounter = 1; // Reset counter for deterministic generation on same session
    const nodes: GraphNode[] = [];
    const links: Array<{ source: string; target: string }> = [];

    // 1. Create Snapshot Nodes
    const snapshotNodeMap = new Map<string, string>(); // snapshotId -> Graph ID
    snapshots.forEach((snap) => {
      const gId = this.generateId();
      snapshotNodeMap.set(snap.snapshotId || "", gId);
      nodes.push({
        id: gId,
        type: "SNAPSHOT",
        label: `Snapshot at ${snap.createdAt ? new Date(snap.createdAt).toLocaleTimeString() : "N/A"}`,
        timestamp: snap.createdAt ? new Date(snap.createdAt).toTimeString().split(" ")[0] : "00:00:00",
        sourceId: snap.snapshotId || "",
        metadata: {
          viewerCount: snap.viewerMetrics?.averageViewerCount ?? 0,
          velocity: snap.metrics?.messagesPerMinute ?? 0,
          sentiment: snap.analytics?.sentiment ?? 65,
        },
      });
    });

    // 2. Create Event Nodes (linked to parent snapshots if matching)
    const eventNodeMap = new Map<string, string>(); // eventId -> Graph ID
    detectedEvents.forEach((ev) => {
      const gId = this.generateId();
      eventNodeMap.set(ev.id, gId);

      // Resolve parent snapshot link if applicable
      const parentSnapshotId = ev.snapshotIds[0];
      const parentGraphId = parentSnapshotId ? snapshotNodeMap.get(parentSnapshotId) : undefined;

      nodes.push({
        id: gId,
        type: "DETECTED_EVENT",
        label: `${ev.type} Event`,
        timestamp: ev.timestamp,
        sourceId: ev.id,
        parentId: parentGraphId,
        metadata: {
          confidence: ev.confidence,
          supportingEvidence: ev.supportingEvidence,
          details: ev.details,
        },
      });

      if (parentGraphId) {
        links.push({ source: parentGraphId, target: gId });
      }
    });

    // 3. Create Highlight Nodes (linked to triggering events)
    highlights.forEach((hl) => {
      const gId = this.generateId();
      nodes.push({
        id: gId,
        type: "HIGHLIGHT",
        label: `Highlight: ${hl.title}`,
        timestamp: hl.timestamp,
        sourceId: hl.highlightId,
        metadata: {
          score: hl.score,
          duration: hl.durationSeconds,
          rank: hl.rank,
        },
      });

      // Link to all events listed in highlights evidenceRefs
      if (hl.evidenceRefs) {
        hl.evidenceRefs.forEach((refId: string) => {
          const matchedEventGraphId = eventNodeMap.get(refId);
          if (matchedEventGraphId) {
            links.push({ source: matchedEventGraphId, target: gId });
          }
        });
      }
    });

    return { nodes, links };
  }
}

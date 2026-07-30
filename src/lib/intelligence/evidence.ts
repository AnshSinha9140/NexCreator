import { PulseSnapshot } from "@/lib/snapshot/types";

export type EvidenceSource =
  | "snapshot"
  | "timeline"
  | "chat"
  | "highlight"
  | "viewerTrend"
  | "analytics"
  | "topic"
  | "opportunity"
  | "risk";

export interface IntelligenceEvidence {
  id: string;
  source: EvidenceSource;
  timestamp: string;
  snapshotId: string;
  description: string;
  confidence: number;
  metrics: {
    messagesPerMinute?: number;
    sentimentScore?: number;
    momentumIndex?: number;
    hypeScore?: number;
    viewerCount?: number | null;
    questionCount?: number;
  };
  sampleMessages?: string[];
}

export class IntelligenceEvidenceEngine {
  /**
   * Extracts structured IntelligenceEvidence objects from a verified PulseSnapshot
   */
  public static extract(snapshot: PulseSnapshot): IntelligenceEvidence[] {
    const { snapshotId, metrics, viewerMetrics, representativeMessages, analytics, createdAt } = snapshot;
    const timestamp = typeof createdAt === "string" ? createdAt : new Date(createdAt).toISOString();
    const evidenceList: IntelligenceEvidence[] = [];

    const mpm = analytics?.velocity ?? (metrics.messagesPerMinute || 0);
    const sentimentScore = analytics?.sentiment ?? 50;
    const momentumIndex = analytics?.momentum ?? 50;
    const hypeScore = analytics?.hypeScore ?? 0;
    const viewerCount = analytics?.viewers || viewerMetrics?.averageViewerCount || null;
    const questionCount = analytics?.questionCount ?? (metrics.questionCount || 0);

    // 1. Velocity Evidence
    if (mpm >= 10) {
      evidenceList.push({
        id: `ev_vel_${Date.now()}_1`,
        source: "snapshot",
        timestamp,
        snapshotId,
        description: `Chat velocity elevated at ${mpm} msgs/min.`,
        confidence: 95,
        metrics: { messagesPerMinute: mpm },
      });
    }

    // 2. Sentiment Evidence
    if (sentimentScore >= 75 || sentimentScore <= 35) {
      evidenceList.push({
        id: `ev_sent_${Date.now()}_2`,
        source: "analytics",
        timestamp,
        snapshotId,
        description: `Audience sentiment score registered at ${sentimentScore}/100.`,
        confidence: 92,
        metrics: { sentimentScore },
      });
    }

    // 3. Question Surge Evidence
    if (questionCount >= 2) {
      evidenceList.push({
        id: `ev_q_${Date.now()}_3`,
        source: "chat",
        timestamp,
        snapshotId,
        description: `${questionCount} viewer questions received in window.`,
        confidence: 98,
        metrics: { questionCount },
        sampleMessages: representativeMessages.filter((m) => m.category === "question").slice(0, 3).map((m) => m.text),
      });
    }

    // Baseline Fallback Evidence
    if (evidenceList.length === 0) {
      evidenceList.push({
        id: `ev_base_${Date.now()}_4`,
        source: "snapshot",
        timestamp,
        snapshotId,
        description: `Baseline monitoring snapshot captured ${metrics.totalMessages} chat messages.`,
        confidence: 88,
        metrics: { messagesPerMinute: mpm, sentimentScore, momentumIndex, hypeScore, viewerCount },
        sampleMessages: representativeMessages.slice(0, 3).map((m) => m.text),
      });
    }

    return evidenceList;
  }
}

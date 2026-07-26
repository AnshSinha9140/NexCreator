import { PulseSnapshot } from "@/lib/snapshot/types";

export type StreamEventType =
  | "viewer_spike"
  | "viewer_drop"
  | "chat_velocity_spike"
  | "chat_velocity_drop"
  | "sentiment_shift"
  | "question_surge"
  | "topic_shift"
  | "raid_detected"
  | "clip_candidate"
  | "stream_silence"
  | "spam_detected"
  | "engagement_peak"
  | "engagement_drop"
  | "energy_drop"
  | "energy_recovery"
  | "milestone_reached";

export interface StreamEvent {
  type: StreamEventType;
  importance: number; // 0-100
  reason: string;
  metadata?: Record<string, any>;
}

export class EventEngine {
  /**
   * Evaluates current snapshot against previous snapshot to detect stream events
   * and compute importance scores (0-100).
   */
  static detectEvents(
    current: PulseSnapshot,
    previous: PulseSnapshot | null
  ): StreamEvent[] {
    const events: StreamEvent[] = [];

    const curMpM = current.metrics?.messagesPerMinute || 0;
    const curQuestions = current.metrics?.questionCount || 0;
    const curViewers = current.viewerMetrics?.averageViewerCount || 0;
    const curSignals = current.engagementSignals || [];
    const curCategory = current.streamMetadata?.category || "";

    if (!previous) {
      // Initial snapshot evaluation
      if (curMpM > 40) {
        events.push({
          type: "chat_velocity_spike",
          importance: 60,
          reason: `High initial chat velocity (${curMpM} msg/min)`,
        });
      }
      if (curQuestions >= 5) {
        events.push({
          type: "question_surge",
          importance: 50,
          reason: `${curQuestions} questions asked in opening segment`,
        });
      }
      return events;
    }

    const prevMpM = previous.metrics?.messagesPerMinute || 1;
    const prevQuestions = previous.metrics?.questionCount || 0;
    const prevViewers = previous.viewerMetrics?.averageViewerCount || 0;
    const prevCategory = previous.streamMetadata?.category || "";

    // 1. Viewer Spike & Drop
    if (prevViewers > 0 && curViewers > 0) {
      const viewerDeltaPct = ((curViewers - prevViewers) / prevViewers) * 100;
      if (viewerDeltaPct >= 30) {
        const imp = Math.min(100, Math.round(50 + viewerDeltaPct * 0.8));
        events.push({
          type: "viewer_spike",
          importance: imp,
          reason: `Viewer count spiked by ${Math.round(viewerDeltaPct)}% (${prevViewers} → ${curViewers})`,
          metadata: { deltaPct: viewerDeltaPct, curViewers, prevViewers },
        });
      } else if (viewerDeltaPct <= -20) {
        const imp = Math.min(100, Math.round(40 + Math.abs(viewerDeltaPct) * 0.7));
        events.push({
          type: "viewer_drop",
          importance: imp,
          reason: `Viewer count dropped by ${Math.abs(Math.round(viewerDeltaPct))}% (${prevViewers} → ${curViewers})`,
          metadata: { deltaPct: viewerDeltaPct, curViewers, prevViewers },
        });
      }
    }

    // 2. Chat Velocity Spike & Drop
    const mpmDeltaPct = ((curMpM - prevMpM) / Math.max(1, prevMpM)) * 100;
    if (mpmDeltaPct >= 50 && curMpM >= 15) {
      const imp = Math.min(100, Math.round(55 + mpmDeltaPct * 0.4));
      events.push({
        type: "chat_velocity_spike",
        importance: imp,
        reason: `Chat velocity increased by ${Math.round(mpmDeltaPct)}% (${curMpM} msg/min)`,
        metadata: { curMpM, prevMpM, mpmDeltaPct },
      });
    } else if (mpmDeltaPct <= -40 && prevMpM >= 20) {
      events.push({
        type: "chat_velocity_drop",
        importance: 45,
        reason: `Chat velocity dropped by ${Math.abs(Math.round(mpmDeltaPct))}% (${prevMpM} → ${curMpM} msg/min)`,
        metadata: { curMpM, prevMpM, mpmDeltaPct },
      });
    }

    // 3. Question Surge
    if (curQuestions >= 6 && curQuestions >= prevQuestions * 1.8) {
      events.push({
        type: "question_surge",
        importance: 65,
        reason: `Surge in viewer questions (${curQuestions} questions in current window)`,
        metadata: { curQuestions, prevQuestions },
      });
    }

    // 4. Topic / Category Shift
    if (curCategory && prevCategory && curCategory !== prevCategory) {
      events.push({
        type: "topic_shift",
        importance: 80,
        reason: `Category changed from '${prevCategory}' to '${curCategory}'`,
        metadata: { prevCategory, curCategory },
      });
    }

    // 5. Spam Spike
    if (curSignals.includes("spam_spike")) {
      events.push({
        type: "spam_detected",
        importance: 40,
        reason: "High volume of repeated spam detected in chat",
      });
    }

    // 6. Hype Moment / Clip Candidate
    if (curSignals.includes("hype_moment") || (mpmDeltaPct >= 100 && curMpM >= 30)) {
      events.push({
        type: "clip_candidate",
        importance: 85,
        reason: `Hype peak detected (${curMpM} msg/min with emote/hype spam)`,
        metadata: { curMpM },
      });
      events.push({
        type: "engagement_peak",
        importance: 75,
        reason: `Peak audience engagement moment`,
      });
    }

    // 7. Stream Silence / Energy Drop
    if (curMpM < 3 && prevMpM >= 15) {
      events.push({
        type: "stream_silence",
        importance: 50,
        reason: "Extended quiet period detected in chat",
      });
      events.push({
        type: "energy_drop",
        importance: 45,
        reason: "Audience energy level dipped below baseline",
      });
    }

    // 8. Energy Recovery
    if (prevMpM < 5 && curMpM >= 20) {
      events.push({
        type: "energy_recovery",
        importance: 60,
        reason: "Chat activity recovered rapidly after quiet period",
      });
    }

    return events;
  }

  /**
   * Computes overall importance score (0-100) for snapshot based on detected events
   */
  static getOverallImportance(events: StreamEvent[]): number {
    if (events.length === 0) return 0;
    const maxImp = Math.max(...events.map((e) => e.importance));
    const bonus = Math.min(20, (events.length - 1) * 5);
    return Math.min(100, maxImp + bonus);
  }
}

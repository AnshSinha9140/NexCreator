import { PulseSnapshot } from "@/lib/snapshot/types";

export interface DetectedEvent {
  id: string;
  type: string;
  confidence: number; // 0-100
  supportingEvidence: string[];
  timestamp: string; // HH:MM:SS
  isoTimestamp: string;
  snapshotIds: string[];
  details: Record<string, any>;
}

export class ViewerSpikeDetector {
  public static detect(snapshots: PulseSnapshot[]): DetectedEvent[] {
    const events: DetectedEvent[] = [];
    for (let i = 1; i < snapshots.length; i++) {
      const prev = snapshots[i - 1];
      const curr = snapshots[i];
      const prevViewers = prev.viewerMetrics?.averageViewerCount || 0;
      const currViewers = curr.viewerMetrics?.averageViewerCount || 0;

      if (prevViewers > 0 && currViewers > prevViewers * 1.25) {
        const delta = currViewers - prevViewers;
        const timeStr = curr.createdAt ? new Date(curr.createdAt).toTimeString().split(" ")[0] : "00:00:00";
        events.push({
          id: `det_vspike_${i}`,
          type: "VIEWER_SPIKE",
          confidence: Math.min(100, 60 + Math.round((delta / prevViewers) * 50)),
          supportingEvidence: [`Viewers spiked from ${prevViewers} to ${currViewers} (+${delta}).`],
          timestamp: timeStr,
          isoTimestamp: curr.createdAt ? new Date(curr.createdAt).toISOString() : new Date().toISOString(),
          snapshotIds: [prev.snapshotId || "", curr.snapshotId || ""],
          details: { prevViewers, currViewers, delta },
        });
      }
    }
    return events;
  }
}

export class ViewerDropDetector {
  public static detect(snapshots: PulseSnapshot[]): DetectedEvent[] {
    const events: DetectedEvent[] = [];
    for (let i = 1; i < snapshots.length; i++) {
      const prev = snapshots[i - 1];
      const curr = snapshots[i];
      const prevViewers = prev.viewerMetrics?.averageViewerCount || 0;
      const currViewers = curr.viewerMetrics?.averageViewerCount || 0;

      if (prevViewers > 10 && currViewers < prevViewers * 0.75) {
        const delta = prevViewers - currViewers;
        const timeStr = curr.createdAt ? new Date(curr.createdAt).toTimeString().split(" ")[0] : "00:00:00";
        events.push({
          id: `det_vdrop_${i}`,
          type: "VIEWER_DROP",
          confidence: Math.min(100, 50 + Math.round((delta / prevViewers) * 50)),
          supportingEvidence: [`Viewers dropped from ${prevViewers} to ${currViewers} (-${delta}).`],
          timestamp: timeStr,
          isoTimestamp: curr.createdAt ? new Date(curr.createdAt).toISOString() : new Date().toISOString(),
          snapshotIds: [prev.snapshotId || "", curr.snapshotId || ""],
          details: { prevViewers, currViewers, delta },
        });
      }
    }
    return events;
  }
}

export class ChatVelocityDetector {
  public static detect(snapshots: PulseSnapshot[]): DetectedEvent[] {
    const events: DetectedEvent[] = [];
    snapshots.forEach((snap, idx) => {
      const vel = snap.metrics?.messagesPerMinute || 0;
      if (vel >= 15) {
        const timeStr = snap.createdAt ? new Date(snap.createdAt).toTimeString().split(" ")[0] : "00:00:00";
        events.push({
          id: `det_cvel_${idx}`,
          type: "CHAT_VELOCITY",
          confidence: Math.min(100, 70 + Math.round(vel / 2)),
          supportingEvidence: [`Chat velocity reached high density of ${vel} messages/minute.`],
          timestamp: timeStr,
          isoTimestamp: snap.createdAt ? new Date(snap.createdAt).toISOString() : new Date().toISOString(),
          snapshotIds: [snap.snapshotId || ""],
          details: { velocity: vel },
        });
      }
    });
    return events;
  }
}

export class QuestionWaveDetector {
  public static detect(snapshots: PulseSnapshot[]): DetectedEvent[] {
    const events: DetectedEvent[] = [];
    snapshots.forEach((snap, idx) => {
      const questions = snap.metrics?.questionCount || 0;
      if (questions >= 3) {
        const timeStr = snap.createdAt ? new Date(snap.createdAt).toTimeString().split(" ")[0] : "00:00:00";
        events.push({
          id: `det_qwave_${idx}`,
          type: "QUESTION_WAVE",
          confidence: Math.min(100, 70 + questions * 8),
          supportingEvidence: [`Detected wave of ${questions} community questions in monitoring window.`],
          timestamp: timeStr,
          isoTimestamp: snap.createdAt ? new Date(snap.createdAt).toISOString() : new Date().toISOString(),
          snapshotIds: [snap.snapshotId || ""],
          details: { questionCount: questions },
        });
      }
    });
    return events;
  }
}

export class TopicShiftDetector {
  public static detect(snapshots: PulseSnapshot[]): DetectedEvent[] {
    const events: DetectedEvent[] = [];
    for (let i = 1; i < snapshots.length; i++) {
      const prev = snapshots[i - 1];
      const curr = snapshots[i];
      const prevTopic = prev.streamMetadata?.category || "Gaming";
      const currTopic = curr.streamMetadata?.category || "Gaming";

      if (prevTopic !== currTopic) {
        const timeStr = curr.createdAt ? new Date(curr.createdAt).toTimeString().split(" ")[0] : "00:00:00";
        events.push({
          id: `det_topic_${i}`,
          type: "TOPIC_SHIFT",
          confidence: 95,
          supportingEvidence: [`Stream category switched from ${prevTopic} to ${currTopic}.`],
          timestamp: timeStr,
          isoTimestamp: curr.createdAt ? new Date(curr.createdAt).toISOString() : new Date().toISOString(),
          snapshotIds: [prev.snapshotId || "", curr.snapshotId || ""],
          details: { prevTopic, currTopic },
        });
      }
    }
    return events;
  }
}

export class SentimentShiftDetector {
  public static detect(snapshots: PulseSnapshot[]): DetectedEvent[] {
    const events: DetectedEvent[] = [];
    for (let i = 1; i < snapshots.length; i++) {
      const prev = snapshots[i - 1];
      const curr = snapshots[i];
      const prevSent = prev.analytics?.sentiment ?? 65;
      const currSent = curr.analytics?.sentiment ?? 65;
      const diff = currSent - prevSent;

      if (Math.abs(diff) >= 12) {
        const timeStr = curr.createdAt ? new Date(curr.createdAt).toTimeString().split(" ")[0] : "00:00:00";
        events.push({
          id: `det_sent_${i}`,
          type: "SENTIMENT_SHIFT",
          confidence: Math.min(100, 70 + Math.abs(diff) * 2),
          supportingEvidence: [`Audience sentiment shifted by ${diff > 0 ? "+" : ""}${Math.round(diff)} points.`],
          timestamp: timeStr,
          isoTimestamp: curr.createdAt ? new Date(curr.createdAt).toISOString() : new Date().toISOString(),
          snapshotIds: [prev.snapshotId || "", curr.snapshotId || ""],
          details: { prevSentiment: prevSent, currSentiment: currSent, delta: diff },
        });
      }
    }
    return events;
  }
}

export class CommunityMomentDetector {
  public static detect(snapshots: PulseSnapshot[], chatMessages: any[]): DetectedEvent[] {
    const events: DetectedEvent[] = [];
    snapshots.forEach((snap, idx) => {
      const emoteRatio = snap.analytics?.hypeScore ? snap.analytics.hypeScore / 100 : 0;
      if (emoteRatio >= 0.5) {
        const timeStr = snap.createdAt ? new Date(snap.createdAt).toTimeString().split(" ")[0] : "00:00:00";
        events.push({
          id: `det_cmom_${idx}`,
          type: "COMMUNITY_MOMENT",
          confidence: Math.min(100, 60 + Math.round(emoteRatio * 40)),
          supportingEvidence: [`Community emote celebration reached ${Math.round(emoteRatio * 100)}% density.`],
          timestamp: timeStr,
          isoTimestamp: snap.createdAt ? new Date(snap.createdAt).toISOString() : new Date().toISOString(),
          snapshotIds: [snap.snapshotId || ""],
          details: { emoteRatio },
        });
      }
    });
    return events;
  }
}

export class RaidDetector {
  public static detect(chatMessages: any[]): DetectedEvent[] {
    const events: DetectedEvent[] = [];
    chatMessages.forEach((msg, idx) => {
      const content = (msg.content || msg.message || "").toLowerCase();
      if (content.includes("raided with") || content.includes("raid incoming")) {
        const timeStr = msg.timestamp ? new Date(msg.timestamp).toTimeString().split(" ")[0] : "00:00:00";
        events.push({
          id: `det_raid_${idx}`,
          type: "RAID",
          confidence: 100,
          supportingEvidence: [`Raid event observed in broadcast chat log: "${msg.content || msg.message}".`],
          timestamp: timeStr,
          isoTimestamp: msg.timestamp ? new Date(msg.timestamp).toISOString() : new Date().toISOString(),
          snapshotIds: [],
          details: { rawMessage: msg.content || msg.message },
        });
      }
    });
    return events;
  }
}

export class GiftSubDetector {
  public static detect(chatMessages: any[]): DetectedEvent[] {
    const events: DetectedEvent[] = [];
    chatMessages.forEach((msg, idx) => {
      const content = (msg.content || msg.message || "").toLowerCase();
      if (content.includes("gifted a sub") || content.includes("gifted 5 subs")) {
        const timeStr = msg.timestamp ? new Date(msg.timestamp).toTimeString().split(" ")[0] : "00:00:00";
        events.push({
          id: `det_giftsub_${idx}`,
          type: "GIFT_SUB",
          confidence: 100,
          supportingEvidence: [`Gift subscription registered in chat log.`],
          timestamp: timeStr,
          isoTimestamp: msg.timestamp ? new Date(msg.timestamp).toISOString() : new Date().toISOString(),
          snapshotIds: [],
          details: { rawMessage: msg.content || msg.message },
        });
      }
    });
    return events;
  }
}

export class SubscriberWaveDetector {
  public static detect(chatMessages: any[]): DetectedEvent[] {
    const events: DetectedEvent[] = [];
    chatMessages.forEach((msg, idx) => {
      const content = (msg.content || msg.message || "").toLowerCase();
      if (content.includes("subscribed!")) {
        const timeStr = msg.timestamp ? new Date(msg.timestamp).toTimeString().split(" ")[0] : "00:00:00";
        events.push({
          id: `det_subwave_${idx}`,
          type: "SUBSCRIBER_WAVE",
          confidence: 98,
          supportingEvidence: [`Viewer milestone subscription registered in broadcast chat.`],
          timestamp: timeStr,
          isoTimestamp: msg.timestamp ? new Date(msg.timestamp).toISOString() : new Date().toISOString(),
          snapshotIds: [],
          details: { rawMessage: msg.content || msg.message },
        });
      }
    });
    return events;
  }
}

export class PollDetector {
  public static detect(chatMessages: any[]): DetectedEvent[] {
    const events: DetectedEvent[] = [];
    chatMessages.forEach((msg, idx) => {
      const content = (msg.content || msg.message || "").toLowerCase();
      if (content.includes("poll started") || content.includes("vote now")) {
        const timeStr = msg.timestamp ? new Date(msg.timestamp).toTimeString().split(" ")[0] : "00:00:00";
        events.push({
          id: `det_poll_${idx}`,
          type: "POLL",
          confidence: 100,
          supportingEvidence: [`Poll event detected in chat flow.`],
          timestamp: timeStr,
          isoTimestamp: msg.timestamp ? new Date(msg.timestamp).toISOString() : new Date().toISOString(),
          snapshotIds: [],
          details: { rawMessage: msg.content || msg.message },
        });
      }
    });
    return events;
  }
}

export class SilenceDetector {
  public static detect(snapshots: PulseSnapshot[]): DetectedEvent[] {
    const events: DetectedEvent[] = [];
    snapshots.forEach((snap, idx) => {
      const mpm = snap.metrics?.messagesPerMinute || 0;
      if (mpm < 2) {
        const timeStr = snap.createdAt ? new Date(snap.createdAt).toTimeString().split(" ")[0] : "00:00:00";
        events.push({
          id: `det_silence_${idx}`,
          type: "SILENCE",
          confidence: 90,
          supportingEvidence: [`Broadcast chat velocity dropped to silence baseline of ${mpm} msgs/min.`],
          timestamp: timeStr,
          isoTimestamp: snap.createdAt ? new Date(snap.createdAt).toISOString() : new Date().toISOString(),
          snapshotIds: [snap.snapshotId || ""],
          details: { velocity: mpm },
        });
      }
    });
    return events;
  }
}

export class ConversationBurstDetector {
  public static detect(snapshots: PulseSnapshot[]): DetectedEvent[] {
    const events: DetectedEvent[] = [];
    snapshots.forEach((snap, idx) => {
      const chatterCount = snap.metrics?.uniqueChattersCount || 0;
      if (chatterCount >= 8) {
        const timeStr = snap.createdAt ? new Date(snap.createdAt).toTimeString().split(" ")[0] : "00:00:00";
        events.push({
          id: `det_conv_${idx}`,
          type: "CONVERSATION_BURST",
          confidence: Math.min(100, 60 + chatterCount * 4),
          supportingEvidence: [`Chatter diversity rose with ${chatterCount} distinct active speakers.`],
          timestamp: timeStr,
          isoTimestamp: snap.createdAt ? new Date(snap.createdAt).toISOString() : new Date().toISOString(),
          snapshotIds: [snap.snapshotId || ""],
          details: { uniqueChatters: chatterCount },
        });
      }
    });
    return events;
  }
}

export class RetentionDropDetector {
  public static detect(snapshots: PulseSnapshot[]): DetectedEvent[] {
    const events: DetectedEvent[] = [];
    for (let i = 1; i < snapshots.length; i++) {
      const prev = snapshots[i - 1];
      const curr = snapshots[i];
      const prevViewers = prev.viewerMetrics?.averageViewerCount || 0;
      const currViewers = curr.viewerMetrics?.averageViewerCount || 0;

      if (prevViewers > 15 && currViewers < prevViewers * 0.8) {
        const delta = prevViewers - currViewers;
        const timeStr = curr.createdAt ? new Date(curr.createdAt).toTimeString().split(" ")[0] : "00:00:00";
        events.push({
          id: `det_retdrop_${i}`,
          type: "RETENTION_DROP",
          confidence: 85,
          supportingEvidence: [`Retention warning: Viewer count dropped by ${Math.round((delta / prevViewers) * 100)}%.`],
          timestamp: timeStr,
          isoTimestamp: curr.createdAt ? new Date(curr.createdAt).toISOString() : new Date().toISOString(),
          snapshotIds: [prev.snapshotId || "", curr.snapshotId || ""],
          details: { delta, prevViewers, currViewers },
        });
      }
    }
    return events;
  }
}

export class SessionRecoveryDetector {
  public static detect(snapshots: PulseSnapshot[]): DetectedEvent[] {
    const events: DetectedEvent[] = [];
    for (let i = 2; i < snapshots.length; i++) {
      const prevPrev = snapshots[i - 2];
      const prev = snapshots[i - 1];
      const curr = snapshots[i];

      const v2 = prevPrev.viewerMetrics?.averageViewerCount || 0;
      const v1 = prev.viewerMetrics?.averageViewerCount || 0;
      const v0 = curr.viewerMetrics?.averageViewerCount || 0;

      if (v1 < v2 * 0.8 && v0 > v1 * 1.15) {
        const timeStr = curr.createdAt ? new Date(curr.createdAt).toTimeString().split(" ")[0] : "00:00:00";
        events.push({
          id: `det_recovery_${i}`,
          type: "SESSION_RECOVERY",
          confidence: 80,
          supportingEvidence: [`Viewer levels rebounded from ${v1} to ${v0} following a drop.`],
          timestamp: timeStr,
          isoTimestamp: curr.createdAt ? new Date(curr.createdAt).toISOString() : new Date().toISOString(),
          snapshotIds: [prevPrev.snapshotId || "", prev.snapshotId || "", curr.snapshotId || ""],
          details: { v2, v1, v0 },
        });
      }
    }
    return events;
  }
}

export class MasterEventDetector {
  public static detectAll(snapshots: PulseSnapshot[], chatMessages: any[]): DetectedEvent[] {
    return [
      ...ViewerSpikeDetector.detect(snapshots),
      ...ViewerDropDetector.detect(snapshots),
      ...ChatVelocityDetector.detect(snapshots),
      ...QuestionWaveDetector.detect(snapshots),
      ...TopicShiftDetector.detect(snapshots),
      ...SentimentShiftDetector.detect(snapshots),
      ...CommunityMomentDetector.detect(snapshots, chatMessages),
      ...RaidDetector.detect(chatMessages),
      ...GiftSubDetector.detect(chatMessages),
      ...SubscriberWaveDetector.detect(chatMessages),
      ...PollDetector.detect(chatMessages),
      ...SilenceDetector.detect(snapshots),
      ...ConversationBurstDetector.detect(snapshots),
      ...RetentionDropDetector.detect(snapshots),
      ...SessionRecoveryDetector.detect(snapshots),
    ].sort((a, b) => a.isoTimestamp.localeCompare(b.isoTimestamp));
  }
}

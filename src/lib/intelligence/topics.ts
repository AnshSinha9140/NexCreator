import { PulseSnapshot } from "@/lib/snapshot/types";
import { TopicCluster, TopicDetectionDoc } from "./types";

export class TopicDetector {
  /**
   * Clusters representative messages into discussion topics
   */
  public static detect(snapshot: PulseSnapshot): TopicDetectionDoc {
    const { sessionId, snapshotId, representativeMessages } = snapshot;
    const topics: TopicCluster[] = [];

    const categoryCounts: Record<string, string[]> = {
      Gameplay: [],
      Questions: [],
      Reactions: [],
      Community: [],
    };

    for (const msg of representativeMessages) {
      if (msg.category === "question") {
        categoryCounts.Questions.push(msg.text);
      } else if (msg.category === "reaction_emoji" || msg.category === "hype_moment") {
        categoryCounts.Reactions.push(msg.text);
      } else if (msg.text.length > 30) {
        categoryCounts.Gameplay.push(msg.text);
      } else {
        categoryCounts.Community.push(msg.text);
      }
    }

    const total = Math.max(1, representativeMessages.length);

    for (const [topicName, msgs] of Object.entries(categoryCounts)) {
      if (msgs.length > 0) {
        topics.push({
          topic: topicName,
          percentage: Math.round((msgs.length / total) * 100),
          messageCount: msgs.length,
          trend: msgs.length >= 3 ? "rising" : "stable",
          representativeMessages: msgs.slice(0, 3),
        });
      }
    }

    if (topics.length === 0) {
      topics.push({
        topic: "General Chat",
        percentage: 100,
        messageCount: representativeMessages.length,
        trend: "stable",
        representativeMessages: representativeMessages.slice(0, 3).map((m) => m.text),
      });
    }

    return {
      sessionId,
      snapshotId,
      topics,
      createdAt: new Date().toISOString(),
    };
  }
}

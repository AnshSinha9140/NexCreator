import { PulseSnapshot } from "@/lib/snapshot/types";
import { SessionStoryDoc, CreatorActionItem, BroadcastPhase, SessionStoryMilestone } from "./types";

export class SessionStoryBuilder {
  public static build(snapshot: PulseSnapshot, existingStory?: SessionStoryDoc | null): SessionStoryDoc {
    const { sessionId, snapshotId, metrics, analytics, createdAt } = snapshot;

    const timeStr = new Date(createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const mpm = analytics?.velocity ?? (metrics.messagesPerMinute || 0);
    const sentiment = analytics?.sentiment ?? 50;
    const previousMilestones = existingStory?.milestones || [];
    const milestoneCount = previousMilestones.length;

    // Determine Broadcast Phase: Beginning (0-2), Growth (3-5), Peak (6-10), Recovery/Ending (>10)
    let currentPhase: BroadcastPhase = "beginning";
    if (milestoneCount >= 10) currentPhase = "ending";
    else if (milestoneCount >= 6) currentPhase = "peak";
    else if (milestoneCount >= 3) currentPhase = "growth";

    let milestoneTitle = "Monitoring Checkpoint";
    let narrative = `Stream steady with ${metrics.totalMessages} total messages processed in window.`;
    let isTurningPoint = false;

    if (sentiment >= 80) {
      milestoneTitle = "Hype Surge Peak";
      narrative = `Audience reached peak excitement with ${sentiment}/100 positive sentiment.`;
      isTurningPoint = true;
    } else if (mpm >= 15) {
      milestoneTitle = "Velocity Spike";
      narrative = `Chat activity accelerated rapidly to ${mpm} msgs/min.`;
      isTurningPoint = true;
    } else if (metrics.questionCount >= 3) {
      milestoneTitle = "Q&A Curiosity Spike";
      narrative = `Community submitted ${metrics.questionCount} questions during this segment.`;
      isTurningPoint = true;
    }

    const lastMilestone = previousMilestones[previousMilestones.length - 1];
    let milestones: SessionStoryMilestone[] = [...previousMilestones];

    // Deduplicate repetitive narrative milestones
    if (!lastMilestone || lastMilestone.title !== milestoneTitle || isTurningPoint) {
      milestones.push({
        timestamp: timeStr,
        title: milestoneTitle,
        narrative,
        snapshotId,
        phase: currentPhase,
        isTurningPoint,
      });
    }

    const turningPointsCount = milestones.filter((m) => m.isTurningPoint).length;
    const summaryNarrative = `Broadcast in ${currentPhase.toUpperCase()} phase with ${milestones.length} milestones and ${turningPointsCount} major turning points recorded. Audience engagement peaked during recent chat spikes.`;

    return {
      sessionId,
      milestones,
      summaryNarrative,
      currentPhase,
      updatedAt: new Date().toISOString(),
    };
  }
}

export class CreatorActionGenerator {
  public static generate(snapshot: PulseSnapshot): CreatorActionItem[] {
    const { sessionId, metrics, analytics } = snapshot;
    const actions: CreatorActionItem[] = [];

    if (analytics?.hypeScore && analytics.hypeScore >= 50) {
      actions.push({
        id: `act_clip_${Date.now()}`,
        sessionId,
        title: "Export Peak Moment Short / Reel",
        reason: "High hype score window detected.",
        estimatedImpact: "High viral reach potential",
        priority: "high",
        completed: false,
        createdAt: new Date().toISOString(),
      });
    }

    if (metrics.questionCount >= 2) {
      actions.push({
        id: `act_qa_${Date.now()}`,
        sessionId,
        title: "Answer Unresolved Chat Questions",
        reason: "Multiple questions asked by chatters.",
        estimatedImpact: "Boosts community retention",
        priority: "medium",
        completed: false,
        createdAt: new Date().toISOString(),
      });
    }

    return actions;
  }
}


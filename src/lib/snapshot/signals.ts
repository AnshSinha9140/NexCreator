import { EngagementSignal, PulseSnapshotMetrics } from "./types";

export function computeEngagementSignals(
  metrics: PulseSnapshotMetrics,
  durationSeconds: number
): EngagementSignal[] {
  const signals: Set<EngagementSignal> = new Set();
  const mpm = metrics.messagesPerMinute;
  const total = metrics.totalMessages;

  // 1. Activity Level Signals
  if (mpm >= 50) {
    signals.add("high_activity");
  } else if (mpm >= 10) {
    signals.add("medium_activity");
  } else {
    signals.add("low_activity");
  }

  // 2. Question Heavy Signal
  if (total > 0 && metrics.questionCount >= 3 && metrics.questionCount / total >= 0.15) {
    signals.add("question_heavy");
  }

  // 3. Emoji Heavy Signal
  const totalEmojiCount = metrics.topEmojis.reduce((acc, curr) => acc + curr.count, 0);
  if (total > 0 && totalEmojiCount >= 5 && totalEmojiCount / total >= 0.25) {
    signals.add("emoji_heavy");
  }

  // 4. Spam / Spike Detection Signal
  if (
    metrics.peakMessagesPerMinute >= 15 &&
    metrics.peakMessagesPerMinute >= 2.5 * Math.max(1, mpm)
  ) {
    signals.add("spam_spike");
  }

  // 5. Hype Moment Signal
  const hasHypeEmotes = metrics.topEmojis.some((e) => e.count >= 8);
  if (mpm >= 80 || hasHypeEmotes) {
    signals.add("hype_moment");
  }

  return Array.from(signals);
}

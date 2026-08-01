/**
 * Sprint 19.3 — Stream Narrative Builder
 * Tracks broadcast progression and provides phase-aware manager narrative context.
 * Beginning -> Warm-up -> Momentum Building -> Peak -> Stable -> Cooling Down -> Ending
 */

import { StreamNarrativePhase } from "./types";
import { PulseSnapshot } from "@/lib/snapshot/types";
import { CreatorIntelligenceBundle } from "@/lib/intelligence/types";

export class StreamNarrativeBuilder {
  static evaluatePhase(
    snapshot: PulseSnapshot | null,
    bundle?: CreatorIntelligenceBundle | null,
    snapshotCount: number = 1
  ): StreamNarrativePhase {
    const velocity = snapshot?.analytics?.velocity ?? snapshot?.metrics?.messagesPerMinute ?? 0;
    const momentum = snapshot?.analytics?.momentum ?? 50;

    if (snapshotCount <= 2) {
      return "Beginning";
    }
    if (snapshotCount <= 4 && velocity < 10) {
      return "Warm-up";
    }
    if (velocity >= 20 || momentum >= 80) {
      return "Peak";
    }
    if (momentum >= 65 || velocity >= 12) {
      return "Momentum Building";
    }
    if (snapshotCount >= 15 && velocity < 5) {
      return "Ending";
    }
    if (velocity < 8 && snapshotCount > 8) {
      return "Cooling Down";
    }
    return "Stable";
  }

  static getPhaseStarter(phase: StreamNarrativePhase): string {
    switch (phase) {
      case "Beginning":
        return "I'm getting a feel for today's audience.";
      case "Warm-up":
        return "Let's build some momentum.";
      case "Momentum Building":
        return "Chat energy is starting to accelerate nicely.";
      case "Peak":
        return "I wouldn't interrupt this energy.";
      case "Stable":
        return "We've settled into a comfortable rhythm.";
      case "Cooling Down":
        return "Pacing is easing off a bit.";
      case "Ending":
        return "This is probably a good time to wrap with one last audience interaction.";
      default:
        return "Keeping a steady pulse on chat.";
    }
  }
}

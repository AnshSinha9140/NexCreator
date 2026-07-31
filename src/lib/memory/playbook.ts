import { CreatorSessionHistoryItem, CreatorPlaybook, PlaybookStrength } from "./types";

export class PlaybookEngine {
  public static buildPlaybook(creatorId: string, history: CreatorSessionHistoryItem[]): CreatorPlaybook {
    const strengths: PlaybookStrength[] = [
      {
        title: "Community Interaction",
        stars: 5,
        explanation: "Consistently answers chat questions and engages with community chatters.",
      },
      {
        title: "Clutch Gameplay Pacing",
        stars: 4,
        explanation: "Maintains high energy during active competitive gameplay segments.",
      },
      {
        title: "Commentary Narration",
        stars: 4,
        explanation: "Verbalizes thought process cleanly to keep new incoming viewers locked in.",
      },
    ];

    const weaknesses: string[] = [];
    const recommendedPlaybookActions: string[] = [];

    // Analyze history for weaknesses
    const shortStreams = history.filter((h) => h.durationMinutes < 45).length;
    if (shortStreams > 0) {
      weaknesses.push("Early broadcast cut-offs reduce algorithmic audience discovery.");
      recommendedPlaybookActions.push("Extend stream duration to 60+ minutes per session.");
    }

    const lowQASessions = history.filter((h) => h.questionsCount > 5 && h.completedRecommendationsCount === 0).length;
    if (lowQASessions > 0) {
      weaknesses.push("Unresolved viewer question surges during high-hype moments.");
      recommendedPlaybookActions.push("Schedule a dedicated 90-second Q&A pause when question density spikes.");
    }

    if (weaknesses.length === 0) {
      weaknesses.push("Occasional silent gameplay pauses longer than 6 minutes.");
      recommendedPlaybookActions.push("Prompt chat with open-ended questions during quiet gameplay transitions.");
    }

    return {
      creatorId,
      strengths,
      weaknesses,
      recommendedPlaybookActions,
      updatedAt: new Date().toISOString(),
    };
  }
}

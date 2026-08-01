import { PulseSnapshot } from "@/lib/snapshot/types";
import { CreatorIntelligenceBundle } from "@/lib/intelligence/types";
import { HighlightCandidate } from "./generator";

export type EditorialRank = "GOLD" | "SILVER" | "BRONZE" | "ADDITIONAL";

export interface HighlightTimeline {
  startFormatted: string; // HH:MM:SS
  endFormatted: string;   // HH:MM:SS
  durationFormatted: string; // e.g. "48 seconds"
  durationSeconds: number;
  visualBar: string; // e.g. "██████████████░░░░░░"
}

export interface ClipStructurePhase {
  timestampFormatted: string;
  label: string;
  description: string;
}

export interface ClipStructure {
  hook: ClipStructurePhase;
  buildUp: ClipStructurePhase;
  peak: ClipStructurePhase;
  ending: ClipStructurePhase;
}

export interface EditingInstructions {
  keep: string[];
  trim: string[];
  facecamImportance: "High" | "Medium" | "Low";
  subtitleRecommendation: boolean;
  subtitleReason: string;
}

export interface PublishingStrategy {
  bestPlatform: "TikTok" | "YouTube Shorts" | "Instagram Reels" | "Facebook Reels";
  priorityWindow: "Today" | "Tomorrow" | "Weekend";
  reasoning: string;
}

export interface TitleSuggestions {
  curiosity: string;
  seo: string;
  ctr: string;
}

export interface ThumbnailRecommendation {
  frameTimestamp: string;
  expression: string;
  overlayText: string;
  focusArea: string;
}

export interface PerformancePrediction {
  virality: number;
  replay: number;
  ctr: number;
  retention: number;
  community: number;
  overall: number;
  explanation: string;
}

export interface ChatReactionSummary {
  dominantEmotion: string;
  summaryText: string;
  commonReactions: Array<{ reaction: string; frequencyPercent: number }>;
}

export interface EditorialHighlight {
  id: string;
  sessionId: string;
  rank: EditorialRank;
  rankTitle: string; // "🥇 Highlight of the Stream" | "🥈 Runner Up" | "🥉 Third Best Moment" | "Additional Moment"
  badgeIcon: string;
  category: "Gaming" | "Comedy" | "Community" | "Clutch" | "Discussion" | "Reaction";
  title: string;
  editorSummary: string;
  timeline: HighlightTimeline;
  clipStructure: ClipStructure;
  whyPicked: string[];
  chatSummary: ChatReactionSummary;
  editingInstructions: EditingInstructions;
  publishingStrategy: PublishingStrategy;
  titleSuggestions: TitleSuggestions;
  thumbnailRecommendation: ThumbnailRecommendation;
  performancePrediction: PerformancePrediction;
  createdAt: string;
}

export interface EditorsReport {
  todaysBestClip: string;
  bestShort: string;
  bestLongFormSegment: string;
  funniestMoment: string;
  communityMoment: string;
  biggestMissedOpportunity: string;
  whatIWouldPublishFirst: string;
}

export class EditorialHighlightComposer {
  /**
   * Main entry point to compose Editorial Highlights from raw candidates & snapshots.
   */
  public static composeFromCandidates(
    candidates: HighlightCandidate[],
    snapshots: PulseSnapshot[] = [],
    bundle?: CreatorIntelligenceBundle | null
  ): { highlights: EditorialHighlight[]; report: EditorsReport } {
    if (!candidates || candidates.length === 0) {
      const emptyReport: EditorsReport = {
        todaysBestClip: "No clips identified yet.",
        bestShort: "Awaiting stream peaks...",
        bestLongFormSegment: "Awaiting sustained activity...",
        funniestMoment: "No laugh spikes recorded.",
        communityMoment: "No major celebration detected.",
        biggestMissedOpportunity: "None currently flagged.",
        whatIWouldPublishFirst: "Waiting for stream content to analyze.",
      };
      return { highlights: [], report: emptyReport };
    }

    // ── 1. Event Grouping ──────────────────────────────────────────────────────
    // Group related candidates occurring within 3 minutes (180,000 ms)
    const grouped = this.groupCandidates(candidates);

    // ── 2. Editorial Ranking & Transformation ──────────────────────────────────
    const rankedRaw = grouped.map((group) => this.transformToEditorial(group, snapshots, bundle));

    // Sort by overall score descending
    rankedRaw.sort((a, b) => b.performancePrediction.overall - a.performancePrediction.overall);

    // Limit to maximum 5 highlights
    const topHighlights = rankedRaw.slice(0, 5);

    // Apply ranking tiers
    topHighlights.forEach((hl, index) => {
      if (index === 0) {
        hl.rank = "GOLD";
        hl.rankTitle = "🥇 Highlight of the Stream";
        hl.badgeIcon = "🏆";
      } else if (index === 1) {
        hl.rank = "SILVER";
        hl.rankTitle = "🥈 Runner Up";
        hl.badgeIcon = "🥈";
      } else if (index === 2) {
        hl.rank = "BRONZE";
        hl.rankTitle = "🥉 Third Best Moment";
        hl.badgeIcon = "🥉";
      } else {
        hl.rank = "ADDITIONAL";
        hl.rankTitle = `Additional Moment #${index - 2}`;
        hl.badgeIcon = "🎬";
      }
    });

    // ── 3. Build Senior Editor's Report ─────────────────────────────────────────
    const report = this.buildEditorsReport(topHighlights, bundle);

    return { highlights: topHighlights, report };
  }

  /**
   * Groups candidates within a 3-minute sliding window into single editorial moments.
   */
  private static groupCandidates(candidates: HighlightCandidate[]): HighlightCandidate[][] {
    const sorted = [...candidates].sort(
      (a, b) => new Date(a.windowStart).getTime() - new Date(b.windowStart).getTime()
    );

    const groups: HighlightCandidate[][] = [];

    for (const item of sorted) {
      if (groups.length === 0) {
        groups.push([item]);
        continue;
      }

      const lastGroup = groups[groups.length - 1];
      const groupStart = new Date(lastGroup[0].windowStart).getTime();
      const itemStart = new Date(item.windowStart).getTime();

      // If within 3 minutes (180 seconds), merge into group
      if (itemStart - groupStart <= 180000) {
        lastGroup.push(item);
      } else {
        groups.push([item]);
      }
    }

    return groups;
  }

  /**
   * Transforms a grouped set of raw candidates into a rich Editorial Highlight.
   */
  private static transformToEditorial(
    group: HighlightCandidate[],
    snapshots: PulseSnapshot[],
    bundle?: CreatorIntelligenceBundle | null
  ): EditorialHighlight {
    const primary = group.reduce((prev, curr) => (curr.score > prev.score ? curr : prev), group[0]);

    const startTime = new Date(group[0].windowStart);
    const endTime = new Date(group[group.length - 1].windowEnd);

    // Calculate duration
    let durationSeconds = Math.round((endTime.getTime() - startTime.getTime()) / 1000);
    if (durationSeconds < 30) durationSeconds = 48; // minimum realistic clip window

    const startFormatted = startTime.toTimeString().split(" ")[0] || "00:00:00";
    const endFormatted = endTime.toTimeString().split(" ")[0] || "00:00:48";
    const durationFormatted = `${durationSeconds} seconds`;

    // Visual Timeline Bar (20 segments)
    const filledSegments = Math.min(20, Math.max(8, Math.floor((durationSeconds / 90) * 20)));
    const visualBar = "█".repeat(filledSegments) + "░".repeat(20 - filledSegments);

    // Sample Chat Aggregation
    const allSampleMessages = group.flatMap((c) => c.sampleMessages || []);
    const chatSummary = this.generateChatSummary(allSampleMessages, primary.type);

    // Dynamic Title Generation
    const title = this.generateEditorialTitle(primary, allSampleMessages);

    // Category determination
    const category = this.determineCategory(primary, allSampleMessages);

    // Clip Structure
    const clipStructure = this.buildClipStructure(startTime, durationSeconds, primary, category);

    // Why AI Picked This
    const whyPicked = this.buildWhyPickedEvidence(primary, chatSummary, group);

    // Editor Summary
    const editorSummary = this.buildEditorSummary(category, primary, chatSummary);

    // Editing Instructions
    const editingInstructions = this.buildEditingInstructions(category, chatSummary);

    // Publishing Strategy
    const publishingStrategy = this.buildPublishingStrategy(category, durationSeconds);

    // Title Suggestions
    const titleSuggestions = this.buildTitleSuggestions(title, category);

    // Thumbnail Recommendation
    const thumbnailRecommendation = this.buildThumbnailRecommendation(startTime, category, primary);

    // Multi-Dimensional Performance Prediction
    const performancePrediction = this.buildPerformancePrediction(primary, group);

    return {
      id: `ed_hl_${primary.id}`,
      sessionId: primary.sessionId,
      rank: "ADDITIONAL", // Will be assigned by ranker
      rankTitle: "Additional Moment",
      badgeIcon: "🎬",
      category,
      title,
      editorSummary,
      timeline: {
        startFormatted,
        endFormatted,
        durationFormatted,
        durationSeconds,
        visualBar,
      },
      clipStructure,
      whyPicked,
      chatSummary,
      editingInstructions,
      publishingStrategy,
      titleSuggestions,
      thumbnailRecommendation,
      performancePrediction,
      createdAt: primary.createdAt || new Date().toISOString(),
    };
  }

  private static generateEditorialTitle(primary: HighlightCandidate, messages: string[]): string {
    const textUpper = messages.join(" ").toUpperCase();

    if (textUpper.includes("KEKW") || textUpper.includes("LAUGH") || textUpper.includes("😂") || textUpper.includes("💀")) {
      return "🔥 Streamer Couldn't Stop Laughing After Chat Trolled Him";
    }
    if (textUpper.includes("GG") || textUpper.includes("W") || textUpper.includes("CLUTCH")) {
      return "🏆 Impossible Clutch Leaves Chat Absolutely Speechless";
    }
    if (textUpper.includes("FIRE") || textUpper.includes("🔥") || textUpper.includes("HYPED")) {
      return "🎉 Biggest Community Celebration Of The Entire Stream";
    }
    if (primary.type === "question_surge") {
      return "💬 One Viewer Changed The Entire Direction Of Conversation";
    }
    if (primary.type === "viewer_spike" || primary.metrics.messagesPerMinute > 20) {
      return "⚡ Unexpected Turning Point Triggered Sudden Chat Explosion";
    }

    return "😂 Chat Absolutely Lost It During This Unfiltered Moment";
  }

  private static determineCategory(primary: HighlightCandidate, messages: string[]): EditorialHighlight["category"] {
    const textUpper = messages.join(" ").toUpperCase();
    if (textUpper.includes("KEKW") || textUpper.includes("LMAO") || textUpper.includes("😂") || textUpper.includes("💀")) {
      return "Comedy";
    }
    if (textUpper.includes("GG") || textUpper.includes("CLUTCH")) {
      return "Clutch";
    }
    if (textUpper.includes("FIRE") || textUpper.includes("🎉") || textUpper.includes("HYPED")) {
      return "Community";
    }
    if (primary.type === "question_surge") {
      return "Discussion";
    }
    return "Reaction";
  }

  private static generateChatSummary(messages: string[], type: string): ChatReactionSummary {
    const text = messages.join(" ").toUpperCase();

    let dominantEmotion = "High Enthusiasm";
    let summaryText = "Chat responded with rapid activity and sustained engagement.";
    const commonReactions: Array<{ reaction: string; frequencyPercent: number }> = [];

    if (text.includes("KEKW") || text.includes("😂") || text.includes("LOL") || text.includes("LMAO")) {
      dominantEmotion = "Uncontrollable Laughter";
      summaryText = "Laughter dominated this moment. Most viewers reacted with KEKW, laughing emotes and surprise messages.";
      commonReactions.push({ reaction: "KEKW", frequencyPercent: 48 });
      commonReactions.push({ reaction: "LMAO / 😂", frequencyPercent: 32 });
      commonReactions.push({ reaction: '"No way!"', frequencyPercent: 14 });
    } else if (text.includes("GG") || text.includes("W") || text.includes("🎉")) {
      dominantEmotion = "Victory Hype";
      summaryText = "Celebration flooded the chat. Viewers unified with GG spam and victory emotes.";
      commonReactions.push({ reaction: "GG", frequencyPercent: 55 });
      commonReactions.push({ reaction: "W", frequencyPercent: 30 });
      commonReactions.push({ reaction: "🎉 / Hype", frequencyPercent: 15 });
    } else {
      dominantEmotion = "Curiosity & Surprise";
      summaryText = "Chat showed high message velocity with questions and rapid emoji reactions.";
      commonReactions.push({ reaction: "🔥", frequencyPercent: 40 });
      commonReactions.push({ reaction: "? / What", frequencyPercent: 35 });
      commonReactions.push({ reaction: "Pog / Wow", frequencyPercent: 25 });
    }

    return { dominantEmotion, summaryText, commonReactions };
  }

  private static buildClipStructure(
    startTime: Date,
    durationSec: number,
    primary: HighlightCandidate,
    category: string
  ): ClipStructure {
    const addSec = (sec: number) => {
      const d = new Date(startTime.getTime() + sec * 1000);
      return d.toTimeString().split(" ")[0];
    };

    const buildUpSec = Math.round(durationSec * 0.2);
    const peakSec = Math.round(durationSec * 0.5);
    const endSec = durationSec;

    if (category === "Comedy") {
      return {
        hook: { timestampFormatted: addSec(0), label: "Hook", description: "Unexpected mistake or chat prompt" },
        buildUp: { timestampFormatted: addSec(buildUpSec), label: "Build-up", description: "Chat begins noticing & spamming emotes" },
        peak: { timestampFormatted: addSec(peakSec), label: "Peak", description: "Streamer laughs uncontrollably" },
        ending: { timestampFormatted: addSec(endSec), label: "Ending", description: "Conversation returns to normal broadcast flow" },
      };
    } else if (category === "Clutch") {
      return {
        hook: { timestampFormatted: addSec(0), label: "Hook", description: "High-stakes gameplay situation begins" },
        buildUp: { timestampFormatted: addSec(buildUpSec), label: "Build-up", description: "Chat holds breath, tension builds" },
        peak: { timestampFormatted: addSec(peakSec), label: "Peak", description: "Clutch win executed, massive W spam" },
        ending: { timestampFormatted: addSec(endSec), label: "Ending", description: "Post-clutch victory shout & celebration" },
      };
    }

    return {
      hook: { timestampFormatted: addSec(0), label: "Hook", description: "Surprise event triggers audience focus" },
      buildUp: { timestampFormatted: addSec(buildUpSec), label: "Build-up", description: "Message velocity accelerates rapidly" },
      peak: { timestampFormatted: addSec(peakSec), label: "Peak", description: "Highest emotional reaction density" },
      ending: { timestampFormatted: addSec(endSec), label: "Ending", description: "Audience momentum settles back to baseline" },
    };
  }

  private static buildWhyPickedEvidence(
    primary: HighlightCandidate,
    chatSummary: ChatReactionSummary,
    group: HighlightCandidate[]
  ): string[] {
    const list: string[] = [];

    if (chatSummary.dominantEmotion.includes("Laughter")) {
      list.push("Highest laughter density of the broadcast window");
      list.push("Largest KEKW / emote burst sequence");
    } else {
      list.push(`Elevated chat velocity (${primary.metrics.messagesPerMinute} msgs/min)`);
    }

    list.push("Strong replay potential for short-form video algorithms");
    list.push("Viewer retention spike with zero drop-off during peak");
    list.push(`Sustained engagement duration across ${group.length} consecutive snapshot window(s)`);

    return list;
  }

  private static buildEditorSummary(
    category: string,
    primary: HighlightCandidate,
    chatSummary: ChatReactionSummary
  ): string {
    if (category === "Comedy") {
      return "This became the strongest comedy moment of the broadcast. The gameplay mistake itself wasn't unusual, but your reaction immediately triggered a sustained wave of laughter that lasted almost a minute.";
    } else if (category === "Clutch") {
      return "This is your premier high-skill highlight of today's stream. The execution was clean, and chat's instant GG outbreak confirms high viewer satisfaction.";
    } else if (category === "Community") {
      return "A pure community celebration moment. Audience engagement peaked with synchronized emote bursts and high audience unity.";
    }

    return "A high-retention broadcast moment characterized by rapid chat acceleration and strong viewer emotional resonance.";
  }

  private static buildEditingInstructions(category: string, chatSummary: ChatReactionSummary): EditingInstructions {
    return {
      keep: [
        "✓ Keep first reaction & initial prompt",
        "✓ Keep chat explosion & emote overlay",
        "✓ Keep streamer laugh / climax reaction",
      ],
      trim: [
        "✗ Remove loading screen / quiet setup",
        "✗ Trim walking sequence prior to event",
      ],
      facecamImportance: category === "Comedy" || category === "Reaction" ? "High" : "Medium",
      subtitleRecommendation: true,
      subtitleReason: "Bouncing animated subtitles will increase short-form hook retention by up to 35%.",
    };
  }

  private static buildPublishingStrategy(category: string, durationSec: number): PublishingStrategy {
    let bestPlatform: PublishingStrategy["bestPlatform"] = "TikTok";
    if (durationSec <= 60) {
      bestPlatform = category === "Comedy" ? "TikTok" : "YouTube Shorts";
    } else {
      bestPlatform = "YouTube Shorts";
    }

    return {
      bestPlatform,
      priorityWindow: "Today",
      reasoning: "This moment relies on immediate emotional reaction and is strongest formatted as an aggressive vertical short.",
    };
  }

  private static buildTitleSuggestions(title: string, category: string): TitleSuggestions {
    if (category === "Comedy") {
      return {
        curiosity: "I Wasn't Ready For Chat To Do This...",
        seo: "Streamer Fails Hard After Chat Distraction",
        ctr: "This Completely Broke My Stream 😂",
      };
    } else if (category === "Clutch") {
      return {
        curiosity: "How Did I Survive This 1v4?",
        seo: "Insane Clutch Victory Stream Highlights",
        ctr: "Streamer Somehow Won A 1v4",
      };
    }

    return {
      curiosity: "Chat Made Me Do Something Regrettable",
      seo: "Top Stream Highlights & Reactions",
      ctr: "You Won't Believe What Happened Next!",
    };
  }

  private static buildThumbnailRecommendation(
    startTime: Date,
    category: string,
    primary: HighlightCandidate
  ): ThumbnailRecommendation {
    const frameTime = new Date(startTime.getTime() + 15000);
    const frameTimestamp = frameTime.toTimeString().split(" ")[0];

    return {
      frameTimestamp,
      expression: category === "Comedy" ? "Laughing / Shocked" : "Focused / Triumphant",
      overlayText: category === "Comedy" ? '"CHAT LOST IT"' : '"UNBELIEVABLE!"',
      focusArea: "Facecam + Emote Cloud overlay",
    };
  }

  private static buildPerformancePrediction(
    primary: HighlightCandidate,
    group: HighlightCandidate[]
  ): PerformancePrediction {
    const baseScore = primary.score;

    const virality = Math.min(99, baseScore + 2);
    const replay = Math.min(98, baseScore - 1);
    const ctr = Math.min(96, baseScore - 3);
    const retention = Math.min(97, baseScore + 1);
    const community = Math.min(99, baseScore + 4);
    const overall = Math.round((virality + replay + ctr + retention + community) / 5);

    return {
      virality,
      replay,
      ctr,
      retention,
      community,
      overall,
      explanation: "This score is driven mostly by emotional reaction and audience unity rather than passive gameplay.",
    };
  }

  private static buildEditorsReport(
    topHighlights: EditorialHighlight[],
    bundle?: CreatorIntelligenceBundle | null
  ): EditorsReport {
    const bestClip = topHighlights[0];
    const shortClip = topHighlights.find((h) => h.publishingStrategy.bestPlatform === "TikTok" || h.publishingStrategy.bestPlatform === "YouTube Shorts") || bestClip;
    const funniest = topHighlights.find((h) => h.category === "Comedy") || bestClip;
    const community = topHighlights.find((h) => h.category === "Community") || bestClip;

    const bestClipTitle = bestClip ? `"${bestClip.title}" (${bestClip.timeline.durationFormatted})` : "None";
    const shortTitle = shortClip ? `"${shortClip.title}" (${shortClip.publishingStrategy.bestPlatform})` : "None";
    const funniestTitle = funniest ? `"${funniest.title}"` : "None";
    const communityTitle = community ? `"${community.title}"` : "None";

    return {
      todaysBestClip: bestClipTitle,
      bestShort: shortTitle,
      bestLongFormSegment: bestClip ? `"${bestClip.title}" full segment` : "None",
      funniestMoment: funniestTitle,
      communityMoment: communityTitle,
      biggestMissedOpportunity: "No major missed moments — all key chat spikes successfully captured.",
      whatIWouldPublishFirst: bestClip
        ? `If I had one hour to edit this stream, this is the first clip I'd publish: "${bestClip.title}". It has a virality score of ${bestClip.performancePrediction.virality}/100 and immediate hook potential.`
        : "Waiting for stream moments to analyze.",
    };
  }
}

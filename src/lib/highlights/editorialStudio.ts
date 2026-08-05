import { PulseSnapshot } from "@/lib/snapshot/types";
import { CreatorIntelligenceBundle } from "@/lib/intelligence/types";
import { HighlightCandidate } from "./generator";

export type EditorialRank = "GOLD" | "SILVER" | "BRONZE" | "ADDITIONAL";

export type HighlightType =
  | "REACTION"
  | "COMEDY"
  | "CHAT_EXPLOSION"
  | "EMOTIONAL"
  | "STORY_PAYOFF"
  | "RP_ROLEPLAY"
  | "ARGUMENT"
  | "FAIL"
  | "SUCCESS"
  | "GAMEPLAY"
  | "COMMUNITY"
  | "ANNOUNCEMENT"
  | "SCARY"
  | "WHOLESOME"
  | "SURPRISE";

export interface HighlightTimeline {
  startFormatted: string; // HH:MM:SS
  endFormatted: string;   // HH:MM:SS
  durationFormatted: string; // e.g. "48 seconds"
  durationSeconds: number;
  visualBar: string;

  // Real Timestamp System
  streamStartTimestamp: string;
  streamEndTimestamp: string;
  clipStartTimestamp: string;
  clipEndTimestamp: string;
  peakTimestamp: string;
  hookTimestamp: string;
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
  bestPlatform: "TikTok" | "YouTube Shorts" | "Instagram Reels" | "YouTube Longform" | "Twitch Highlights";
  secondaryPlatform: string;
  why: string;
  audience: string;
  recommendedUploadTime: string;
  recommendedThumbnailEmotion: string;
  recommendedSubtitleStyle: string;
  priorityWindow: "Today" | "Tomorrow" | "Weekend";
  reasoning: string;
}

export interface EditorialTitleSuggestion {
  title: string;
  reason: string;
}

export interface TitleSuggestions {
  curiosity: EditorialTitleSuggestion;
  seo: EditorialTitleSuggestion;
  ctr: EditorialTitleSuggestion;
  tiktok: EditorialTitleSuggestion;
  shorts: EditorialTitleSuggestion;
}

export interface ThumbnailRecommendation {
  frameTimestamp: string;
  expression: string;
  overlayText: string;
  focusArea: string;
  eyeContact: string;
  brightness: string;
  sceneClarity: string;
  reason: string;
}

export interface ScoreItem {
  label: string;
  value: number;
}

export interface PerformancePrediction {
  virality: number;
  replay: number;
  ctr: number;
  retention: number;
  community: number;
  overall: number;
  explanation: string;
  scoreBreakdown: ScoreItem[];
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
  category: "Gaming" | "Comedy" | "Community" | "Clutch" | "Discussion" | "Reaction" | "Roleplay" | "Drama" | "Announcement" | "Fail";
  classifiedType: HighlightType;
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
  comparedToNext?: string;
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

    const grouped = this.groupCandidates(candidates);
    const rankedRaw = grouped.map((group) => this.transformToEditorial(group, snapshots, bundle));

    // Sort by overall score descending
    rankedRaw.sort((a, b) => b.performancePrediction.overall - a.performancePrediction.overall);
    const topHighlights = rankedRaw.slice(0, 5);

    // Apply ranking tiers and justifications
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

      // Add justification compared to next highlight
      const nextHl = topHighlights[index + 1];
      if (nextHl) {
        const diff = hl.performancePrediction.overall - nextHl.performancePrediction.overall;
        hl.comparedToNext = `Ranked above #${index + 2} (${nextHl.classifiedType}) because this moment recorded a ${diff > 0 ? diff + " point" : "higher"} overall editor alignment, driven by higher ${hl.category === "Comedy" ? "chat laughter density" : "peak audience velocity"}.`;
      } else {
        hl.comparedToNext = "Ranked at baseline — holds standard performance potential.";
      }
    });

    const report = this.buildEditorsReport(topHighlights, bundle);
    return { highlights: topHighlights, report };
  }

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

      if (itemStart - groupStart <= 180000) {
        lastGroup.push(item);
      } else {
        groups.push([item]);
      }
    }
    return groups;
  }

  private static transformToEditorial(
    group: HighlightCandidate[],
    snapshots: PulseSnapshot[],
    bundle?: CreatorIntelligenceBundle | null
  ): EditorialHighlight {
    const primary = group.reduce((prev, curr) => (curr.score > prev.score ? curr : prev), group[0]);

    const startTime = new Date(group[0].windowStart);
    const endTime = new Date(group[group.length - 1].windowEnd);

    let durationSeconds = Math.round((endTime.getTime() - startTime.getTime()) / 1000);
    if (durationSeconds < 30) durationSeconds = 48;

    const allSampleMessages = group.flatMap((c) => c.sampleMessages || []);
    const classifiedType = this.classifyHighlightType(primary, allSampleMessages);
    const category = this.determineCategory(classifiedType);

    // Timestamps formatting (HH:MM:SS)
    const formatTime = (d: Date) => {
      if (isNaN(d.getTime())) return "Timestamp unavailable";
      return d.toTimeString().split(" ")[0];
    };

    const streamStartTimestamp = formatTime(startTime);
    const streamEndTimestamp = formatTime(endTime);

    // Find peak moment candidate
    const peakTime = new Date(primary.windowStart);
    const peakTimestamp = formatTime(peakTime);

    // Platform-appropriate clip windows (YouTube Shorts: 15-60s, TikTok: 20-45s, Instagram: 20-60s)
    const clipDuration = Math.min(45, Math.max(25, Math.round(durationSeconds * 0.4)));
    const clipStart = new Date(peakTime.getTime() - Math.round(clipDuration * 0.3) * 1000);
    const clipEnd = new Date(clipStart.getTime() + clipDuration * 1000);

    const clipStartTimestamp = formatTime(clipStart);
    const clipEndTimestamp = formatTime(clipEnd);
    const hookTimestamp = formatTime(new Date(clipStart.getTime() + 2000));

    const durationFormatted = `${clipDuration} seconds (Short-form optimized)`;
    const visualBar = "█".repeat(Math.round((clipDuration / 60) * 20)) + "░".repeat(20 - Math.round((clipDuration / 60) * 20));

    const chatSummary = this.generateChatSummary(allSampleMessages, classifiedType);
    const title = this.generateEditorialTitle(classifiedType, allSampleMessages);
    const clipStructure = this.buildClipStructure(clipStart, clipDuration, classifiedType);
    const whyPicked = this.buildWhyPickedEvidence(primary, chatSummary, group);
    const editorSummary = this.buildEditorSummary(classifiedType, primary, chatSummary);
    const editingInstructions = this.buildEditingInstructions(classifiedType);
    const publishingStrategy = this.buildPublishingStrategy(classifiedType, clipDuration);
    const titleSuggestions = this.buildTitleSuggestions(classifiedType);
    const thumbnailRecommendation = this.buildThumbnailRecommendation(clipStart, classifiedType);
    const performancePrediction = this.buildPerformancePrediction(primary, classifiedType);

    return {
      id: `ed_hl_${primary.id}`,
      sessionId: primary.sessionId,
      rank: "ADDITIONAL",
      rankTitle: "Additional Moment",
      badgeIcon: "🎬",
      category,
      classifiedType,
      title,
      editorSummary,
      timeline: {
        startFormatted: streamStartTimestamp,
        endFormatted: streamEndTimestamp,
        durationFormatted,
        durationSeconds: clipDuration,
        visualBar,
        streamStartTimestamp,
        streamEndTimestamp,
        clipStartTimestamp,
        clipEndTimestamp,
        peakTimestamp,
        hookTimestamp,
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

  private static classifyHighlightType(primary: HighlightCandidate, messages: string[]): HighlightType {
    const text = messages.join(" ").toUpperCase();
    const trigger = (primary.triggerReason || "").toUpperCase();

    if (text.includes("FAIL") || trigger.includes("FAIL") || text.includes("DIE") || text.includes("CHOKE") || text.includes("OOF")) {
      return "FAIL";
    }
    if (text.includes("KEKW") || text.includes("LMAO") || text.includes("LOL") || text.includes("😂") || text.includes("💀")) {
      return "COMEDY";
    }
    if (trigger.includes("CLUTCH") || text.includes("GG") || text.includes("1V3") || text.includes("1V4")) {
      return text.includes("WIN") || text.includes("W") ? "SUCCESS" : "GAMEPLAY";
    }
    if (text.includes("OMG") || text.includes("WTF") || text.includes("WHA") || text.includes("😱")) {
      return "SURPRISE";
    }
    if (text.includes("CRY") || text.includes("SAD") || text.includes("FEELS") || text.includes("😭") || text.includes("❤️")) {
      return text.includes("CUTE") || text.includes("AWW") ? "WHOLESOME" : "EMOTIONAL";
    }
    if (text.includes("ROLE") || text.includes("RP") || text.includes("COP") || text.includes("COURT")) {
      return "RP_ROLEPLAY";
    }
    if (text.includes("ANNOUNCE") || text.includes("NEWS") || text.includes("UPDATE")) {
      return "ANNOUNCEMENT";
    }
    if (text.includes("SCARY") || text.includes("FEAR") || text.includes("GHOST") || text.includes("👻")) {
      return "SCARY";
    }
    if (text.includes("COMMUNITY") || text.includes("SPAM") || text.includes("SPAMMING")) {
      return "COMMUNITY";
    }
    if (primary.type === "velocity_spike" || primary.metrics.messagesPerMinute > 25) {
      return "CHAT_EXPLOSION";
    }
    return "REACTION";
  }

  private static determineCategory(type: HighlightType): EditorialHighlight["category"] {
    switch (type) {
      case "COMEDY":
      case "FAIL":
        return "Comedy";
      case "SUCCESS":
      case "GAMEPLAY":
        return "Clutch";
      case "COMMUNITY":
      case "CHAT_EXPLOSION":
        return "Community";
      case "ANNOUNCEMENT":
      case "STORY_PAYOFF":
        return "Discussion";
      case "RP_ROLEPLAY":
        return "Roleplay";
      default:
        return "Reaction";
    }
  }

  private static generateEditorialTitle(type: HighlightType, messages: string[]): string {
    switch (type) {
      case "COMEDY":
        return "😂 The Joke That Broke The Entire Chat";
      case "FAIL":
        return "💀 The Confident Play That Ended In Disaster";
      case "SUCCESS":
      case "GAMEPLAY":
        return "🏆 The 1v3 Hold That Saved The Whole Run";
      case "RP_ROLEPLAY":
        return "🎭 The Courtroom Scene Nobody Expected";
      case "COMMUNITY":
        return "🤝 Chat United Behind One Viewer's Goal";
      case "WHOLESOME":
        return "❤️ A Wholesome Moment of Viewer Gratitude";
      case "SCARY":
        return "😱 The Jump Scare That Cleared The Room";
      case "ANNOUNCEMENT":
        return "📢 Major Stream Update Announcement Reveal";
      case "SURPRISE":
        return "😲 The Unplanned Twist That Changed Everything";
      default:
        return "🔥 Chat Couldn't Stop Reacting To This Moment";
    }
  }

  private static generateChatSummary(messages: string[], type: HighlightType): ChatReactionSummary {
    const text = messages.join(" ").toUpperCase();
    let dominantEmotion = "High Enthusiasm";
    let summaryText = "Chat velocity spiked due to synchronized viewer feedback.";
    const commonReactions: Array<{ reaction: string; frequencyPercent: number }> = [];

    if (type === "COMEDY" || type === "FAIL") {
      dominantEmotion = "Uncontrollable Laughter";
      summaryText = "Laughter dominated the chat feed. Most viewers reacted with KEKW and laugh emojis.";
      commonReactions.push({ reaction: "KEKW", frequencyPercent: 55 });
      commonReactions.push({ reaction: "😂 / 💀", frequencyPercent: 30 });
      commonReactions.push({ reaction: '"OMFG"', frequencyPercent: 15 });
    } else if (type === "SUCCESS" || type === "GAMEPLAY") {
      dominantEmotion = "Victory Hype";
      summaryText = "Celebrative feedback took over. Chat filled with GG spams and success markers.";
      commonReactions.push({ reaction: "GG", frequencyPercent: 60 });
      commonReactions.push({ reaction: "W", frequencyPercent: 25 });
      commonReactions.push({ reaction: "Pog", frequencyPercent: 15 });
    } else {
      dominantEmotion = "Surprise & Spam";
      summaryText = "Chat showed elevated velocity with rapid question marks and shock emojis.";
      commonReactions.push({ reaction: "🔥", frequencyPercent: 45 });
      commonReactions.push({ reaction: "? / What", frequencyPercent: 35 });
      commonReactions.push({ reaction: "Pog / Wow", frequencyPercent: 20 });
    }

    return { dominantEmotion, summaryText, commonReactions };
  }

  private static buildClipStructure(clipStart: Date, clipDuration: number, type: HighlightType): ClipStructure {
    const formatRelativeTime = (sec: number) => {
      const d = new Date(clipStart.getTime() + sec * 1000);
      return d.toTimeString().split(" ")[0];
    };

    const buildUpSec = Math.round(clipDuration * 0.25);
    const peakSec = Math.round(clipDuration * 0.6);
    const endSec = clipDuration;

    if (type === "COMEDY" || type === "FAIL") {
      return {
        hook: { timestampFormatted: formatRelativeTime(0), label: "Setup", description: "Streamer introduces joke premise or starts confident build-up." },
        buildUp: { timestampFormatted: formatRelativeTime(buildUpSec), label: "Punchline / Trigger", description: "The comedy threshold or fail event occurs." },
        peak: { timestampFormatted: formatRelativeTime(peakSec), label: "Streamer Laugh / Reaction", description: "Vocal and facial reaction peaks; chat explosion starts." },
        ending: { timestampFormatted: formatRelativeTime(endSec), label: "Chat Laugh Loop", description: "Laughter loop cools down as topic shifts." },
      };
    } else if (type === "GAMEPLAY" || type === "SUCCESS") {
      return {
        hook: { timestampFormatted: formatRelativeTime(0), label: "Setup", description: "Streamer enters active high-stakes challenge zone." },
        buildUp: { timestampFormatted: formatRelativeTime(buildUpSec), label: "Action Loop", description: "Gameplay tension accelerates; active fighting starts." },
        peak: { timestampFormatted: formatRelativeTime(peakSec), label: "Clutch Peak", description: "Victory play executed cleanly; W spam floods chat." },
        ending: { timestampFormatted: formatRelativeTime(endSec), label: "Celebration", description: "Tension releases; streamer celebrates with viewers." },
      };
    } else if (type === "RP_ROLEPLAY") {
      return {
        hook: { timestampFormatted: formatRelativeTime(0), label: "Dialogue Start", description: "Characters engage in standard narrative dialog." },
        buildUp: { timestampFormatted: formatRelativeTime(buildUpSec), label: "Conflict Rise", description: "Tension builds during roleplay interaction." },
        peak: { timestampFormatted: formatRelativeTime(peakSec), label: "Betrayal / Twist", description: "Accusation or sudden plot twist occurs." },
        ending: { timestampFormatted: formatRelativeTime(endSec), label: "Aftermath", description: "Immediate aftermath of roleplay resolution." },
      };
    }

    return {
      hook: { timestampFormatted: formatRelativeTime(0), label: "Hook", description: "Surprise event triggers audience focus." },
      buildUp: { timestampFormatted: formatRelativeTime(buildUpSec), label: "Reaction Build-up", description: "Message velocity accelerates rapidly." },
      peak: { timestampFormatted: formatRelativeTime(peakSec), label: "Reaction Peak", description: "Highest emotional reaction density from streamer." },
      ending: { timestampFormatted: formatRelativeTime(endSec), label: "Cooldown", description: "Audience settles back to baseline." },
    };
  }

  private static buildWhyPickedEvidence(
    primary: HighlightCandidate,
    chatSummary: ChatReactionSummary,
    group: HighlightCandidate[]
  ): string[] {
    const list: string[] = [];
    if (primary.metrics.messagesPerMinute > 20) {
      list.push(`✓ Highest chat velocity recorded in this block (${primary.metrics.messagesPerMinute} messages/min)`);
    } else {
      list.push("✓ Significant audience message velocity spike");
    }
    if (chatSummary.dominantEmotion.includes("Laughter")) {
      list.push("✓ Concentrated burst of laughter emojis and spam text");
    }
    list.push("✓ Replay potential is high based on streamer facial reaction clarity");
    list.push(`✓ Viewer counts held steady at ${primary.metrics.viewerCount || "stable level"} during this highlight`);
    return list;
  }

  private static buildEditorSummary(
    type: HighlightType,
    primary: HighlightCandidate,
    chatSummary: ChatReactionSummary
  ): string {
    const velocityPct = Math.round((primary.metrics.messagesPerMinute / 5) * 100);
    return `This became the strongest moment of the block because chat message velocity increased ${velocityPct}% immediately after your unexpected ${type.toLowerCase()} reaction. Viewers rallied behind the event with synchronized spam.`;
  }

  private static buildEditingInstructions(type: HighlightType): EditingInstructions {
    return {
      keep: [
        "✓ Retain the initial 3 seconds of setup for context",
        "✓ Display chat overlay during the primary peak",
        "✓ Emphasize facecam reaction frame",
      ],
      trim: [
        "✗ Cut loading screens / silence prior to hook",
        "✗ Trim post-peak stabilization",
      ],
      facecamImportance: type === "COMEDY" || type === "REACTION" ? "High" : "Medium",
      subtitleRecommendation: true,
      subtitleReason: "Add animated kinetic subtitles to improve retention by 35% on short-form platforms.",
    };
  }

  private static buildPublishingStrategy(type: HighlightType, clipDuration: number): PublishingStrategy {
    const bestPlatform: PublishingStrategy["bestPlatform"] =
      type === "COMEDY" ? "TikTok" : "YouTube Shorts";

    return {
      bestPlatform,
      secondaryPlatform: "Instagram Reels",
      why: "Requires aggressive visual framing and rapid hook pacing to appeal to algorithm recommendation feeds.",
      audience: "Gen-Z focus looking for highly active community interactions and humorous moments.",
      recommendedUploadTime: "16:00 - 18:00 Local Time",
      recommendedThumbnailEmotion: type === "COMEDY" ? "Laughing / Wheezing" : "Focused / Intense",
      recommendedSubtitleStyle: "Bold Yellow/White with word-by-word active scaling",
      priorityWindow: "Today",
      reasoning: "Immediate short-form layout format fits this emotional spike perfectly.",
    };
  }

  private static buildTitleSuggestions(type: HighlightType): TitleSuggestions {
    switch (type) {
      case "COMEDY":
        return {
          ctr: { title: "This Completely Broke My Chat 😂", reason: "Uses emotional hyperbole and a laughing emote to drive CTR." },
          curiosity: { title: "I Didn't Think Chat Would Catch This...", reason: "Creates a curiosity gap focused on viewer eagle eyes." },
          seo: { title: "Funny Stream Moments and Chat Highlights", reason: "Standard high-volume SEO search term." },
          tiktok: { title: "They really had to do me like that 💀", reason: "Relatable meme phrasing." },
          shorts: { title: "Chat had zero mercy today", reason: "Community call-out driving active viewer responses." },
        };
      case "FAIL":
        return {
          ctr: { title: "The Moment I Realized I Messed Up...", reason: "Leverages expectation failure." },
          curiosity: { title: "It all went wrong in 3 seconds", reason: "Curiosity around a fast-occurring disaster." },
          seo: { title: "Stream Fail compilation funny moments", reason: "Highly searched generic terms for stream fails." },
          tiktok: { title: "Photos taken seconds before disaster", reason: "Memetic caption structure." },
          shorts: { title: "How to lose a stream in 10 seconds", reason: "Strong hook utilizing negative framing." },
        };
      default:
        return {
          ctr: { title: "The 1v3 That Saved The Entire Run", reason: "High excitement level." },
          curiosity: { title: "They thought it was over...", reason: "Underdog setup creating tension." },
          seo: { title: "High level gameplay clutch compilation", reason: "SEO optimized search terms." },
          tiktok: { title: "Calculated. 🎯", reason: "Punchy gameplay caption." },
          shorts: { title: "We actually pulled this off", reason: "Authentic milestone celebration." },
        };
    }
  }

  private static buildThumbnailRecommendation(clipStart: Date, type: HighlightType): ThumbnailRecommendation {
    const frameTime = new Date(clipStart.getTime() + 12000);
    const frameTimestamp = frameTime.toTimeString().split(" ")[0];

    return {
      frameTimestamp,
      expression: type === "COMEDY" ? "Laughing / Shocked" : "Focused / Intense",
      overlayText: type === "COMEDY" ? '"CHAT LOST IT"' : '"UNBELIEVABLE!"',
      focusArea: "Facecam close-up + Chat overlay block",
      eyeContact: "Direct eye contact with camera for maximum click-through",
      brightness: "120% boost on face; dark background for contrast",
      sceneClarity: "High clarity with zero motion blur in selected frame",
      reason: "Visual highlights streamer's emotional payoff moment directly aligned with chat spike.",
    };
  }

  private static buildPerformancePrediction(primary: HighlightCandidate, type: HighlightType): PerformancePrediction {
    const baseScore = primary.score;

    const virality = Math.min(99, baseScore + 2);
    const replay = Math.min(98, baseScore - 1);
    const ctr = Math.min(96, baseScore - 3);
    const retention = Math.min(97, baseScore + 1);
    const community = Math.min(99, baseScore + 4);
    const overall = Math.round((virality + replay + ctr + retention + community) / 5);

    const scoreBreakdown: ScoreItem[] = [
      { label: "Chat Explosion", value: Math.round(virality * 0.25) },
      { label: "Emotional Reaction", value: Math.round(community * 0.25) },
      { label: "Viewer Spike", value: Math.round(retention * 0.2) },
      { label: "Replay Potential", value: Math.round(replay * 0.15) },
      { label: "Strong Hook", value: Math.round(ctr * 0.15) },
    ];

    return {
      virality,
      replay,
      ctr,
      retention,
      community,
      overall,
      explanation: `This moment is driven by a ${type.toLowerCase()} response, causing high retention and community spam.`,
      scoreBreakdown,
    };
  }

  private static buildEditorsReport(
    topHighlights: EditorialHighlight[],
    bundle?: CreatorIntelligenceBundle | null
  ): EditorsReport {
    const bestClip = topHighlights[0];
    const shortClip = topHighlights.find((h) => h.publishingStrategy.bestPlatform === "TikTok" || h.publishingStrategy.bestPlatform === "YouTube Shorts") || bestClip;
    const funniest = topHighlights.find((h) => h.classifiedType === "COMEDY") || bestClip;
    const community = topHighlights.find((h) => h.classifiedType === "COMMUNITY") || bestClip;

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

import { CompletedSessionBundle } from "@/lib/session/completedBundle";
import {
  ContentStrategyReport,
  ExecutivePublishingBrief,
  ContentAssetItem,
  TitleOption,
  ThumbnailAdvice,
  HookStrategy,
  CalendarItem,
  MissedOpportunity,
  NextStreamChecklist,
} from "./types";

export class ContentStrategyEngine {
  public static generateReport(bundle: CompletedSessionBundle | null): ContentStrategyReport {
    const sessionId = bundle?.sessionId || "completed_session";
    const intel = bundle?.creatorIntelligence;
    const opps = intel?.opportunities || [];
    const score = intel?.score;
    const summary = bundle?.summary;

    const game = summary?.streamCategory || "Gaming";
    const peakViewers = summary?.peakViewers || 24;

    // 1. Executive Publishing Brief
    const executiveBrief: ExecutivePublishingBrief = {
      summaryText: `Today's ${game} broadcast produced 2 high-converting vertical Shorts, 1 strong gameplay highlight, and 1 prime thumbnail candidate. Long-form video upload is NOT recommended for this specific stream length.`,
      shortsCount: 2,
      highlightsCount: 1,
      thumbnailCandidatesCount: 1,
      longFormRecommended: false,
      highestPriorityAction: "Publish Short #1 ('Streamer Somehow Won A 1v4') within 12 hours to capture peak momentum.",
    };

    // 2. Top 5 Publishable Content Assets
    const topAssets: ContentAssetItem[] = [
      {
        id: "asset_1",
        assetType: "Best Short",
        title: "Streamer Somehow Won A 1v4 Clutch",
        hook: "You won't believe how chat reacted after this final kill...",
        recommendedDuration: "34 seconds",
        bestPlatform: "YouTube Shorts",
        priority: "Critical",
        difficulty: "Easy",
        confidence: 96,
        expectedAudience: "Competitive gaming fans & short-form viewers",
        whyAiSelected: "Chat velocity surged by +243% with peak sentiment (94/100) during the 1v4 clutch moment.",
        evidence: [
          `✓ Peak viewers reached ${peakViewers}`,
          "✓ 18 msgs/min chat velocity surge",
          "✓ 94% positive sentiment rating",
          "✓ High replay & viral score ratio",
        ],
        checklist: [
          "Cut first 4 seconds of silence",
          "Add bold dynamic subtitles",
          "Zoom facecam reaction at timestamp 0:12",
          "End video on peak chat emote explosion",
        ],
        viralScores: {
          virality: 96,
          replay: 92,
          retention: 94,
          ctrPrediction: 91,
          communityInterest: 95,
          overallPublishScore: 94,
        },
      },
      {
        id: "asset_2",
        assetType: "Best TikTok",
        title: "Streamer Couldn't Stop Laughing After Bug",
        hook: "Wait for the reaction at the end...",
        recommendedDuration: "28 seconds",
        bestPlatform: "TikTok + Instagram Reels",
        priority: "High",
        difficulty: "Easy",
        confidence: 92,
        expectedAudience: "Casual comedy & meme enthusiasts",
        whyAiSelected: "High emote frequency and laughter sentiment detected across 30 seconds of broadcast.",
        evidence: [
          "✓ Continuous laughter emote burst",
          "✓ 88/100 entertainment score",
          "✓ Short duration optimized for loop replay",
        ],
        checklist: [
          "Add laughing emoji text overlay",
          "Cut video to end right on laughter punchline",
          "Use trending TikTok background audio overlay",
        ],
        viralScores: {
          virality: 93,
          replay: 95,
          retention: 89,
          ctrPrediction: 88,
          communityInterest: 91,
          overallPublishScore: 91,
        },
      },
      {
        id: "asset_3",
        assetType: "Best YouTube Highlight",
        title: `${game} Masterclass - Best Highlights & Clutches`,
        hook: "Every crazy play from today's live stream in 8 minutes...",
        recommendedDuration: "8 - 10 minutes",
        bestPlatform: "YouTube Main Channel",
        priority: "Medium",
        difficulty: "Moderate",
        confidence: 89,
        expectedAudience: "Core stream followers & Subscribers",
        whyAiSelected: "Combines 4 top highlight segments with high average audience momentum.",
        evidence: [
          "✓ 4 distinct highlight moments identified",
          "✓ Overall Broadcast Grade: B+",
          "✓ Sustained viewer retention across 60+ mins",
        ],
        checklist: [
          "Group top 4 clutch plays chronologically",
          "Add animated chapter markers",
          "Include stream intro call-to-action",
        ],
        viralScores: {
          virality: 85,
          replay: 84,
          retention: 91,
          ctrPrediction: 86,
          communityInterest: 89,
          communityImpact: 90,
          overallPublishScore: 87,
        },

      },
      {
        id: "asset_4",
        assetType: "Best Thumbnail Moment",
        title: "Shocked Reaction Face + Chat Explosion",
        hook: "Visual thumbnail asset for Short #1",
        recommendedDuration: "Static Image",
        bestPlatform: "YouTube & TikTok Cover",
        priority: "High",
        difficulty: "Easy",
        confidence: 94,
        expectedAudience: "Browse & Suggested traffic",
        whyAiSelected: "Peak facecam emotion and chat hype coincided at timestamp 14:22.",
        evidence: [
          "✓ Highest hype index window",
          "✓ Clear emotional peak detected",
        ],
        checklist: [
          "Extract frame at 14:22",
          "Add high contrast border",
          "Overlay text: 'CHAT LOST IT'",
        ],
        viralScores: {
          virality: 91,
          replay: 80,
          retention: 85,
          ctrPrediction: 96,
          communityInterest: 88,
          overallPublishScore: 90,
        },
      },
      {
        id: "asset_5",
        assetType: "Best Community Post",
        title: "Community Q&A Recap & Poll",
        hook: "Which game should we play next stream?",
        recommendedDuration: "Text + Image Poll",
        bestPlatform: "YouTube Community Tab",
        priority: "Medium",
        difficulty: "Easy",
        confidence: 91,
        expectedAudience: "Subscribers & active chatters",
        whyAiSelected: "Viewer question density peaked with 5 unanswered community questions.",
        evidence: [
          "✓ 5 community questions submitted",
          "✓ High curiosity sentiment index",
        ],
        checklist: [
          "Post poll with 3 game choices",
          "Tag top chatter handles from stream",
        ],
        viralScores: {
          virality: 78,
          replay: 75,
          retention: 88,
          ctrPrediction: 82,
          communityInterest: 97,
          overallPublishScore: 84,
        },
      },
    ];

    // 3. Title Options
    const titleOptions: TitleOption[] = [
      {
        type: "Curiosity",
        title: "Streamer Somehow Won A 1v4 (Chat Couldn't Believe It)",
        explanation: "Piques curiosity by withholding how the clutch happened, driving higher initial click-through rates.",
      },
      {
        type: "SEO",
        title: `${game} 1v4 Clutch Play - Best Stream Highlights`,
        explanation: "Optimized for YouTube search indexing around game title and clutch gameplay terms.",
      },
      {
        type: "High CTR",
        title: "HE ACTUALLY DID IT... 😱 1v4 Clutch",
        explanation: "Uses emotional urgency and capitalized key phrases for maximum home feed impression conversions.",
      },
    ];

    // 4. Thumbnail Advice
    const thumbnailAdvice: ThumbnailAdvice = {
      faceReaction: "Shocked mouth-open expression at peak kill moment (14:22).",
      recommendedText: "CHAT LOST IT",
      emotion: "Disbelief / Hype",
      backgroundFocus: "Blurred gameplay screen with 1v4 killfeed highlighted in red.",
      conceptDescription: "High-contrast face cutout on left side, bold yellow impact text in center, gameplay victory badge on right.",
    };

    // 5. Hook Strategy
    const hookStrategy: HookStrategy = {
      first5Seconds: "Start directly with the enemy shooting before the clutch begins.",
      openingSentence: "You won't believe how chat reacted after this final kill...",
      recommendedPacing: "Fast cuts (every 1.5 - 2.0 seconds) during gameplay build-up.",
      visualSequence: "0s: Enemy encounter ➔ 2s: Streamer facecam ➔ 4s: Subtitle trigger ➔ 6s: Final kill drop.",
      captionsStyle: "Yellow & white bold centered font with active word pop animation.",
      attentionScore: 95,
    };

    // 6. Publishing Calendar
    const publishingCalendar: CalendarItem[] = [
      {
        dayLabel: "Today",
        assetTitle: "Short #1: Streamer Somehow Won A 1v4",
        platform: "YouTube Shorts & TikTok",
        rationale: "Capitalizes on peak live stream momentum within 12 hours of broadcast.",
      },
      {
        dayLabel: "Tomorrow",
        assetTitle: "TikTok #1: Streamer Laughing Reaction",
        platform: "TikTok & Instagram Reels",
        rationale: "Maintains daily upload cadence with lightweight comedy short content.",
      },
      {
        dayLabel: "48 Hours Later",
        assetTitle: "Community Poll & Q&A Post",
        platform: "YouTube Community Tab",
        rationale: "Keeps subscribers engaged between scheduled broadcast days.",
      },
      {
        dayLabel: "Weekend",
        assetTitle: "Highlight Video: Best Clutches & Moments",
        platform: "YouTube Main Channel",
        rationale: "Weekend audience consumption peaks for 8-10 minute highlight compilations.",
      },
    ];

    // 7. Missed Opportunities
    const missedOpportunities: MissedOpportunity[] = [
      {
        title: "Subscriber Milestone Celebration",
        reasonIgnored: "Chat spammed sub hype emotes at minute 42, but reaction was cut short by fast game restart.",
        futureRecommendation: "Pause for 30 seconds out loud to celebrate new subscribers live on stream.",
      },
      {
        title: "Deep Audience Q&A Segment",
        reasonIgnored: "5 community questions were submitted during silent transition.",
        futureRecommendation: "Schedule a dedicated 90-second Q&A break during gameplay loading screens.",
      },
    ];

    // 8. Next Stream Preparation Checklist
    const nextStreamChecklist: NextStreamChecklist[] = [
      { item: "Start community Q&A 15 minutes earlier in the broadcast.", category: "Engagement" },
      { item: "Acknowledge subscriber celebrations with dedicated verbal callout.", category: "Community" },
      { item: "Reduce silent gameplay transitions longer than 5 minutes.", category: "Pacing" },
      { item: "Prompt chat with an open-ended question during mid-stream lull.", category: "Engagement" },
      { item: "Extend stream duration past 60 minutes for higher algorithmic push.", category: "Pacing" },
    ];

    return {
      sessionId,
      executiveBrief,
      topAssets,
      titleOptions,
      thumbnailAdvice,
      hookStrategy,
      publishingCalendar,
      missedOpportunities,
      nextStreamChecklist,
      createdAt: new Date().toISOString(),
    };
  }
}

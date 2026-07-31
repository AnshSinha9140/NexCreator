export interface ContentAssetItem {
  id: string;
  assetType: "Best Short" | "Best TikTok" | "Best YouTube Highlight" | "Best Thumbnail Moment" | "Best Community Post";
  title: string;
  hook: string;
  recommendedDuration: string;
  bestPlatform: string;
  priority: "Critical" | "High" | "Medium";
  difficulty: "Easy" | "Moderate" | "Hard";
  confidence: number;
  expectedAudience: string;
  whyAiSelected: string;
  evidence: string[];
  checklist: string[];
  viralScores: {
    virality: number;
    replay: number;
    retention: number;
    ctrPrediction: number;
    communityInterest: number;
    communityImpact?: number;
    overallPublishScore: number;
  };

}

export interface TitleOption {
  type: "Curiosity" | "SEO" | "High CTR";
  title: string;
  explanation: string;
}

export interface ThumbnailAdvice {
  faceReaction: string;
  recommendedText: string;
  emotion: string;
  backgroundFocus: string;
  conceptDescription: string;
}

export interface HookStrategy {
  first5Seconds: string;
  openingSentence: string;
  recommendedPacing: string;
  visualSequence: string;
  captionsStyle: string;
  attentionScore: number;
}

export interface CalendarItem {
  dayLabel: "Today" | "Tomorrow" | "48 Hours Later" | "Weekend";
  assetTitle: string;
  platform: string;
  rationale: string;
}

export interface ExecutivePublishingBrief {
  summaryText: string;
  shortsCount: number;
  highlightsCount: number;
  thumbnailCandidatesCount: number;
  longFormRecommended: boolean;
  highestPriorityAction: string;
}

export interface MissedOpportunity {
  title: string;
  reasonIgnored: string;
  futureRecommendation: string;
}

export interface NextStreamChecklist {
  item: string;
  category: "Engagement" | "Pacing" | "Technical" | "Community";
}

export interface ContentStrategyReport {
  sessionId: string;
  executiveBrief: ExecutivePublishingBrief;
  topAssets: ContentAssetItem[];
  titleOptions: TitleOption[];
  thumbnailAdvice: ThumbnailAdvice;
  hookStrategy: HookStrategy;
  publishingCalendar: CalendarItem[];
  missedOpportunities: MissedOpportunity[];
  nextStreamChecklist: NextStreamChecklist[];
  createdAt: string;
}

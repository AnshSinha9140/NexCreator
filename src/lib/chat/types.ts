export type ChatTokenType = "text" | "emote" | "emoji" | "link" | "mention";

export interface ChatEmoteToken {
  type: "emote";
  id: string;
  name: string;
  imageUrl?: string;
  platform: string;
}

export interface ChatEmojiToken {
  type: "emoji";
  char: string;
  meaning: string;
  sentiment: number; // -1 (negative) to 1 (positive)
  hypeWeight: number; // 0 to 1
  category: "laugh" | "hype" | "love" | "crying" | "skull" | "celebration" | "general";
}

export type BadgeType =
  | "broadcaster"
  | "moderator"
  | "subscriber"
  | "vip"
  | "founder"
  | "verified"
  | "member"
  | "og";

export interface ChatBadge {
  type: BadgeType;
  label: string;
  badgeUrl?: string;
  color?: string;
}

export interface ChatToken {
  type: ChatTokenType;
  value: string;
  emote?: ChatEmoteToken;
  emoji?: ChatEmojiToken;
}

export interface CanonicalChatMessage {
  id: string;
  sessionId: string;
  platform: "kick" | "youtube" | "twitch" | string;
  timestamp: string;
  author: {
    id?: string;
    username: string;
    displayName: string;
    badges: ChatBadge[];
    avatarUrl?: string;
  };
  rawText: string;
  displayText: string;
  semanticText: string; // Used by AI Producer (e.g. "[laughter] fire x4")
  tokens: ChatToken[];
  emotes: ChatEmoteToken[];
  emojis: ChatEmojiToken[];
  metrics: {
    sentimentScore: number; // 0 to 100
    hypeWeight: number; // 0 to 10
    hasQuestions: boolean;
    hasMentions: boolean;
    isHighlightCandidate: boolean;
  };
}

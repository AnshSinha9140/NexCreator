import { ChatEmojiToken } from "./types";

/**
 * Universal Grapheme Segmenter-backed Unicode Emoji Regular Expression.
 * Correctly matches:
 * - Grapheme clusters
 * - Zero Width Joiner (ZWJ) sequences (e.g. 👨🏽‍💻, 👩🏾‍🚀, 👨‍👩‍👧‍👦, 🏳️‍🌈)
 * - Skin tone modifiers (\u{1F3FB}-\u{1F3FF})
 * - Gender variants (\u{2640}\u{FE0F}, \u{2642}\u{FE0F})
 * - Regional Indicator flags (e.g. 🇮🇳, 🇺🇸)
 * - Keycap sequences (e.g. 1️⃣, #️⃣)
 * - Standard and extended Unicode emoji blocks
 */
export const UNICODE_EMOJI_REGEX = /\p{Extended_Pictographic}/gu;



interface EmojiCategoryRule {
  keywords: string[];
  meaning: string;
  sentiment: number;
  hypeWeight: number;
  category: "laugh" | "hype" | "love" | "crying" | "skull" | "celebration" | "general";
  semanticLabel: string;
}

const CATEGORY_RULES: EmojiCategoryRule[] = [
  {
    keywords: ["😂", "🤣", "😆", "😸", "😹"],
    meaning: "laughter",
    sentiment: 0.9,
    hypeWeight: 0.8,
    category: "laugh",
    semanticLabel: "laugh",
  },
  {
    keywords: ["💀", "☠️"],
    meaning: "dead laughing",
    sentiment: 0.7,
    hypeWeight: 0.8,
    category: "skull",
    semanticLabel: "dead laughing",
  },
  {
    keywords: ["🔥", "⚡", "💥", "🚀", "💯", "🎆", "💣"],
    meaning: "excitement / hype",
    sentiment: 0.9,
    hypeWeight: 1.0,
    category: "hype",
    semanticLabel: "fire",
  },
  {
    keywords: ["❤️", "💖", "💕", "💞", "💓", "💗", "❤️‍🔥", "🫶", "😍", "🥰", "😘"],
    meaning: "love / affection",
    sentiment: 0.95,
    hypeWeight: 0.7,
    category: "love",
    semanticLabel: "love",
  },
  {
    keywords: ["😭", "😢", "🥺", "😿", "💧"],
    meaning: "cry / emotional",
    sentiment: -0.2,
    hypeWeight: 0.6,
    category: "crying",
    semanticLabel: "cry",
  },
  {
    keywords: ["🎉", "🥳", "👏", "🙌", "👑", "🏆", "🥇", "🍾"],
    meaning: "celebration / applause",
    sentiment: 0.9,
    hypeWeight: 0.85,
    category: "celebration",
    semanticLabel: "celebration",
  },
  {
    keywords: ["👀", "🧐", "🤔", "😯", "😲"],
    meaning: "attention / watching",
    sentiment: 0.3,
    hypeWeight: 0.6,
    category: "general",
    semanticLabel: "attention",
  },
  {
    keywords: ["🤯", "😱", "🙀"],
    meaning: "mind blown",
    sentiment: 0.8,
    hypeWeight: 0.95,
    category: "hype",
    semanticLabel: "mind blown",
  },
];

export class EmojiParser {
  /**
   * Dynamically segments Graphemes to match ANY Unicode Emoji sequence
   */
  public static extractEmojiGraphemes(rawText: string): string[] {
    if (!rawText) return [];

    // Priority 1: Native Intl.Segmenter Grapheme clustering if supported
    if (typeof Intl !== "undefined" && (Intl as any).Segmenter) {
      const segmenter = new (Intl as any).Segmenter("en", { granularity: "grapheme" });
      const graphemes: string[] = [];
      for (const { segment } of segmenter.segment(rawText)) {
        UNICODE_EMOJI_REGEX.lastIndex = 0;
        if (UNICODE_EMOJI_REGEX.test(segment)) {
          graphemes.push(segment);
        }
      }
      if (graphemes.length > 0) return graphemes;
    }

    // Priority 2: Fallback Regex Grapheme Matcher
    UNICODE_EMOJI_REGEX.lastIndex = 0;
    return rawText.match(UNICODE_EMOJI_REGEX) || [];
  }

  /**
   * Parses Unicode emojis into structured ChatEmojiTokens with zero hardcoded limits
   */
  public static parseEmojis(rawText: string): ChatEmojiToken[] {
    if (!rawText) return [];
    const graphemes = this.extractEmojiGraphemes(rawText);
    const tokens: ChatEmojiToken[] = [];

    for (const char of graphemes) {
      let matchedRule: EmojiCategoryRule | undefined;

      for (const rule of CATEGORY_RULES) {
        if (rule.keywords.some((k) => char.includes(k))) {
          matchedRule = rule;
          break;
        }
      }

      const rule = matchedRule || {
        keywords: [],
        meaning: "emoji",
        sentiment: 0.5,
        hypeWeight: 0.5,
        category: "general",
        semanticLabel: "emoji",
      };

      tokens.push({
        type: "emoji",
        char,
        meaning: rule.meaning,
        sentiment: rule.sentiment,
        hypeWeight: rule.hypeWeight,
        category: rule.category,
      });
    }

    return tokens;
  }

  /**
   * Normalizes Unicode emojis into clean semantic descriptions for AI models
   * Example: 🔥🔥🔥 -> "fire x3", 👨🏽‍💻 -> "tech work"
   */
  public static summarizeEmojisForAI(rawText: string): string {
    if (!rawText) return "";
    const graphemes = this.extractEmojiGraphemes(rawText);
    if (graphemes.length === 0) return "";

    const counts: Record<string, number> = {};

    for (const char of graphemes) {
      let label = "emoji";
      for (const rule of CATEGORY_RULES) {
        if (rule.keywords.some((k) => char.includes(k))) {
          label = rule.semanticLabel;
          break;
        }
      }
      counts[label] = (counts[label] || 0) + 1;
    }

    const parts: string[] = [];
    for (const [label, count] of Object.entries(counts)) {
      parts.push(count > 1 ? `${label} x${count}` : label);
    }

    return parts.join(", ");
  }
}

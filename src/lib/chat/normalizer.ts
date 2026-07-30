import { CanonicalChatMessage, ChatToken } from "./types";
import { EmoteParser } from "./emotes";
import { EmojiParser } from "./emojis";
import { BadgeParser } from "./badges";

export class MessageNormalizer {
  /**
   * Main Ingestion Pipeline Normalizer: Converts raw incoming platform payload into CanonicalChatMessage.
   * Runs ONCE during ingestion.
   */
  public static normalize(rawMessage: any, sessionId: string): CanonicalChatMessage {
    const id = String(rawMessage.id || rawMessage._id || `msg_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`);
    const platform = (rawMessage.platform || "kick").toLowerCase();
    const timestamp = rawMessage.timestamp instanceof Date
      ? rawMessage.timestamp.toISOString()
      : typeof rawMessage.timestamp === "string"
      ? rawMessage.timestamp
      : new Date().toISOString();

    const rawText = String(rawMessage.message || rawMessage.text || rawMessage.content || "");
    const authorName = String(
      rawMessage.author?.displayName ||
      rawMessage.author?.username ||
      rawMessage.username ||
      rawMessage.sender ||
      "anonymous"
    );

    // 1. Parse Emotes & Emojis & Badges
    const emotes = EmoteParser.parseEmotes(rawText, platform);
    const emojis = EmojiParser.parseEmojis(rawText);
    const badges = BadgeParser.parseBadges(rawMessage.author?.badges || rawMessage.badges || [], platform);

    // 2. Build Token Stream for UI Rendering
    const tokens: ChatToken[] = [];
    const displayText = EmoteParser.formatEmoteText(rawText);

    // Split text into word tokens and detect emotes/emojis
    const words = displayText.split(/(\s+)/);
    for (const w of words) {
      if (!w) continue;

      // Check if word matches an emote placeholder e.g. :KEKW:
      const emoteMatch = emotes.find((e) => `:${e.name}:` === w || e.name === w);
      if (emoteMatch) {
        tokens.push({
          type: "emote",
          value: w,
          emote: emoteMatch,
        });
        continue;
      }

      // Check if word is a Unicode emoji
      const emojiMatch = emojis.find((e) => e.char === w);
      if (emojiMatch) {
        tokens.push({
          type: "emoji",
          value: w,
          emoji: emojiMatch,
        });
        continue;
      }

      tokens.push({
        type: "text",
        value: w,
      });
    }

    // 3. Construct Semantic Text for AI Producer
    let semanticText = displayText;
    if (emotes.length > 0) {
      const emoteNames = Array.from(new Set(emotes.map((e) => e.name))).join(" ");
      semanticText = semanticText.replace(/:[a-zA-Z0-9_]+:/g, `[${emoteNames}]`);
    }

    const emojiSummary = EmojiParser.summarizeEmojisForAI(rawText);
    if (emojiSummary) {
      semanticText = `${semanticText} (${emojiSummary})`;
    }

    // 4. Calculate Sentiment & Hype Metrics
    let sentimentScore = 50;
    let hypeWeight = 0;

    for (const emoji of emojis) {
      sentimentScore += Math.round(emoji.sentiment * 15);
      hypeWeight += emoji.hypeWeight * 2;
    }

    for (const emote of emotes) {
      const upper = emote.name.toUpperCase();
      if (["KEKW", "OMEGALUL", "LMAO", "LOL"].includes(upper)) {
        sentimentScore += 10;
        hypeWeight += 1.5;
      } else if (["GG", "W", "POG", "POGCHAMP", "HYPERS", "FIRE"].includes(upper)) {
        sentimentScore += 15;
        hypeWeight += 2.0;
      }
    }

    sentimentScore = Math.max(0, Math.min(100, sentimentScore));
    hypeWeight = Math.min(10, Number(hypeWeight.toFixed(1)));

    const hasQuestions = displayText.includes("?") || /^(who|what|why|how|when|where|can|is)\b/i.test(displayText.trim());
    const hasMentions = displayText.includes("@");
    const isHighlightCandidate = hypeWeight >= 4 || sentimentScore >= 85 || sentimentScore <= 15;

    return {
      id,
      sessionId,
      platform,
      timestamp,
      author: {
        id: rawMessage.author?.id,
        username: authorName,
        displayName: authorName,
        badges,
        avatarUrl: rawMessage.author?.avatarUrl,
      },
      rawText,
      displayText,
      semanticText,
      tokens,
      emotes,
      emojis,
      metrics: {
        sentimentScore,
        hypeWeight,
        hasQuestions,
        hasMentions,
        isHighlightCandidate,
      },
    };
  }
}

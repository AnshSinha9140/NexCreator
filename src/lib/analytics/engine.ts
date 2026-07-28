import { LiveChatMessage } from "@/lib/ingestion/types";

export interface CanonicalAnalytics {
  viewers: number;
  velocity: number;           // msgs / min
  sentiment: number;          // 0 - 100
  engagement: number;         // 0 - 100 %
  momentum: number;           // 0 - 100 score
  hypeScore: number;          // 0 - 100 %
  questionCount: number;
  uniqueChatters: number;
  emojiRate: number;          // % of messages with emojis (0-100)
  capsRate: number;           // % of messages with ALL CAPS (0-100)
  excitementScore: number;    // 0 - 100
  toxicityScore: number;      // 0 - 100
  generatedAt: string;
  sampleSize: number;
}

const POSITIVE_WORDS = [
  "love", "gg", "w", "hyped", "pog", "fire", "great", "awesome", "goat", "yes",
  "super", "omg", "insane", "nice", "king", "win", "good", "lol", "lmao", "haha",
  "best", "legend", "hype", "clutch", "clean", "letsgo", "epic"
];

const NEGATIVE_WORDS = [
  "l", "bad", "boring", "trash", "fake", "stop", "worst", "lag", "no", "hate",
  "cringe", "rip", "sad", "fail", "terrible", "slow", "boo", "scam"
];

const POSITIVE_EMOJIS = ["🔥", "❤️", "👑", "🐐", "😂", "🙌", "🚀", "💯", "👏", "😍", "🎉", "⭐"];

export class CanonicalAnalyticsEngine {
  public static compute(params: {
    messages: LiveChatMessage[];
    viewers: number;
    streamDurationSeconds: number;
    previousAnalytics?: CanonicalAnalytics | null;
  }): CanonicalAnalytics {
    const { messages, viewers, streamDurationSeconds, previousAnalytics } = params;
    const sampleSize = messages.length;
    const nowIso = new Date().toISOString();

    // 1. Chat Velocity (messages per minute)
    const effectiveDurationMin = Math.max(0.1, streamDurationSeconds / 60);
    const velocity = Number((sampleSize / effectiveDurationMin).toFixed(1));

    if (sampleSize === 0) {
      return {
        viewers,
        velocity: 0,
        sentiment: 50,
        engagement: 0,
        momentum: previousAnalytics?.momentum || 50,
        hypeScore: 0,
        questionCount: 0,
        uniqueChatters: 0,
        emojiRate: 0,
        capsRate: 0,
        excitementScore: 0,
        toxicityScore: 0,
        generatedAt: nowIso,
        sampleSize: 0,
      };
    }

    // Unique Chatters & Question Count
    const uniqueChattersSet = new Set<string>();
    let questionCount = 0;
    let emojiMessageCount = 0;
    let capsMessageCount = 0;
    let positiveScoreSum = 0;
    let negativeScoreSum = 0;
    let excitementScoreSum = 0;

    for (const msg of messages) {
      const authorId = msg.author?.id || msg.author?.username || "anonymous";
      uniqueChattersSet.add(authorId);

      const text = (msg.message || "").trim();
      const lower = text.toLowerCase();

      // Question detection
      if (text.includes("?") || lower.startsWith("why") || lower.startsWith("how") || lower.startsWith("what") || lower.startsWith("can")) {
        questionCount++;
      }

      // Caps detection (ALL CAPS if > 4 chars and 80%+ uppercase)
      if (text.length >= 4 && text === text.toUpperCase() && /[A-Z]/.test(text)) {
        capsMessageCount++;
        excitementScoreSum += 2;
      }

      // Emoji detection & scoring
      let hasEmoji = false;
      for (const emoji of POSITIVE_EMOJIS) {
        if (text.includes(emoji)) {
          hasEmoji = true;
          positiveScoreSum += 3;
          excitementScoreSum += 3;
        }
      }
      if (hasEmoji) emojiMessageCount++;

      // Word Lexicon Scoring
      const words = lower.split(/\s+/);
      for (const word of words) {
        const cleanWord = word.replace(/[^a-z0-9]/g, "");
        if (!cleanWord) continue;

        if (POSITIVE_WORDS.includes(cleanWord)) {
          positiveScoreSum += 2;
          excitementScoreSum += 1;
        } else if (NEGATIVE_WORDS.includes(cleanWord)) {
          negativeScoreSum += 3;
        }
      }

      // Exclamation marks boost excitement
      const exclamations = (text.match(/!/g) || []).length;
      if (exclamations > 0) {
        excitementScoreSum += Math.min(exclamations * 2, 6);
      }
    }

    const uniqueChatters = uniqueChattersSet.size;
    const emojiRate = Number(((emojiMessageCount / sampleSize) * 100).toFixed(1));
    const capsRate = Number(((capsMessageCount / sampleSize) * 100).toFixed(1));

    // 2. Dynamic Sentiment (0 - 100)
    let rawSentiment = 50 + (positiveScoreSum * 2) - (negativeScoreSum * 3);
    const sentiment = Math.min(100, Math.max(0, Math.round(rawSentiment)));

    // 3. Normalized Engagement (0 - 100 %)
    const chatterRatio = viewers > 0 ? (uniqueChatters / viewers) * 100 : Math.min(100, uniqueChatters * 10);
    const velocityFactor = Math.min(40, velocity * 2);
    const questionFactor = Math.min(20, questionCount * 4);
    const engagement = Math.min(100, Math.round(chatterRatio * 0.4 + velocityFactor + questionFactor));

    // 4. Momentum (0 - 100 score measuring rate of change)
    let momentum = 50;
    if (previousAnalytics) {
      const velocityDelta = velocity - (previousAnalytics.velocity || 0);
      const engagementDelta = engagement - (previousAnalytics.engagement || 0);
      const viewerDelta = viewers - (previousAnalytics.viewers || 0);

      const deltaSum = (velocityDelta * 4) + (engagementDelta * 0.8) + (Math.sign(viewerDelta) * 5);
      momentum = Math.min(100, Math.max(0, Math.round((previousAnalytics.momentum || 50) * 0.5 + 50 + deltaSum)));
    } else {
      // Initial momentum based on initial activity
      momentum = Math.min(100, Math.max(20, Math.round(velocity * 3 + engagement * 0.4)));
    }

    // 5. Excitement & Hype Score (0 - 100 %)
    const excitementScore = Math.min(100, Math.round((excitementScoreSum / sampleSize) * 20 + capsRate * 0.3 + emojiRate * 0.3));
    const toxicityScore = Math.min(100, Math.round((negativeScoreSum / sampleSize) * 25));

    const hypeScore = Math.min(
      100,
      Math.round(velocity * 1.2 + excitementScore * 0.4 + momentum * 0.3 + emojiRate * 0.2)
    );

    return {
      viewers,
      velocity,
      sentiment,
      engagement,
      momentum,
      hypeScore,
      questionCount,
      uniqueChatters,
      emojiRate,
      capsRate,
      excitementScore,
      toxicityScore,
      generatedAt: nowIso,
      sampleSize,
    };
  }
}

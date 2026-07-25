import { LiveChatMessage } from "./types";
import { INGESTION_CONFIG } from "./config";

const STOP_WORDS = new Set([
  "the", "be", "to", "of", "and", "a", "in", "that", "have", "i", "it", "for",
  "not", "on", "with", "he", "as", "you", "do", "at", "this", "but", "his", "by",
  "from", "they", "we", "say", "her", "she", "or", "an", "will", "my", "one",
  "all", "would", "there", "their", "what", "so", "up", "out", "if", "about",
  "who", "get", "which", "go", "me", "is", "are", "was", "were", "am", "im", "can"
]);

const EMOJI_REGEX = /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu;

export interface LiveMetricsSummary {
  sessionId: string;
  totalMessages: number;
  messagesPerMinute: number;
  uniqueChattersCount: number;
  questionCount: number;
  replyCount: number;
  topEmojis: Array<{ emoji: string; count: number }>;
  topWords: Array<{ word: string; count: number }>;
  messageLengthStats: {
    avgLength: number;
    minLength: number;
    maxLength: number;
  };
  lastUpdated: string;
}

export class LiveMetricsAccumulator {
  private readonly sessionId: string;
  private totalMessages = 0;
  private uniqueChatters = new Set<string>();
  private questionCount = 0;
  private replyCount = 0;

  // Rolling 1-minute timestamps for MPM calculation
  private recentTimestamps: number[] = [];

  private emojiCounts: Map<string, number> = new Map();
  private wordCounts: Map<string, number> = new Map();

  private totalMessageLength = 0;
  private minMessageLength = Infinity;
  private maxMessageLength = 0;

  constructor(sessionId: string) {
    this.sessionId = sessionId;
  }

  /**
   * Process a single normalized chat message and update metrics in memory
   */
  public processMessage(msg: LiveChatMessage): void {
    this.totalMessages += 1;

    // 1. Bounded Unique Chatters Set
    const authorName = (msg.author.username || msg.author.displayName || "anonymous").toLowerCase();
    if (this.uniqueChatters.size < INGESTION_CONFIG.MAX_CHATTERS_CACHE) {
      this.uniqueChatters.add(authorName);
    }

    // 2. Rolling MPM timestamp (Zero-allocation prune)
    const now = Date.now();
    this.recentTimestamps.push(now);
    this.pruneTimestamps(now);

    // 3. Text length guard (prevent copypasta ReDoS / memory spikes)
    const text = (msg.message || "").slice(0, INGESTION_CONFIG.MAX_TEXT_LENGTH);
    const len = text.length;

    // 4. Message Length Stats
    this.totalMessageLength += len;
    if (len < this.minMessageLength) this.minMessageLength = len;
    if (len > this.maxMessageLength) this.maxMessageLength = len;

    // 5. Question Detection
    const trimmed = text.trim();
    if (
      trimmed.endsWith("?") ||
      /^(who|what|why|how|when|where|is|are|can|will|should)\b/i.test(trimmed)
    ) {
      this.questionCount += 1;
    }

    // 6. Reply / Mention Detection
    if (trimmed.startsWith("@") || /@\w+/.test(trimmed)) {
      this.replyCount += 1;
    }

    // 7. Bounded Emoji Tracking
    const emojisFound = text.match(EMOJI_REGEX) || [];
    for (const emoji of emojisFound) {
      this.incrementCount(this.emojiCounts, emoji, INGESTION_CONFIG.MAX_EMOJI_MAP_SIZE);
    }
    if (Array.isArray(msg.emotes)) {
      for (const emote of msg.emotes) {
        if (emote) this.incrementCount(this.emojiCounts, emote, INGESTION_CONFIG.MAX_EMOJI_MAP_SIZE);
      }
    }

    // 8. Bounded Word Frequency Tracking
    const words = text
      .toLowerCase()
      .replace(/[^\w\s]/g, "")
      .split(/\s+/)
      .slice(0, INGESTION_CONFIG.MAX_WORDS_PER_MESSAGE);

    for (const word of words) {
      if (word.length > 2 && !STOP_WORDS.has(word)) {
        this.incrementCount(this.wordCounts, word, INGESTION_CONFIG.MAX_WORD_MAP_SIZE);
      }
    }
  }

  /**
   * Helper to safely increment map count with bounded memory pruning
   */
  private incrementCount(map: Map<string, number>, key: string, maxMapSize: number): void {
    const existing = map.get(key);
    if (existing !== undefined) {
      map.set(key, existing + 1);
    } else if (map.size < maxMapSize) {
      map.set(key, 1);
    } else {
      // Memory Cap Reached: Prune single-occurrence entries to make room for frequent ones
      this.pruneSingleOccurrences(map);
      if (map.size < maxMapSize) {
        map.set(key, 1);
      }
    }
  }

  /**
   * Prunes low-frequency single-occurrence keys from frequency maps
   */
  private pruneSingleOccurrences(map: Map<string, number>): void {
    for (const [k, v] of map.entries()) {
      if (v === 1) {
        map.delete(k);
        if (map.size < 50) break; // Reclaim small chunk
      }
    }
  }

  /**
   * Prunes timestamps older than 60 seconds (O(K) zero-allocation index shift)
   */
  private pruneTimestamps(now: number): void {
    const cutoff = now - 60000;
    while (this.recentTimestamps.length > 0 && this.recentTimestamps[0] < cutoff) {
      this.recentTimestamps.shift();
    }
  }

  /**
   * Calculates current Messages Per Minute (MPM)
   */
  public getMessagesPerMinute(): number {
    this.pruneTimestamps(Date.now());
    return this.recentTimestamps.length;
  }

  /**
   * Returns current accumulated metrics summary
   */
  public getMetricsSummary(): LiveMetricsSummary {
    const mpm = this.getMessagesPerMinute();

    // Sort top emojis (bounded by MAX_TOP_EMOJIS)
    const topEmojis = Array.from(this.emojiCounts.entries())
      .map(([emoji, count]) => ({ emoji, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, INGESTION_CONFIG.MAX_TOP_EMOJIS);

    // Sort top words (bounded by MAX_TOP_WORDS)
    const topWords = Array.from(this.wordCounts.entries())
      .map(([word, count]) => ({ word, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, INGESTION_CONFIG.MAX_TOP_WORDS);

    const avgLength =
      this.totalMessages > 0 ? Math.round(this.totalMessageLength / this.totalMessages) : 0;
    const minLen = this.minMessageLength === Infinity ? 0 : this.minMessageLength;

    return {
      sessionId: this.sessionId,
      totalMessages: this.totalMessages,
      messagesPerMinute: mpm,
      uniqueChattersCount: this.uniqueChatters.size,
      questionCount: this.questionCount,
      replyCount: this.replyCount,
      topEmojis,
      topWords,
      messageLengthStats: {
        avgLength,
        minLength: minLen,
        maxLength: this.maxMessageLength,
      },
      lastUpdated: new Date().toISOString(),
    };
  }

  /**
   * Resets accumulator state
   */
  public reset(): void {
    this.totalMessages = 0;
    this.uniqueChatters.clear();
    this.questionCount = 0;
    this.replyCount = 0;
    this.recentTimestamps = [];
    this.emojiCounts.clear();
    this.wordCounts.clear();
    this.totalMessageLength = 0;
    this.minMessageLength = Infinity;
    this.maxMessageLength = 0;
  }
}

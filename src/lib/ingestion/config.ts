export const INGESTION_CONFIG = {
  /**
   * Primary retention policy window duration in milliseconds (Default: 10 minutes)
   */
  WINDOW_DURATION_MS: Number(process.env.INGESTION_WINDOW_MS) || 10 * 60 * 1000,

  /**
   * Maximum safety capacity cap for rolling buffer
   */
  MAX_MESSAGES: Number(process.env.INGESTION_MAX_MESSAGES) || 5000,

  /**
   * Maximum duplicate message ID cache size
   */
  MAX_DUPLICATE_CACHE: Number(process.env.INGESTION_MAX_DUPLICATE_CACHE) || 2000,

  /**
   * Maximum unique chatters retained in memory per session
   */
  MAX_CHATTERS_CACHE: Number(process.env.INGESTION_MAX_CHATTERS_CACHE) || 5000,

  /**
   * Maximum entries in word frequency map
   */
  MAX_WORD_MAP_SIZE: Number(process.env.INGESTION_MAX_WORD_MAP_SIZE) || 1000,

  /**
   * Maximum entries in emoji frequency map
   */
  MAX_EMOJI_MAP_SIZE: Number(process.env.INGESTION_MAX_EMOJI_MAP_SIZE) || 500,

  /**
   * Number of top words returned in telemetry summary
   */
  MAX_TOP_WORDS: Number(process.env.INGESTION_MAX_TOP_WORDS) || 10,

  /**
   * Number of top emojis returned in telemetry summary
   */
  MAX_TOP_EMOJIS: Number(process.env.INGESTION_MAX_TOP_EMOJIS) || 5,

  /**
   * Maximum character length of text processed per message (guards against copypasta ReDoS)
   */
  MAX_TEXT_LENGTH: 500,

  /**
   * Maximum words processed per message
   */
  MAX_WORDS_PER_MESSAGE: 50,

  /**
   * Debug Mode: Retains raw payloads (`raw?: unknown`) in memory when true.
   * False in production to reduce memory allocation by ~70%.
   */
  DEBUG_MODE: process.env.INGESTION_DEBUG === "true" || process.env.NODE_ENV === "development",
};

export const AI_CONFIG = {
  ENABLED: process.env.AI_ENABLED !== "false",
  PRIMARY_PROVIDER: process.env.AI_PROVIDER || "gemini",
  FALLBACK_PROVIDER: process.env.AI_FALLBACK_PROVIDER || "groq",
  GEMINI_MODEL: process.env.GEMINI_MODEL || "gemini-2.5-flash",
  GROQ_MODEL: process.env.GROQ_MODEL || "llama-3.3-70b-versatile",
  MODEL_VERSION: process.env.GEMINI_MODEL || "gemini-2.5-flash",
  PROMPT_VERSION: "v1.0",
  TIMEOUT_MS: 12000,
  MAX_RETRIES: 1,
  CACHE_TTL_MS: 15 * 60 * 1000, // 15 minutes
  MAX_ANALYSES_PER_HOUR: 6,
  DECISION_THRESHOLDS: {
    MPM_DELTA: 1.0, // 100%
    VIEWER_DELTA: 0.3, // 30%
    MAX_HEARTBEAT_INTERVAL_MS: 30 * 60 * 1000, // 30 minutes
  },
};

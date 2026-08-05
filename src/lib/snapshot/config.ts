export const SNAPSHOT_CONFIG = {
  // Sprint 22.1 Requirement: Default snapshot every 5-10 minutes (300,000ms = 5 minutes)
  SNAPSHOT_INTERVAL_MS: 300000,

  /**
   * Maximum number of representative messages retained per snapshot (10 - 20)
   */
  MAX_REPRESENTATIVE_MESSAGES: Number(process.env.MAX_REPRESENTATIVE_MESSAGES) || 15,

  /**
   * Flag to enable/disable rule-based engagement signals
   */
  ENABLE_RULE_SIGNALS: process.env.ENABLE_RULE_SIGNALS !== "false",
};

export const SNAPSHOT_CONFIG = {
  /**
   * Interval duration in milliseconds for generating Pulse Snapshots (Default: 10 minutes)
   */
  SNAPSHOT_INTERVAL_MS: Number(process.env.SNAPSHOT_INTERVAL_MS) || 10 * 60 * 1000,

  /**
   * Maximum number of representative messages retained per snapshot (10 - 20)
   */
  MAX_REPRESENTATIVE_MESSAGES: Number(process.env.MAX_REPRESENTATIVE_MESSAGES) || 15,

  /**
   * Flag to enable/disable rule-based engagement signals
   */
  ENABLE_RULE_SIGNALS: process.env.ENABLE_RULE_SIGNALS !== "false",
};

export const DETECTION_CONFIG = {
  /**
   * Interval duration in milliseconds for background detection daemon poll loop (Default: 10 seconds)
   */
  POLL_INTERVAL_MS: Number(process.env.DETECTION_POLL_INTERVAL_MS) || 10000,

  /**
   * Configurable Offline Grace Period in milliseconds before automatically finalizing a session (Default: 5 minutes = 300,000ms)
   */
  OFFLINE_GRACE_PERIOD_MS: Number(process.env.OFFLINE_GRACE_PERIOD_MS) || 5 * 60 * 1000,

  /**
   * Session heartbeat interval in milliseconds (Default: 30 seconds)
   */
  HEARTBEAT_INTERVAL_MS: 30000,
};

export const DETECTION_CONFIG = {
  /**
   * Interval duration in milliseconds for background detection daemon poll loop (Default: 180 seconds / 3 minutes)
   */
  POLL_INTERVAL_MS: Number(process.env.DETECTION_POLL_INTERVAL_MS) || 180000,

  /**
   * Configurable Offline Grace Period in milliseconds before automatically finalizing a session (Default: 5 minutes = 300,000ms)
   */
  OFFLINE_GRACE_PERIOD_MS: Number(process.env.OFFLINE_GRACE_PERIOD_MS) || 5 * 60 * 1000,

  /**
   * Session heartbeat interval in milliseconds (Default: 30 seconds)
   */
  HEARTBEAT_INTERVAL_MS: 30000,
};

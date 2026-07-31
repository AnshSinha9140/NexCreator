export interface CollectorDiagnosticsSummary {
  socketOpenedCount: number;
  socketClosedCount: number;
  socketErrorCount: number;
  heartbeatReceivedCount: number;
  heartbeatMissedCount: number;
  reconnectStartedCount: number;
  reconnectSucceededCount: number;
  reconnectFailedCount: number;
  lastReconnectAt: string | null;
  lastDisconnectAt: string | null;
  totalConnectionDurationSec: number;
  closeCode: number | null;
  closeReason: string | null;
}

class CollectorDiagnosticsTrackerRegistry {
  private summary: CollectorDiagnosticsSummary = {
    socketOpenedCount: 0,
    socketClosedCount: 0,
    socketErrorCount: 0,
    heartbeatReceivedCount: 0,
    heartbeatMissedCount: 0,
    reconnectStartedCount: 0,
    reconnectSucceededCount: 0,
    reconnectFailedCount: 0,
    lastReconnectAt: null,
    lastDisconnectAt: null,
    totalConnectionDurationSec: 0,
    closeCode: null,
    closeReason: null,
  };

  public recordSocketOpen() {
    this.summary.socketOpenedCount += 1;
  }

  public recordSocketClose(code?: number, reason?: string) {
    this.summary.socketClosedCount += 1;
    this.summary.lastDisconnectAt = new Date().toISOString();
    if (code) this.summary.closeCode = code;
    if (reason) this.summary.closeReason = reason;
  }

  public recordSocketError(err?: string) {
    this.summary.socketErrorCount += 1;
    if (err) this.summary.closeReason = err;
  }

  public recordHeartbeat(missed = false) {
    if (missed) {
      this.summary.heartbeatMissedCount += 1;
    } else {
      this.summary.heartbeatReceivedCount += 1;
    }
  }

  public recordReconnectStart() {
    this.summary.reconnectStartedCount += 1;
  }

  public recordReconnectResult(success: boolean) {
    this.summary.lastReconnectAt = new Date().toISOString();
    if (success) {
      this.summary.reconnectSucceededCount += 1;
    } else {
      this.summary.reconnectFailedCount += 1;
    }
  }

  public getSummary(sessionDurationSec: number = 0): CollectorDiagnosticsSummary {
    return {
      ...this.summary,
      totalConnectionDurationSec: sessionDurationSec,
    };
  }
}

export const CollectorDiagnosticsTracker = new CollectorDiagnosticsTrackerRegistry();

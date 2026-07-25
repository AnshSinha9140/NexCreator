export type HealthStatus = "healthy" | "warning" | "failed" | "inactive";

export interface SubsystemState {
  status: HealthStatus;
  lastSuccess: string | null;
  lastFailure: string | null;
  lastError: string | null;
  lastUpdated: string;
}

export interface AuthenticationState {
  status: HealthStatus;
  authenticatedUser: string | null;
  creatorId: string | null;
  lastUpdated: string;
}

export interface DetectionState extends SubsystemState {
  viewerCount: number;
  peakViewers: number;
  sessionStartTime: string | null;
}

export interface CollectorState extends SubsystemState {
  connected: boolean;
  subscriptionConfirmed: boolean;
  rawEvents: number;
  parsedEvents: number;
  unknownEvents: number;
  parseFailures: number;
  droppedMessages: number;
  duplicateMessages: number;
  reconnectCount: number;
  lastChatTimestamp: string | null;
  lastParsedChat: string | null;
  lastBufferWrite: string | null;
}

export interface BufferState extends SubsystemState {
  messages: number;
  representativeCandidates: number;
}

export interface SnapshotState extends SubsystemState {
  lastSnapshot: string | null;
  generatedSnapshots: number;
  representativeMessages: number;
}

export interface AIState extends SubsystemState {
  provider: string | null;
  fallback: boolean;
  lastInsight: string | null;
  geminiCalls: number;
  groqCalls: number;
  ruleEngineCalls: number;
  fallbackCount: number;
  totalLatency: number;
  aiRuns: number;
}

export interface PipelineState {
  authentication: AuthenticationState;
  detection: DetectionState;
  collector: CollectorState;
  buffer: BufferState;
  snapshot: SnapshotState;
  ai: AIState;
}

export interface RawEvent {
  eventName: string;
  channel: string;
  payloadSize: number;
  timestamp: string;
  ignored: boolean;
  parsed: boolean;
  reasonIgnored: string | null;
  payloadPreview: string;
}

class StateRegistry {
  private state: PipelineState = {
    authentication: { status: "inactive", authenticatedUser: null, creatorId: null, lastUpdated: new Date().toISOString() },
    detection: { status: "inactive", lastSuccess: null, lastFailure: null, lastError: null, lastUpdated: new Date().toISOString(), viewerCount: 0, peakViewers: 0, sessionStartTime: null },
    collector: { status: "inactive", lastSuccess: null, lastFailure: null, lastError: null, lastUpdated: new Date().toISOString(), connected: false, subscriptionConfirmed: false, rawEvents: 0, parsedEvents: 0, unknownEvents: 0, parseFailures: 0, droppedMessages: 0, duplicateMessages: 0, reconnectCount: 0, lastChatTimestamp: null, lastParsedChat: null, lastBufferWrite: null },
    buffer: { status: "inactive", lastSuccess: null, lastFailure: null, lastError: null, lastUpdated: new Date().toISOString(), messages: 0, representativeCandidates: 0 },
    snapshot: { status: "inactive", lastSuccess: null, lastFailure: null, lastError: null, lastUpdated: new Date().toISOString(), lastSnapshot: null, generatedSnapshots: 0, representativeMessages: 0 },
    ai: { status: "inactive", lastSuccess: null, lastFailure: null, lastError: null, lastUpdated: new Date().toISOString(), provider: null, fallback: false, lastInsight: null, geminiCalls: 0, groqCalls: 0, ruleEngineCalls: 0, fallbackCount: 0, totalLatency: 0, aiRuns: 0 },
  };

  private eventsBuffer: RawEvent[] = [];
  private readonly MAX_EVENTS = 100;

  public getState(): PipelineState {
    return this.state;
  }

  public updateSubsystem<K extends keyof PipelineState>(
    subsystem: K,
    updates: Partial<PipelineState[K]>
  ) {
    this.state[subsystem] = {
      ...this.state[subsystem],
      ...updates,
      lastUpdated: new Date().toISOString(),
    };
  }

  public incrementCounter(
    subsystem: "collector" | "buffer" | "snapshot" | "ai",
    counter: string,
    amount: number = 1
  ) {
    if (typeof (this.state as any)[subsystem][counter] === "number") {
      (this.state as any)[subsystem][counter] += amount;
      this.state[subsystem].lastUpdated = new Date().toISOString();
    }
  }

  public addRawEvent(event: RawEvent) {
    this.eventsBuffer.push(event);
    if (this.eventsBuffer.length > this.MAX_EVENTS) {
      this.eventsBuffer.shift();
    }
  }

  public getRawEvents(): RawEvent[] {
    return [...this.eventsBuffer];
  }

  public getHealthSummary() {
    return {
      overall: this.calculateOverallHealth(),
      authentication: this.state.authentication.status,
      detection: this.state.detection.status,
      collector: this.state.collector.status,
      buffer: this.state.buffer.status,
      snapshot: this.state.snapshot.status,
      ai: this.state.ai.status,
    };
  }

  private calculateOverallHealth(): HealthStatus {
    const statuses = [
      this.state.authentication.status,
      this.state.detection.status,
      this.state.collector.status,
      this.state.buffer.status,
      this.state.snapshot.status,
      this.state.ai.status,
    ];
    if (statuses.includes("failed")) return "failed";
    if (statuses.includes("warning")) return "warning";
    if (statuses.every((s) => s === "healthy" || s === "inactive")) return "healthy";
    return "inactive";
  }

  public resetSessionState(authUserEmail: string, userId: string) {
    const now = new Date().toISOString();
    this.state = {
      authentication: { status: "healthy", authenticatedUser: authUserEmail, creatorId: userId, lastUpdated: now },
      detection: { status: "inactive", lastSuccess: null, lastFailure: null, lastError: null, lastUpdated: now, viewerCount: 0, peakViewers: 0, sessionStartTime: null },
      collector: { status: "inactive", lastSuccess: null, lastFailure: null, lastError: null, lastUpdated: now, connected: false, subscriptionConfirmed: false, rawEvents: 0, parsedEvents: 0, unknownEvents: 0, parseFailures: 0, droppedMessages: 0, duplicateMessages: 0, reconnectCount: 0, lastChatTimestamp: null, lastParsedChat: null, lastBufferWrite: null },
      buffer: { status: "inactive", lastSuccess: null, lastFailure: null, lastError: null, lastUpdated: now, messages: 0, representativeCandidates: 0 },
      snapshot: { status: "inactive", lastSuccess: null, lastFailure: null, lastError: null, lastUpdated: now, lastSnapshot: null, generatedSnapshots: 0, representativeMessages: 0 },
      ai: { status: "inactive", lastSuccess: null, lastFailure: null, lastError: null, lastUpdated: now, provider: null, fallback: false, lastInsight: null, geminiCalls: 0, groqCalls: 0, ruleEngineCalls: 0, fallbackCount: 0, totalLatency: 0, aiRuns: 0 },
    };
    this.eventsBuffer = [];
  }

  public printSessionSummary() {
    let duration = "Unknown";
    if (this.state.detection.sessionStartTime) {
      const ms = Date.now() - new Date(this.state.detection.sessionStartTime).getTime();
      const mins = Math.floor(ms / 60000);
      const secs = Math.floor((ms % 60000) / 1000);
      duration = `${mins}m ${secs}s`;
    }
    
    const avgLatency = this.state.ai.aiRuns > 0 ? Math.round(this.state.ai.totalLatency / this.state.ai.aiRuns) : 0;

    console.log(`
=========================
SESSION SUMMARY
=========================
Duration: ${duration}
Peak Viewers: ${this.state.detection.peakViewers}
Messages Received: ${this.state.collector.rawEvents}
Messages Parsed: ${this.state.collector.parsedEvents}
Messages Buffered: ${this.state.buffer.messages}
Representative Candidates: ${this.state.buffer.representativeCandidates}
Representative Messages Selected: ${this.state.snapshot.representativeMessages}
Snapshots Generated: ${this.state.snapshot.generatedSnapshots}
AI Runs: ${this.state.ai.aiRuns}
Gemini Calls: ${this.state.ai.geminiCalls}
Groq Calls: ${this.state.ai.groqCalls}
Rule Engine Calls: ${this.state.ai.ruleEngineCalls}
Fallback Count: ${this.state.ai.fallbackCount}
Dropped Messages: ${this.state.collector.droppedMessages}
Duplicate Messages: ${this.state.collector.duplicateMessages}
Ignored Events: ${this.state.collector.unknownEvents}
Reconnect Count: ${this.state.collector.reconnectCount}
Average Processing Latency: ${avgLatency}ms
=========================`);
  }
}

export const DiagnosticsState = new StateRegistry();

import { RuntimeTelemetryState } from "./runtimeTelemetryState";

export interface TelemetryIntegrityResult {
  score: number; // 0 to 100
  status: "100% Truthful" | "Degraded Integrity" | "Critical Telemetry Mismatch";
  inconsistencies: string[];
  warnings: string[];
  totalChecksPassed: number;
  totalChecksEvaluated: number;
}

export class RuntimeTelemetryValidator {
  public static validate(state: RuntimeTelemetryState, sessionActive: boolean = false): TelemetryIntegrityResult {
    const inconsistencies: string[] = [];
    const warnings: string[] = [];
    let checksPassed = 0;
    let totalChecks = 0;

    const { transport, timing, counters, pipeline, derived } = state;

    // Check 1: ReadyState vs Transport State synchronization
    totalChecks += 1;
    if (transport.readyState === 1 && transport.transportState !== "CONNECTED") {
      inconsistencies.push(`ReadyState is OPEN (1), but TransportState is '${transport.transportState}'. Must be CONNECTED.`);
    } else if (transport.readyState === 3 && transport.transportState === "CONNECTED") {
      inconsistencies.push(`ReadyState is CLOSED (3), but TransportState is CONNECTED. Contradiction detected.`);
    } else {
      checksPassed += 1;
    }

    // Check 2: ReadyState CLOSED vs Heartbeat Age
    totalChecks += 1;
    if (sessionActive && transport.readyState === 3 && derived.heartbeatAgeSec === 0 && counters.heartbeatCount === 0) {
      inconsistencies.push("ReadyState is CLOSED during active session, but HeartbeatAge reports 0s.");
    } else {
      checksPassed += 1;
    }

    // Check 3: ReadyState CLOSED vs Sockets Closed Counter
    totalChecks += 1;
    if (sessionActive && transport.readyState === 3 && counters.socketsClosed === 0) {
      inconsistencies.push("ReadyState is CLOSED during active session, but SocketsClosed counter reports 0.");
    } else {
      checksPassed += 1;
    }

    // Check 4: Transport Connected vs Collector State
    totalChecks += 1;
    if (transport.transportState === "CONNECTED" && pipeline.collectorState === "warning") {
      warnings.push("Transport WebSocket is CONNECTED, but collector pipeline status is WARNING.");
      checksPassed += 1; // Warning, not contradiction
    } else {
      checksPassed += 1;
    }

    // Check 5: Heartbeat Count vs Heartbeat Age
    totalChecks += 1;
    if (sessionActive && counters.heartbeatCount > 0 && derived.heartbeatAgeSec < 0) {
      inconsistencies.push("Negative Heartbeat Age calculated.");
    } else {
      checksPassed += 1;
    }

    const score = Math.max(0, Math.round((checksPassed / totalChecks) * 100));

    let status: "100% Truthful" | "Degraded Integrity" | "Critical Telemetry Mismatch" = "100% Truthful";
    if (inconsistencies.length > 0 && score < 75) {
      status = "Critical Telemetry Mismatch";
    } else if (inconsistencies.length > 0 || warnings.length > 0) {
      status = "Degraded Integrity";
    }

    return {
      score,
      status,
      inconsistencies,
      warnings,
      totalChecksPassed: checksPassed,
      totalChecksEvaluated: totalChecks,
    };
  }
}

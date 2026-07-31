import {
  RuntimeSessionState,
  RuntimeCollectorState,
  RuntimeBufferState,
  RuntimeSnapshotState,
  RuntimeAIProducerState,
  RuntimeValidationResult,
} from "./monitoringTypes";
import { RuntimeTransportState } from "../runtime/runtimeTransportState";

export class MonitoringRuntimeValidator {
  public static validate(params: {
    session: RuntimeSessionState;
    collector: RuntimeCollectorState;
    buffer: RuntimeBufferState;
    snapshot: RuntimeSnapshotState;
    aiProducer: RuntimeAIProducerState;
    transportState?: RuntimeTransportState;
  }): RuntimeValidationResult {
    const { session, collector, buffer, snapshot, aiProducer, transportState } = params;

    const inconsistencies: string[] = [];
    const reasons: string[] = [];

    // Independent Subsystem Health Checks
    const isTransportConnected = transportState ? transportState.connected : collector.connected;

    const transportHealth: "Connected" | "Reconnecting" | "Closed" = isTransportConnected
      ? "Connected"
      : session.isActive
      ? "Reconnecting"
      : "Closed";

    const collectorHealth: "Healthy" | "Idle" | "Recovering" | "Offline" = !session.isActive
      ? "Offline"
      : isTransportConnected
      ? collector.messagesPerSec === 0
        ? "Idle"
        : "Healthy"
      : "Recovering";

    const pipelineHealth: "Healthy" | "Waiting" | "Degraded" = !session.isActive
      ? "Waiting"
      : isTransportConnected
      ? "Healthy"
      : "Degraded";

    const aiHealth: "Waiting" | "Processing" | "Healthy" = !session.isActive
      ? "Waiting"
      : aiProducer.runningJobs > 0
      ? "Processing"
      : "Healthy";

    // Rule 1: Active session vs Transport connection
    if (session.isActive && !isTransportConnected) {
      inconsistencies.push("Active session reported, but transport WebSocket is disconnected.");
      reasons.push("Transport socket interrupted during live monitoring session.");
    }

    // Rule 2: Collector inactive but buffer contains messages (un-flushed historical data)
    if (!isTransportConnected && buffer.currentBufferSize > 0) {
      inconsistencies.push("Transport is disconnected, but rolling buffer contains un-flushed messages.");
      reasons.push("Un-flushed historical chat messages remain in memory.");
    }

    // Rule 3: Buffer contains messages but Snapshot Engine is idle
    if (buffer.currentBufferSize > 100 && !snapshot.isRunning) {
      inconsistencies.push("Buffer usage exceeds threshold, but Snapshot Engine is idle.");
      reasons.push("Snapshot generation loop may have halted.");
    }

    const isPipelineConsistent = inconsistencies.length === 0;

    let overallHealth: "Healthy" | "Warning" | "Critical" = "Healthy";
    if (collectorHealth === "Offline" && session.isActive) {
      overallHealth = "Critical";
    } else if (transportHealth === "Reconnecting" || pipelineHealth === "Degraded" || inconsistencies.length > 0) {
      overallHealth = "Warning";
    }

    return {
      overallHealth,
      transportHealth,
      collectorHealth,
      pipelineHealth,
      aiHealth,
      isPipelineConsistent,
      inconsistencies,
      reasons,
    };
  }
}

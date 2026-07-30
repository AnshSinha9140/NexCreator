"use client";

import React from "react";
import { LiveSessionState } from "@/lib/session/sessionState";

interface LiveTelemetryPanelProps {
  state: LiveSessionState;
  isStopping: boolean;
  onStopSession: () => void;
}

export const LiveTelemetryPanel: React.FC<LiveTelemetryPanelProps> = ({
  state,
  isStopping,
  onStopSession,
}) => {
  const telemetry = state.telemetry;
  const collector = state.collector;
  const currentWindow = state.currentWindow;
  const health = state.health;
  const session = state.session;

  const formattedRemaining = `${Math.floor(currentWindow.remainingSeconds / 60)}m ${currentWindow.remainingSeconds % 60}s`;

  return (
    <div
      style={{
        width: "300px",
        flexShrink: 0,
        borderRadius: "16px",
        background: "rgba(13, 16, 27, 0.85)",
        backdropFilter: "blur(20px)",
        border: "1px solid rgba(255, 255, 255, 0.08)",
        padding: "20px",
        display: "flex",
        flexDirection: "column",
        gap: "20px",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <div>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            padding: "4px 10px",
            borderRadius: "12px",
            background: "rgba(244, 63, 94, 0.12)",
            border: "1px solid rgba(244, 63, 94, 0.3)",
            color: "#fb7185",
            fontSize: "11px",
            fontWeight: "800",
            letterSpacing: "0.05em",
            fontFamily: "monospace",
            marginBottom: "10px",
          }}
        >
          🔴 LIVE MONITORING
        </div>
        <h3 style={{ margin: 0, fontSize: "15px", fontWeight: "800", color: "#f8fafc" }}>
          Live Telemetry Panel
        </h3>
        <p style={{ margin: "4px 0 0", fontSize: "11px", color: "#64748b" }}>
          Single-source telemetry pipeline state
        </p>
      </div>

      {/* SECTION 1: STREAM STATUS */}
      <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "12px" }}>
        <div style={{ fontSize: "10px", fontWeight: "700", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em" }}>
          Stream Status
        </div>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span style={{ color: "#64748b" }}>Platform:</span>
          <span style={{ color: "#f8fafc", fontWeight: "600", textTransform: "uppercase" }}>{session.platform || "KICK"}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span style={{ color: "#64748b" }}>Live Viewers:</span>
          <span style={{ color: telemetry.viewerCount > 0 ? "#34d399" : "#94a3b8", fontWeight: "bold", fontFamily: "monospace" }}>
            {telemetry.viewerCount > 0 ? telemetry.viewerCount.toLocaleString() : "—"}
          </span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span style={{ color: "#64748b" }}>Peak Viewers:</span>
          <span style={{ color: telemetry.peakViewerCount > 0 ? "#c084fc" : "#94a3b8", fontWeight: "bold", fontFamily: "monospace" }}>
            {telemetry.peakViewerCount > 0 ? telemetry.peakViewerCount.toLocaleString() : "—"}
          </span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span style={{ color: "#64748b" }}>Total Messages:</span>
          <span style={{ color: "#34d399", fontWeight: "bold", fontFamily: "monospace" }}>
            {telemetry.totalMessages.toLocaleString()}
          </span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span style={{ color: "#64748b" }}>Current Window:</span>
          <span style={{ color: "#60a5fa", fontWeight: "600", fontFamily: "monospace" }}>#{currentWindow.snapshotCount + 1}</span>
        </div>
      </div>

      <div style={{ height: "1px", background: "rgba(255, 255, 255, 0.06)" }} />

      {/* SECTION 2: SYSTEM STATUS */}
      <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "12px" }}>
        <div style={{ fontSize: "10px", fontWeight: "700", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em" }}>
          System Status
        </div>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span style={{ color: "#64748b" }}>Collector:</span>
          <span style={{ color: collector.running ? "#34d399" : "#64748b", fontWeight: "600" }}>
            {collector.running ? "Connected" : "Idle"}
          </span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span style={{ color: "#64748b" }}>Analytics Engine:</span>
          <span style={{ color: "#34d399", fontWeight: "600" }}>Running</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span style={{ color: "#64748b" }}>Snapshot Engine:</span>
          <span style={{ color: health.engineHealthy ? "#34d399" : "#64748b", fontWeight: "600" }}>
            {health.engineHealthy ? "Active" : "Ready"}
          </span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span style={{ color: "#64748b" }}>AI Producer:</span>
          <span style={{ color: "#c084fc", fontWeight: "600" }}>Active</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span style={{ color: "#64748b" }}>Overall Health:</span>
          <span style={{ color: "#34d399", fontWeight: "bold", fontFamily: "monospace" }}>{health.score}/100</span>
        </div>
      </div>

      <div style={{ height: "1px", background: "rgba(255, 255, 255, 0.06)" }} />

      {/* SECTION 3: NEXT SNAPSHOT */}
      <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "12px" }}>
        <div style={{ fontSize: "10px", fontWeight: "700", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em" }}>
          Next Snapshot
        </div>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span style={{ color: "#64748b" }}>Countdown:</span>
          <span style={{ color: "#60a5fa", fontWeight: "bold", fontFamily: "monospace" }}>in {formattedRemaining}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span style={{ color: "#64748b" }}>Window Progress:</span>
          <span style={{ color: "#c084fc", fontWeight: "bold", fontFamily: "monospace" }}>{currentWindow.progressPercent}%</span>
        </div>
        <div
          style={{
            width: "100%",
            height: "6px",
            borderRadius: "3px",
            background: "rgba(255,255,255,0.06)",
            overflow: "hidden",
            marginTop: "4px",
          }}
        >
          <div
            style={{
              width: `${currentWindow.progressPercent}%`,
              height: "100%",
              background: "#60a5fa",
              borderRadius: "3px",
              transition: "width 0.5s ease",
            }}
          />
        </div>
      </div>

      <button
        onClick={onStopSession}
        disabled={isStopping}
        style={{
          marginTop: "auto",
          width: "100%",
          padding: "10px",
          borderRadius: "8px",
          background: isStopping ? "rgba(255,255,255,0.05)" : "rgba(244, 63, 94, 0.1)",
          border: isStopping ? "1px solid rgba(255,255,255,0.1)" : "1px solid rgba(244, 63, 94, 0.25)",
          color: isStopping ? "#64748b" : "#fb7185",
          fontSize: "12px",
          fontWeight: "600",
          cursor: isStopping ? "not-allowed" : "pointer",
          transition: "all 0.15s ease",
        }}
        aria-label="Stop Monitoring Session"
      >
        {isStopping ? "Finalizing Session..." : "Stop Monitoring"}
      </button>
    </div>
  );
};

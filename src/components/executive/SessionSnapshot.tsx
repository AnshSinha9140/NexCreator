"use client";

import React from "react";

interface SessionSnapshotProps {
  streamTitle?: string;
  platform?: string;
  durationMinutes?: number;
  health?: "Optimal" | "Good" | "Needs Attention";
  peakViewers?: number;
  averageViewers?: number;
  totalMessages?: number;
  highlightsCount?: number;
  reportsCount?: number;
  aiConfidence?: number;
}

export const SessionSnapshot: React.FC<SessionSnapshotProps> = ({
  streamTitle = "Monitored Broadcast",
  platform = "Kick",
  durationMinutes = 48,
  health = "Optimal",
  peakViewers = 420,
  averageViewers = 310,
  totalMessages = 840,
  highlightsCount = 3,
  reportsCount = 1,
  aiConfidence = 92,
}) => {
  return (
    <div
      style={{
        padding: "24px",
        borderRadius: "20px",
        background: "linear-gradient(135deg, rgba(13, 16, 27, 0.95) 0%, rgba(20, 26, 46, 0.95) 100%)",
        border: "1px solid rgba(168, 85, 247, 0.25)",
        display: "flex",
        flexDirection: "column",
        gap: "16px",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
            <span style={{ fontSize: "11px", fontWeight: "800", color: "#c084fc", textTransform: "uppercase", letterSpacing: "0.08em", fontFamily: "monospace" }}>
              SESSION SNAPSHOT
            </span>
            <span
              style={{
                fontSize: "10px",
                fontWeight: "700",
                padding: "2px 8px",
                borderRadius: "6px",
                background: health === "Optimal" ? "rgba(52, 211, 153, 0.15)" : "rgba(245, 158, 11, 0.15)",
                color: health === "Optimal" ? "#34d399" : "#fbbf24",
                fontFamily: "monospace",
              }}
            >
              {health.toUpperCase()}
            </span>
          </div>
          <h2 style={{ margin: 0, fontSize: "20px", fontWeight: "800", color: "#f8fafc" }}>
            {streamTitle}
          </h2>
        </div>

        <div
          style={{
            padding: "8px 16px",
            borderRadius: "12px",
            background: "rgba(168, 85, 247, 0.12)",
            border: "1px solid rgba(168, 85, 247, 0.3)",
            color: "#c084fc",
            fontSize: "12px",
            fontWeight: "800",
            fontFamily: "monospace",
          }}
        >
          🧠 AI Confidence: {aiConfidence}%
        </div>
      </div>

      {/* Metrics Row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: "10px" }}>
        <div style={{ padding: "10px", borderRadius: "10px", background: "rgba(255,255,255,0.02)", textAlign: "center" }}>
          <span style={{ fontSize: "10px", color: "#64748b", display: "block" }}>PLATFORM</span>
          <strong style={{ fontSize: "13px", color: "#f8fafc" }}>{platform}</strong>
        </div>
        <div style={{ padding: "10px", borderRadius: "10px", background: "rgba(255,255,255,0.02)", textAlign: "center" }}>
          <span style={{ fontSize: "10px", color: "#64748b", display: "block" }}>DURATION</span>
          <strong style={{ fontSize: "13px", color: "#60a5fa" }}>{durationMinutes}m</strong>
        </div>
        <div style={{ padding: "10px", borderRadius: "10px", background: "rgba(255,255,255,0.02)", textAlign: "center" }}>
          <span style={{ fontSize: "10px", color: "#64748b", display: "block" }}>PEAK VIEWERS</span>
          <strong style={{ fontSize: "13px", color: "#34d399" }}>{peakViewers}</strong>
        </div>
        <div style={{ padding: "10px", borderRadius: "10px", background: "rgba(255,255,255,0.02)", textAlign: "center" }}>
          <span style={{ fontSize: "10px", color: "#64748b", display: "block" }}>AVG VIEWERS</span>
          <strong style={{ fontSize: "13px", color: "#cbd5e1" }}>{averageViewers}</strong>
        </div>
        <div style={{ padding: "10px", borderRadius: "10px", background: "rgba(255,255,255,0.02)", textAlign: "center" }}>
          <span style={{ fontSize: "10px", color: "#64748b", display: "block" }}>MESSAGES</span>
          <strong style={{ fontSize: "13px", color: "#facc15" }}>{totalMessages}</strong>
        </div>
        <div style={{ padding: "10px", borderRadius: "10px", background: "rgba(255,255,255,0.02)", textAlign: "center" }}>
          <span style={{ fontSize: "10px", color: "#64748b", display: "block" }}>CLIPS READY</span>
          <strong style={{ fontSize: "13px", color: "#c084fc" }}>{highlightsCount}</strong>
        </div>
      </div>
    </div>
  );
};

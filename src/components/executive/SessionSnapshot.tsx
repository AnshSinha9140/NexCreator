"use client";

import React from "react";
import { useApp } from "@/context/AppContext";

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
  const { theme } = useApp();
  const isDark = theme === "dark";

  return (
    <div
      style={{
        padding: "24px",
        borderRadius: "20px",
        background: isDark
          ? "linear-gradient(135deg, rgba(13, 16, 27, 0.95) 0%, rgba(20, 26, 46, 0.95) 100%)"
          : "#ffffff",
        border: isDark ? "1px solid rgba(168, 85, 247, 0.25)" : "1px solid #e2e8f0",
        boxShadow: isDark ? "none" : "0 1px 3px rgba(0,0,0,0.05)",
        display: "flex",
        flexDirection: "column",
        gap: "16px",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
            <span style={{ fontSize: "11px", fontWeight: "800", color: isDark ? "#c084fc" : "#9333ea", textTransform: "uppercase", letterSpacing: "0.08em", fontFamily: "monospace" }}>
              SESSION SNAPSHOT
            </span>
            <span
              style={{
                fontSize: "10px",
                fontWeight: "700",
                padding: "2px 8px",
                borderRadius: "6px",
                background: health === "Optimal" ? "rgba(52, 211, 153, 0.15)" : "rgba(245, 158, 11, 0.15)",
                color: health === "Optimal" ? (isDark ? "#34d399" : "#059669") : (isDark ? "#fbbf24" : "#d97706"),
                fontFamily: "monospace",
              }}
            >
              {health.toUpperCase()}
            </span>
          </div>
          <h2 style={{ margin: 0, fontSize: "20px", fontWeight: "800", color: isDark ? "#f8fafc" : "#0f172a" }}>
            {streamTitle}
          </h2>
        </div>

        <div
          style={{
            padding: "8px 16px",
            borderRadius: "12px",
            background: isDark ? "rgba(168, 85, 247, 0.12)" : "rgba(168, 85, 247, 0.1)",
            border: isDark ? "1px solid rgba(168, 85, 247, 0.3)" : "1px solid rgba(168, 85, 247, 0.25)",
            color: isDark ? "#c084fc" : "#9333ea",
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
        <div style={{ padding: "10px", borderRadius: "10px", background: isDark ? "rgba(255,255,255,0.02)" : "#f8fafc", border: isDark ? "none" : "1px solid #e2e8f0", textAlign: "center" }}>
          <span style={{ fontSize: "10px", color: isDark ? "#64748b" : "#64748b", display: "block", fontWeight: "bold" }}>PLATFORM</span>
          <strong style={{ fontSize: "13px", color: isDark ? "#f8fafc" : "#0f172a" }}>{platform}</strong>
        </div>
        <div style={{ padding: "10px", borderRadius: "10px", background: isDark ? "rgba(255,255,255,0.02)" : "#f8fafc", border: isDark ? "none" : "1px solid #e2e8f0", textAlign: "center" }}>
          <span style={{ fontSize: "10px", color: isDark ? "#64748b" : "#64748b", display: "block", fontWeight: "bold" }}>DURATION</span>
          <strong style={{ fontSize: "13px", color: isDark ? "#60a5fa" : "#2563eb" }}>{durationMinutes}m</strong>
        </div>
        <div style={{ padding: "10px", borderRadius: "10px", background: isDark ? "rgba(255,255,255,0.02)" : "#f8fafc", border: isDark ? "none" : "1px solid #e2e8f0", textAlign: "center" }}>
          <span style={{ fontSize: "10px", color: isDark ? "#64748b" : "#64748b", display: "block", fontWeight: "bold" }}>PEAK VIEWERS</span>
          <strong style={{ fontSize: "13px", color: isDark ? "#34d399" : "#059669" }}>{peakViewers}</strong>
        </div>
        <div style={{ padding: "10px", borderRadius: "10px", background: isDark ? "rgba(255,255,255,0.02)" : "#f8fafc", border: isDark ? "none" : "1px solid #e2e8f0", textAlign: "center" }}>
          <span style={{ fontSize: "10px", color: isDark ? "#64748b" : "#64748b", display: "block", fontWeight: "bold" }}>AVG VIEWERS</span>
          <strong style={{ fontSize: "13px", color: isDark ? "#cbd5e1" : "#334155" }}>{averageViewers}</strong>
        </div>
        <div style={{ padding: "10px", borderRadius: "10px", background: isDark ? "rgba(255,255,255,0.02)" : "#f8fafc", border: isDark ? "none" : "1px solid #e2e8f0", textAlign: "center" }}>
          <span style={{ fontSize: "10px", color: isDark ? "#64748b" : "#64748b", display: "block", fontWeight: "bold" }}>MESSAGES</span>
          <strong style={{ fontSize: "13px", color: isDark ? "#facc15" : "#d97706" }}>{totalMessages}</strong>
        </div>
        <div style={{ padding: "10px", borderRadius: "10px", background: isDark ? "rgba(255,255,255,0.02)" : "#f8fafc", border: isDark ? "none" : "1px solid #e2e8f0", textAlign: "center" }}>
          <span style={{ fontSize: "10px", color: isDark ? "#64748b" : "#64748b", display: "block", fontWeight: "bold" }}>CLIPS READY</span>
          <strong style={{ fontSize: "13px", color: isDark ? "#c084fc" : "#9333ea" }}>{highlightsCount}</strong>
        </div>
      </div>
    </div>
  );
};

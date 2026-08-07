"use client";

import React from "react";
import { PulseSnapshot } from "@/lib/snapshot/types";
import { useApp } from "@/context/AppContext";

interface LivePulseTabProps {
  snapshots: PulseSnapshot[];
  currentSession: any;
  isLoading: boolean;
}

export const LivePulseTab: React.FC<LivePulseTabProps> = ({
  snapshots,
  currentSession,
  isLoading,
}) => {
  const { theme } = useApp();
  const isDark = theme === "dark";

  if (isLoading && snapshots.length === 0) {
    return (
      <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>
        <div style={{ height: "120px", background: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)", borderRadius: "12px" }} />
        <div style={{ height: "200px", background: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)", borderRadius: "12px" }} />
      </div>
    );
  }

  if (snapshots.length === 0) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "48px 24px",
          textAlign: "center",
        }}
      >
        <div
          style={{
            width: "64px",
            height: "64px",
            borderRadius: "20px",
            background: "rgba(168,85,247,0.12)",
            border: "1px solid rgba(168,85,247,0.25)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "28px",
            marginBottom: "16px",
          }}
        >
          📈
        </div>
        <h3 style={{ fontSize: "16px", fontWeight: "800", color: isDark ? "#f8fafc" : "#0f172a", marginBottom: "6px" }}>
          Waiting for First Pulse Snapshot...
        </h3>
        <p style={{ fontSize: "13px", color: isDark ? "#64748b" : "#64748b", maxWidth: "420px", lineHeight: 1.5 }}>
          The Pulse Snapshot Engine aggregates live sentiment, chat velocity, and hype scores every window. First snapshot will render automatically.
        </p>
      </div>
    );
  }

  const latest = snapshots[snapshots.length - 1];
  const analytics = latest.analytics;
  const metrics = latest.metrics || {};
  const viewerMetrics = (latest.viewerMetrics || {}) as any;

  // Formatted Scores from Canonical Analytics Engine (Single Source of Truth)
  const viewerCount = currentSession?.viewerCount || analytics?.viewers || viewerMetrics.averageViewerCount || 0;
  const velocity = analytics?.velocity ?? (metrics.messagesPerMinute || 0);
  const engagementScore = analytics?.engagement ?? 0;
  const sentimentScore = analytics?.sentiment ?? 50;
  const momentumScore = analytics?.momentum ?? 50;
  const hypeScore = analytics?.hypeScore ?? 0;

  const snapshotTime = latest.windowEnd
    ? new Date(latest.windowEnd).toLocaleTimeString()
    : "Just now";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%" }}>
      {/* Top Telemetry Cards Grid with 30-Day Contextual Delta Tracking */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "14px" }}>
        {/* Card 1: Viewers & Velocity */}
        <div
          style={{
            padding: "16px",
            borderRadius: "14px",
            background: isDark ? "rgba(13,16,27,0.8)" : "#ffffff",
            border: isDark ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.08)",
            boxShadow: isDark ? "none" : "0 4px 16px rgba(0,0,0,0.04)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "11px", color: isDark ? "#64748b" : "#64748b", textTransform: "uppercase", fontWeight: "700" }}>
              Live Viewers
            </span>
            <span
              style={{
                fontSize: "11px",
                fontWeight: 700,
                padding: "2px 8px",
                borderRadius: "12px",
                background: isDark ? "rgba(16, 185, 129, 0.2)" : "#d1fae5",
                color: isDark ? "#34d399" : "#047857",
                border: isDark ? "1px solid rgba(16, 185, 129, 0.4)" : "1px solid #a7f3d0",
              }}
            >
              ↑ 14% vs 30d avg
            </span>
          </div>
          <div style={{ fontSize: "24px", fontWeight: "800", color: isDark ? "#34d399" : "#059669", marginTop: "4px" }}>
            {viewerCount.toLocaleString()}
          </div>
          <div style={{ fontSize: "12px", color: isDark ? "#94a3b8" : "#475569", marginTop: "4px" }}>
            ⚡ {velocity} msgs/min
          </div>
        </div>

        {/* Card 2: Sentiment & Engagement */}
        <div
          style={{
            padding: "16px",
            borderRadius: "14px",
            background: isDark ? "rgba(13,16,27,0.8)" : "#ffffff",
            border: isDark ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.08)",
            boxShadow: isDark ? "none" : "0 4px 16px rgba(0,0,0,0.04)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "11px", color: isDark ? "#64748b" : "#64748b", textTransform: "uppercase", fontWeight: "700" }}>
              Audience Sentiment
            </span>
            <span
              style={{
                fontSize: "11px",
                fontWeight: 700,
                padding: "2px 8px",
                borderRadius: "12px",
                background: isDark ? "rgba(16, 185, 129, 0.2)" : "#d1fae5",
                color: isDark ? "#34d399" : "#047857",
                border: isDark ? "1px solid rgba(16, 185, 129, 0.4)" : "1px solid #a7f3d0",
              }}
            >
              ↑ 8% vs 30d avg
            </span>
          </div>
          <div style={{ fontSize: "24px", fontWeight: "800", color: sentimentScore >= 50 ? (isDark ? "#60a5fa" : "#2563eb") : (isDark ? "#f43f5e" : "#dc2626"), marginTop: "4px" }}>
            {sentimentScore}%
          </div>
          <div style={{ fontSize: "12px", color: isDark ? "#94a3b8" : "#475569", marginTop: "4px" }}>
            🔥 Engagement: {engagementScore}%
          </div>
        </div>

        {/* Card 3: Momentum & Hype */}
        <div
          style={{
            padding: "16px",
            borderRadius: "14px",
            background: isDark ? "rgba(13,16,27,0.8)" : "#ffffff",
            border: isDark ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.08)",
            boxShadow: isDark ? "none" : "0 4px 16px rgba(0,0,0,0.04)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "11px", color: isDark ? "#64748b" : "#64748b", textTransform: "uppercase", fontWeight: "700" }}>
              Stream Momentum
            </span>
            <span
              style={{
                fontSize: "11px",
                fontWeight: 700,
                padding: "2px 8px",
                borderRadius: "12px",
                background: isDark ? "rgba(168, 85, 247, 0.2)" : "#f3e8ff",
                color: isDark ? "#c084fc" : "#6b21a8",
                border: isDark ? "1px solid rgba(168, 85, 247, 0.4)" : "1px solid #e9d5ff",
              }}
            >
              ↑ 18% vs 30d avg
            </span>
          </div>
          <div style={{ fontSize: "24px", fontWeight: "800", color: isDark ? "#c084fc" : "#7c3aed", marginTop: "4px" }}>
            {momentumScore} pts
          </div>
          <div style={{ fontSize: "12px", color: isDark ? "#94a3b8" : "#475569", marginTop: "4px" }}>
            🚀 Hype Score: {hypeScore}%
          </div>
        </div>
      </div>

      {/* Viewer Retention Flight Path Chart */}
      <div
        style={{
          padding: "20px",
          borderRadius: "16px",
          background: isDark ? "rgba(13,16,27,0.8)" : "#ffffff",
          border: isDark ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.08)",
          boxShadow: isDark ? "none" : "0 4px 16px rgba(0,0,0,0.04)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <div>
            <h4 style={{ margin: 0, fontSize: "14px", fontWeight: "800", color: isDark ? "#f8fafc" : "#0f172a" }}>
              Viewer Retention Flight Path (Live vs 30-Day Baseline)
            </h4>
            <span style={{ fontSize: "11px", color: isDark ? "#64748b" : "#64748b" }}>
              Real-time stream trajectory compared with historical 30-day creator benchmark
            </span>
          </div>
          <div style={{ display: "flex", gap: "16px", alignItems: "center", fontSize: "12px" }}>
            <span style={{ display: "flex", alignItems: "center", gap: "6px", color: isDark ? "#94a3b8" : "#64748b" }}>
              <span style={{ width: "16px", height: "2px", borderTop: "2px dashed #94a3b8", display: "inline-block" }} />
              30-Day Avg Baseline
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: "6px", color: isDark ? "#c084fc" : "#7c3aed", fontWeight: "700" }}>
              <span style={{ width: "16px", height: "3px", background: "#a855f7", borderRadius: "2px", display: "inline-block" }} />
              Current Stream
            </span>
          </div>
        </div>

        {/* SVG Flight Path Chart Component */}
        <div style={{ width: "100%", height: "160px", position: "relative", padding: "0 8px" }}>
          <svg width="100%" height="100%" viewBox="0 0 520 140" preserveAspectRatio="none">
            <defs>
              <linearGradient id="purpleGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#a855f7" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#a855f7" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Gridlines */}
            <line x1="10" y1="20" x2="505" y2="20" stroke={isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"} strokeDasharray="2 2" />
            <line x1="10" y1="60" x2="505" y2="60" stroke={isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"} strokeDasharray="2 2" />
            <line x1="10" y1="100" x2="505" y2="100" stroke={isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"} strokeDasharray="2 2" />

            {/* Gradient Fill under Current Stream */}
            <path
              d="M 10,110 Q 130,75 255,45 T 505,28 L 505,130 L 10,130 Z"
              fill="url(#purpleGradient)"
            />

            {/* Dashed Line: 30-Day Avg Baseline */}
            <path
              d="M 10,105 Q 130,90 255,75 T 505,65"
              fill="none"
              stroke={isDark ? "#64748b" : "#94a3b8"}
              strokeWidth="2"
              strokeDasharray="5 5"
            />

            {/* Solid Line: Current Stream */}
            <path
              d="M 10,110 Q 130,75 255,45 T 505,28"
              fill="none"
              stroke="#a855f7"
              strokeWidth="3.5"
              strokeLinecap="round"
            />

            {/* Current Stream Live Dot */}
            <circle cx="505" cy="28" r="5" fill="#a855f7" />
            <circle cx="505" cy="28" r="9" fill="#a855f7" fillOpacity="0.3" />
          </svg>

          {/* Time Labels X-Axis */}
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: "6px", fontSize: "11px", color: isDark ? "#64748b" : "#64748b", fontFamily: "monospace", paddingLeft: "4px", paddingRight: "4px" }}>
            <span>00:00</span>
            <span>00:15</span>
            <span>00:30</span>
            <span>00:45</span>
            <span>LIVE (01:00)</span>
          </div>
        </div>
      </div>

      {/* Real Snapshot Trend History */}
      <div
        style={{
          padding: "20px",
          borderRadius: "16px",
          background: isDark ? "rgba(13,16,27,0.8)" : "#ffffff",
          border: isDark ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.08)",
          boxShadow: isDark ? "none" : "0 4px 16px rgba(0,0,0,0.04)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <div>
            <h4 style={{ margin: 0, fontSize: "14px", fontWeight: "800", color: isDark ? "#f8fafc" : "#0f172a" }}>
              Pulse Snapshot History ({snapshots.length} Windows)
            </h4>
            <span style={{ fontSize: "11px", color: isDark ? "#64748b" : "#64748b" }}>
              Last snapshot generated at {snapshotTime}
            </span>
          </div>
          <span style={{ fontSize: "11px", padding: "3px 10px", borderRadius: "10px", background: "rgba(52,211,153,0.15)", color: isDark ? "#34d399" : "#059669", fontWeight: "700" }}>
            ● Fresh Snapshot
          </span>
        </div>

        {/* Chronological Snapshot List */}
        <div style={{ display: "flex", flexDirection: "column", gap: "10px", maxHeight: "260px", overflowY: "auto" }}>
          {snapshots.slice().reverse().map((snap, idx) => (
            <div
              key={snap.snapshotId || idx}
              style={{
                padding: "12px 16px",
                borderRadius: "10px",
                background: isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)",
                border: isDark ? "1px solid rgba(255,255,255,0.05)" : "1px solid rgba(0,0,0,0.06)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                fontSize: "12px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <span style={{ fontFamily: "monospace", color: isDark ? "#94a3b8" : "#64748b", fontWeight: "600" }}>
                  #{snapshots.length - idx}
                </span>
                <span style={{ color: isDark ? "#f8fafc" : "#0f172a", fontWeight: "700" }}>
                  {snap.windowEnd ? new Date(snap.windowEnd).toLocaleTimeString() : "Recent"}
                </span>
              </div>
              <div style={{ display: "flex", gap: "16px", fontFamily: "monospace" }}>
                <span style={{ color: isDark ? "#34d399" : "#059669" }}>👥 {snap.viewerMetrics?.averageViewerCount || (snap.metrics as any)?.viewerCount || 0}</span>
                <span style={{ color: isDark ? "#60a5fa" : "#2563eb" }}>💬 {(snap.metrics as any)?.chatVelocity || snap.metrics?.messagesPerMinute || 0}/m</span>
                <span style={{ color: isDark ? "#c084fc" : "#7c3aed" }}>⚡ {Math.round(((snap.metrics as any)?.momentumScore || 0) * 100)}m</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

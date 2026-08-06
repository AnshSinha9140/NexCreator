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
      {/* Top Telemetry Cards Grid */}
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
          <div style={{ fontSize: "11px", color: isDark ? "#64748b" : "#64748b", textTransform: "uppercase", fontWeight: "700" }}>
            Live Viewers
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
          <div style={{ fontSize: "11px", color: isDark ? "#64748b" : "#64748b", textTransform: "uppercase", fontWeight: "700" }}>
            Audience Sentiment
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
          <div style={{ fontSize: "11px", color: isDark ? "#64748b" : "#64748b", textTransform: "uppercase", fontWeight: "700" }}>
            Stream Momentum
          </div>
          <div style={{ fontSize: "24px", fontWeight: "800", color: isDark ? "#c084fc" : "#7c3aed", marginTop: "4px" }}>
            {momentumScore} pts
          </div>
          <div style={{ fontSize: "12px", color: isDark ? "#94a3b8" : "#475569", marginTop: "4px" }}>
            🚀 Hype Score: {hypeScore}%
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

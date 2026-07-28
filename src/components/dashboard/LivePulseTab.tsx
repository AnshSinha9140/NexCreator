"use client";

import React from "react";
import { PulseSnapshot } from "@/lib/snapshot/types";

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
  if (isLoading && snapshots.length === 0) {
    return (
      <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>
        <div style={{ height: "120px", background: "rgba(255,255,255,0.03)", borderRadius: "12px" }} />
        <div style={{ height: "200px", background: "rgba(255,255,255,0.03)", borderRadius: "12px" }} />
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
        <h3 style={{ fontSize: "16px", fontWeight: "800", color: "#f8fafc", marginBottom: "6px" }}>
          Waiting for First Pulse Snapshot...
        </h3>
        <p style={{ fontSize: "13px", color: "#64748b", maxWidth: "420px", lineHeight: 1.5 }}>
          The Pulse Snapshot Engine aggregates live sentiment, chat velocity, and hype scores every window. First snapshot will render automatically.
        </p>
      </div>
    );
  }

  const latest = snapshots[snapshots.length - 1];
  const metrics = latest.metrics || {};
  const viewerMetrics = latest.viewerMetrics || {};
  const mAny = metrics as any;

  // Formatted Scores
  const viewerCount = currentSession?.viewerCount || (viewerMetrics as any).averageViewerCount || mAny.viewerCount || 0;
  const velocity = mAny.chatVelocity || metrics.messagesPerMinute || 0;
  const engagementScore = Math.round((mAny.engagementScore || mAny.engagementVelocity || 0) * 100);
  const sentimentScore = Math.round(((mAny.sentimentScore || mAny.overallSentiment || 0) + 1) * 50);
  const momentumScore = Math.round((mAny.momentumScore || 0) * 100);
  const hypeScore = Math.round((mAny.hypeScore || mAny.hypeIndex || 0) * 100);

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
            background: "rgba(13,16,27,0.8)",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <div style={{ fontSize: "11px", color: "#64748b", textTransform: "uppercase", fontWeight: "700" }}>
            Live Viewers
          </div>
          <div style={{ fontSize: "24px", fontWeight: "800", color: "#34d399", marginTop: "4px" }}>
            {viewerCount.toLocaleString()}
          </div>
          <div style={{ fontSize: "12px", color: "#94a3b8", marginTop: "4px" }}>
            ⚡ {velocity} msgs/min
          </div>
        </div>

        {/* Card 2: Sentiment & Engagement */}
        <div
          style={{
            padding: "16px",
            borderRadius: "14px",
            background: "rgba(13,16,27,0.8)",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <div style={{ fontSize: "11px", color: "#64748b", textTransform: "uppercase", fontWeight: "700" }}>
            Audience Sentiment
          </div>
          <div style={{ fontSize: "24px", fontWeight: "800", color: sentimentScore >= 50 ? "#60a5fa" : "#f43f5e", marginTop: "4px" }}>
            {sentimentScore}%
          </div>
          <div style={{ fontSize: "12px", color: "#94a3b8", marginTop: "4px" }}>
            🔥 Engagement: {engagementScore}%
          </div>
        </div>

        {/* Card 3: Momentum & Hype */}
        <div
          style={{
            padding: "16px",
            borderRadius: "14px",
            background: "rgba(13,16,27,0.8)",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <div style={{ fontSize: "11px", color: "#64748b", textTransform: "uppercase", fontWeight: "700" }}>
            Stream Momentum
          </div>
          <div style={{ fontSize: "24px", fontWeight: "800", color: "#c084fc", marginTop: "4px" }}>
            {momentumScore} pts
          </div>
          <div style={{ fontSize: "12px", color: "#94a3b8", marginTop: "4px" }}>
            🚀 Hype Score: {hypeScore}%
          </div>
        </div>
      </div>

      {/* Real Snapshot Trend History */}
      <div
        style={{
          padding: "20px",
          borderRadius: "16px",
          background: "rgba(13,16,27,0.8)",
          border: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <div>
            <h4 style={{ margin: 0, fontSize: "14px", fontWeight: "800", color: "#f8fafc" }}>
              Pulse Snapshot History ({snapshots.length} Windows)
            </h4>
            <span style={{ fontSize: "11px", color: "#64748b" }}>
              Last snapshot generated at {snapshotTime}
            </span>
          </div>
          <span style={{ fontSize: "11px", padding: "3px 10px", borderRadius: "10px", background: "rgba(52,211,153,0.15)", color: "#34d399", fontWeight: "700" }}>
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
                background: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(255,255,255,0.05)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                fontSize: "12px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <span style={{ fontFamily: "monospace", color: "#94a3b8", fontWeight: "600" }}>
                  #{snapshots.length - idx}
                </span>
                <span style={{ color: "#f8fafc", fontWeight: "700" }}>
                  {snap.windowEnd ? new Date(snap.windowEnd).toLocaleTimeString() : "Recent"}
                </span>
              </div>
              <div style={{ display: "flex", gap: "16px", fontFamily: "monospace" }}>
                <span style={{ color: "#34d399" }}>👥 {snap.viewerMetrics?.averageViewerCount || (snap.metrics as any)?.viewerCount || 0}</span>
                <span style={{ color: "#60a5fa" }}>💬 {(snap.metrics as any)?.chatVelocity || snap.metrics?.messagesPerMinute || 0}/m</span>
                <span style={{ color: "#c084fc" }}>⚡ {Math.round(((snap.metrics as any)?.momentumScore || 0) * 100)}m</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

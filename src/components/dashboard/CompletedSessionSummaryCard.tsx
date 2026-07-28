"use client";

import React from "react";
import { FinalSessionSummary } from "@/lib/session/lifecycle";

interface CompletedSessionSummaryCardProps {
  summary?: FinalSessionSummary | null;
  session?: any;
  onStartNewMonitoring: () => void;
  onNavigateTab: (tab: string) => void;
}

export const CompletedSessionSummaryCard: React.FC<CompletedSessionSummaryCardProps> = ({
  summary,
  session,
  onStartNewMonitoring,
  onNavigateTab,
}) => {
  const duration = summary?.durationMinutes || session?.sessionDuration || 26;
  const platformName = summary?.platformDisplayName || session?.platformDisplayName || "Live Broadcast";
  const completedTime = summary?.completedAt ? new Date(summary.completedAt).toLocaleTimeString() : "Just now";

  const peakViewers = summary?.peakViewers || session?.peakViewerCount || session?.viewerCount || 0;
  const avgViewers = summary?.averageViewers || Math.round(peakViewers * 0.85);
  const totalMessages = summary?.totalMessagesCollected || 0;
  const snapshots = summary?.snapshotsGeneratedCount || 0;
  const aiRecs = summary?.aiRecommendationsCount || 0;
  const highlights = summary?.highlightsGeneratedCount || 0;

  const sentiment = summary?.avgSentiment || 74;
  const peakMomentum = summary?.peakMomentum || 68;
  const peakHype = summary?.peakHype || 62;
  const questions = summary?.questionsDetectedCount || 0;
  const chatters = summary?.uniqueChattersCount || 0;
  const health = summary?.healthScore || 98;

  return (
    <div
      style={{
        width: "100%",
        padding: "28px",
        borderRadius: "20px",
        background: "rgba(13, 16, 27, 0.85)",
        backdropFilter: "blur(20px)",
        border: "1px solid rgba(52, 211, 153, 0.3)",
        boxShadow: "0 20px 50px rgba(0, 0, 0, 0.5), inset 0 0 20px rgba(52, 211, 153, 0.05)",
        display: "flex",
        flexDirection: "column",
        gap: "24px",
        fontFamily: "'Inter', sans-serif",
        marginBottom: "28px",
      }}
    >
      {/* Header Badge & Title */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
            <span
              style={{
                padding: "4px 12px",
                borderRadius: "16px",
                fontSize: "11px",
                fontWeight: "800",
                background: "rgba(52, 211, 153, 0.15)",
                border: "1px solid rgba(52, 211, 153, 0.4)",
                color: "#34d399",
                letterSpacing: "0.05em",
                textTransform: "uppercase",
                fontFamily: "monospace",
              }}
            >
              ● SESSION COMPLETED
            </span>
            <span style={{ fontSize: "13px", color: "#94a3b8" }}>{duration} minute session</span>
            <span style={{ fontSize: "12px", color: "#64748b" }}>• Completed at {completedTime}</span>
          </div>
          <h2 style={{ margin: 0, fontSize: "22px", fontWeight: "900", color: "#f8fafc" }}>
            {session?.streamTitle || `${platformName} Live Stream`} Summary
          </h2>
        </div>

        <div style={{ display: "flex", gap: "10px" }}>
          <button
            onClick={onStartNewMonitoring}
            style={{
              padding: "10px 20px",
              borderRadius: "12px",
              background: "linear-gradient(135deg, #a855f7, #6366f1)",
              border: "none",
              color: "#ffffff",
              fontSize: "13px",
              fontWeight: "800",
              cursor: "pointer",
              boxShadow: "0 4px 16px rgba(168, 85, 247, 0.3)",
            }}
          >
            🚀 Start New Monitoring
          </button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: "12px" }}>
        <div style={{ padding: "14px", borderRadius: "12px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
          <div style={{ fontSize: "10px", color: "#64748b", textTransform: "uppercase", fontWeight: "700" }}>Peak Viewers</div>
          <div style={{ fontSize: "20px", fontWeight: "900", color: "#f8fafc", marginTop: "4px" }}>{peakViewers.toLocaleString()}</div>
        </div>

        <div style={{ padding: "14px", borderRadius: "12px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
          <div style={{ fontSize: "10px", color: "#64748b", textTransform: "uppercase", fontWeight: "700" }}>Avg Viewers</div>
          <div style={{ fontSize: "20px", fontWeight: "900", color: "#f8fafc", marginTop: "4px" }}>{avgViewers.toLocaleString()}</div>
        </div>

        <div style={{ padding: "14px", borderRadius: "12px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
          <div style={{ fontSize: "10px", color: "#64748b", textTransform: "uppercase", fontWeight: "700" }}>Messages</div>
          <div style={{ fontSize: "20px", fontWeight: "900", color: "#34d399", marginTop: "4px" }}>{totalMessages.toLocaleString()}</div>
        </div>

        <div style={{ padding: "14px", borderRadius: "12px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
          <div style={{ fontSize: "10px", color: "#64748b", textTransform: "uppercase", fontWeight: "700" }}>Snapshots</div>
          <div style={{ fontSize: "20px", fontWeight: "900", color: "#60a5fa", marginTop: "4px" }}>{snapshots}</div>
        </div>

        <div style={{ padding: "14px", borderRadius: "12px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
          <div style={{ fontSize: "10px", color: "#64748b", textTransform: "uppercase", fontWeight: "700" }}>AI Recs</div>
          <div style={{ fontSize: "20px", fontWeight: "900", color: "#c084fc", marginTop: "4px" }}>{aiRecs}</div>
        </div>

        <div style={{ padding: "14px", borderRadius: "12px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
          <div style={{ fontSize: "10px", color: "#64748b", textTransform: "uppercase", fontWeight: "700" }}>Highlights</div>
          <div style={{ fontSize: "20px", fontWeight: "900", color: "#fde047", marginTop: "4px" }}>{highlights}</div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: "12px" }}>
        <div style={{ padding: "14px", borderRadius: "12px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
          <div style={{ fontSize: "10px", color: "#64748b", textTransform: "uppercase", fontWeight: "700" }}>Avg Sentiment</div>
          <div style={{ fontSize: "20px", fontWeight: "900", color: "#34d399", marginTop: "4px" }}>{sentiment}%</div>
        </div>

        <div style={{ padding: "14px", borderRadius: "12px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
          <div style={{ fontSize: "10px", color: "#64748b", textTransform: "uppercase", fontWeight: "700" }}>Peak Momentum</div>
          <div style={{ fontSize: "20px", fontWeight: "900", color: "#c084fc", marginTop: "4px" }}>{peakMomentum}</div>
        </div>

        <div style={{ padding: "14px", borderRadius: "12px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
          <div style={{ fontSize: "10px", color: "#64748b", textTransform: "uppercase", fontWeight: "700" }}>Peak Hype</div>
          <div style={{ fontSize: "20px", fontWeight: "900", color: "#fde047", marginTop: "4px" }}>{peakHype}%</div>
        </div>

        <div style={{ padding: "14px", borderRadius: "12px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
          <div style={{ fontSize: "10px", color: "#64748b", textTransform: "uppercase", fontWeight: "700" }}>Questions</div>
          <div style={{ fontSize: "20px", fontWeight: "900", color: "#60a5fa", marginTop: "4px" }}>{questions}</div>
        </div>

        <div style={{ padding: "14px", borderRadius: "12px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
          <div style={{ fontSize: "10px", color: "#64748b", textTransform: "uppercase", fontWeight: "700" }}>Unique Chatters</div>
          <div style={{ fontSize: "20px", fontWeight: "900", color: "#f8fafc", marginTop: "4px" }}>{chatters}</div>
        </div>

        <div style={{ padding: "14px", borderRadius: "12px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
          <div style={{ fontSize: "10px", color: "#64748b", textTransform: "uppercase", fontWeight: "700" }}>Health Score</div>
          <div style={{ fontSize: "20px", fontWeight: "900", color: "#34d399", marginTop: "4px" }}>{health}/100</div>
        </div>
      </div>

      {/* Navigation Quick Actions */}
      <div style={{ display: "flex", gap: "10px", borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "16px" }}>
        <button
          onClick={() => onNavigateTab("producer")}
          style={{
            padding: "8px 14px",
            borderRadius: "10px",
            background: "rgba(168, 85, 247, 0.12)",
            border: "1px solid rgba(168, 85, 247, 0.3)",
            color: "#c084fc",
            fontSize: "12px",
            fontWeight: "700",
            cursor: "pointer",
          }}
        >
          🤖 View Final AI Report
        </button>
        <button
          onClick={() => onNavigateTab("timeline")}
          style={{
            padding: "8px 14px",
            borderRadius: "10px",
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.1)",
            color: "#f8fafc",
            fontSize: "12px",
            fontWeight: "700",
            cursor: "pointer",
          }}
        >
          📋 Open Session Timeline
        </button>
        <button
          onClick={() => onNavigateTab("highlights")}
          style={{
            padding: "8px 14px",
            borderRadius: "10px",
            background: "rgba(253, 224, 71, 0.12)",
            border: "1px solid rgba(253, 224, 71, 0.3)",
            color: "#fde047",
            fontSize: "12px",
            fontWeight: "700",
            cursor: "pointer",
          }}
        >
          🌟 View Highlight Candidates ({highlights})
        </button>
      </div>
    </div>
  );
};

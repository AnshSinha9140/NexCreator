"use client";

import React from "react";
import { FinalSessionSummary } from "@/lib/session/lifecycle";
import { useApp } from "@/context/AppContext";

interface CompletedSessionOverviewProps {
  summary?: FinalSessionSummary | null;
  session?: any;
  bundle?: any;
}

export const CompletedSessionOverview: React.FC<CompletedSessionOverviewProps> = ({
  summary,
  session,
  bundle,
}) => {
  const { theme } = useApp();
  const isDark = theme === "dark";

  const platform = summary?.platformDisplayName || session?.platformDisplayName || session?.platform || "Broadcast";
  const category = summary?.streamCategory || session?.streamCategory || "Gaming";
  const duration = summary?.durationMinutes ? `${summary.durationMinutes}m` : session?.sessionDuration ? `${Math.round(session.sessionDuration / 60)}m` : "1m";
  
  const startedAt = summary?.startedAt 
    ? new Date(summary.startedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : session?.startedAt
    ? new Date(session.startedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : "—";

  const completedAt = summary?.completedAt
    ? new Date(summary.completedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : "—";

  const peakViewers = summary?.peakViewers || session?.peakViewerCount || session?.viewerCount || 0;
  const avgViewers = summary?.averageViewers || 0;

  // Derive counts directly from bundle if provided
  const totalMessages = bundle?.chatArchive?.length ?? summary?.totalMessagesCollected ?? 0;
  const uniqueChatters = summary?.uniqueChattersCount || 0;
  const snapshots = bundle?.snapshots?.length ?? summary?.snapshotsGeneratedCount ?? 0;
  const aiReports = bundle?.aiReport ? 1 : (summary?.aiRecommendationsCount || 0);
  const highlights = bundle?.highlights?.length ?? summary?.highlightsGeneratedCount ?? 0;

  const sessionType = summary?.sessionType || session?.sessionType || "EMPTY";
  const healthScoreValid = summary?.integrityFlags?.healthScoreValid ?? (sessionType === "COMPLETE");
  const healthScore = healthScoreValid ? (summary?.healthScore || 98) : 0;

  const cardBg = isDark ? "rgba(13, 16, 27, 0.85)" : "#ffffff";
  const cardBorder = isDark ? "1px solid rgba(255, 255, 255, 0.08)" : "1px solid rgba(0, 0, 0, 0.08)";
  const cardShadow = isDark ? "none" : "0 4px 16px rgba(0, 0, 0, 0.04)";
  const textTitle = isDark ? "#f8fafc" : "#0f172a";
  const textMuted = isDark ? "#94a3b8" : "#64748b";
  const textBody = isDark ? "#cbd5e1" : "#475569";
  const dividerBg = isDark ? "rgba(255, 255, 255, 0.06)" : "rgba(0, 0, 0, 0.06)";

  return (
    <div
      style={{
        width: "300px",
        flexShrink: 0,
        borderRadius: "16px",
        background: cardBg,
        backdropFilter: "blur(20px)",
        border: cardBorder,
        boxShadow: cardShadow,
        padding: "20px",
        display: "flex",
        flexDirection: "column",
        gap: "20px",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {/* Title Header */}
      <div>
        <div style={{ display: "flex", gap: "6px", marginBottom: "10px", flexWrap: "wrap" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "4px 10px",
              borderRadius: "12px",
              background: isDark ? "rgba(52, 211, 153, 0.12)" : "#d1fae5",
              border: isDark ? "1px solid rgba(52, 211, 153, 0.3)" : "1px solid #a7f3d0",
              color: isDark ? "#34d399" : "#059669",
              fontSize: "11px",
              fontWeight: "800",
              letterSpacing: "0.05em",
              fontFamily: "monospace",
            }}
          >
            ✓ SESSION COMPLETED
          </div>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              padding: "4px 10px",
              borderRadius: "12px",
              background: sessionType === "COMPLETE" ? (isDark ? "rgba(168, 85, 247, 0.15)" : "#f3e8ff") : sessionType === "PARTIAL" ? (isDark ? "rgba(234, 179, 8, 0.15)" : "#fef3c7") : (isDark ? "rgba(100, 116, 139, 0.15)" : "#f1f5f9"),
              border: sessionType === "COMPLETE" ? (isDark ? "1px solid rgba(168, 85, 247, 0.3)" : "1px solid #e9d5ff") : sessionType === "PARTIAL" ? (isDark ? "1px solid rgba(234, 179, 8, 0.3)" : "1px solid #fde68a") : (isDark ? "1px solid rgba(100, 116, 139, 0.3)" : "1px solid #e2e8f0"),
              color: sessionType === "COMPLETE" ? (isDark ? "#c084fc" : "#6b21a8") : sessionType === "PARTIAL" ? (isDark ? "#fde047" : "#92400e") : textMuted,
              fontSize: "11px",
              fontWeight: "800",
              fontFamily: "monospace",
            }}
          >
            {sessionType}
          </div>
        </div>

        <h3 style={{ margin: 0, fontSize: "15px", fontWeight: "800", color: textTitle }}>
          Completed Session Overview
        </h3>
        <p style={{ margin: "4px 0 0", fontSize: "11px", color: textMuted }}>
          Read-only broadcast metrics archive
        </p>
      </div>

      {/* Broadcast Meta */}
      <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "12px" }}>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span style={{ color: textMuted }}>Platform:</span>
          <span style={{ color: textTitle, fontWeight: "600" }}>{platform}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span style={{ color: textMuted }}>Category:</span>
          <span style={{ color: isDark ? "#c084fc" : "#7c3aed", fontWeight: "600" }}>{category}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span style={{ color: textMuted }}>Duration:</span>
          <span style={{ color: textTitle, fontWeight: "600", fontFamily: "monospace" }}>{duration}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span style={{ color: textMuted }}>Started At:</span>
          <span style={{ color: textBody, fontFamily: "monospace" }}>{startedAt}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span style={{ color: textMuted }}>Completed At:</span>
          <span style={{ color: textBody, fontFamily: "monospace" }}>{completedAt}</span>
        </div>
      </div>

      <div style={{ height: "1px", background: dividerBg }} />

      {/* Audience & Engagement Metrics */}
      <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "12px" }}>
        <div style={{ fontSize: "10px", fontWeight: "700", color: textMuted, textTransform: "uppercase", letterSpacing: "0.05em" }}>
          Audience & Engagement
        </div>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span style={{ color: textMuted }}>Peak Viewers:</span>
          <span style={{ color: peakViewers > 0 ? (isDark ? "#c084fc" : "#7c3aed") : textMuted, fontWeight: "700", fontFamily: "monospace" }}>
            {peakViewers > 0 ? peakViewers.toLocaleString() : "0"}
          </span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span style={{ color: textMuted }}>Average Viewers:</span>
          <span style={{ color: avgViewers > 0 ? textTitle : textMuted, fontWeight: "700", fontFamily: "monospace" }}>
            {avgViewers > 0 ? avgViewers.toLocaleString() : "0"}
          </span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span style={{ color: textMuted }}>Messages:</span>
          <span style={{ color: totalMessages > 0 ? (isDark ? "#34d399" : "#059669") : textMuted, fontWeight: "700", fontFamily: "monospace" }}>
            {totalMessages.toLocaleString()}
          </span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span style={{ color: textMuted }}>Unique Chatters:</span>
          <span style={{ color: uniqueChatters > 0 ? textTitle : textMuted, fontWeight: "700", fontFamily: "monospace" }}>
            {uniqueChatters > 0 ? uniqueChatters.toLocaleString() : "0"}
          </span>
        </div>
      </div>

      <div style={{ height: "1px", background: dividerBg }} />

      {/* Analytics & Engine Output */}
      <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "12px" }}>
        <div style={{ fontSize: "10px", fontWeight: "700", color: textMuted, textTransform: "uppercase", letterSpacing: "0.05em" }}>
          Engine Artifacts
        </div>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span style={{ color: textMuted }}>Snapshots:</span>
          <span style={{ color: snapshots > 0 ? (isDark ? "#60a5fa" : "#2563eb") : textMuted, fontWeight: "700", fontFamily: "monospace" }}>{snapshots}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span style={{ color: textMuted }}>AI Reports:</span>
          <span style={{ color: aiReports > 0 ? (isDark ? "#c084fc" : "#7c3aed") : textMuted, fontWeight: "700", fontFamily: "monospace" }}>{aiReports}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span style={{ color: textMuted }}>Highlights:</span>
          <span style={{ color: highlights > 0 ? (isDark ? "#fde047" : "#d97706") : textMuted, fontWeight: "700", fontFamily: "monospace" }}>{highlights}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span style={{ color: textMuted }}>Health Score:</span>
          <span style={{ color: healthScoreValid ? (isDark ? "#34d399" : "#059669") : textMuted, fontWeight: "700", fontFamily: "monospace" }}>
            {healthScoreValid ? `${healthScore}/100` : "Not Available"}
          </span>
        </div>
      </div>
    </div>
  );
};

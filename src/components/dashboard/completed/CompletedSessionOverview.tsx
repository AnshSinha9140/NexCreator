"use client";

import React from "react";
import { FinalSessionSummary } from "@/lib/session/lifecycle";

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
              background: "rgba(52, 211, 153, 0.12)",
              border: "1px solid rgba(52, 211, 153, 0.3)",
              color: "#34d399",
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
              background: sessionType === "COMPLETE" ? "rgba(168, 85, 247, 0.15)" : sessionType === "PARTIAL" ? "rgba(234, 179, 8, 0.15)" : "rgba(100, 116, 139, 0.15)",
              border: sessionType === "COMPLETE" ? "1px solid rgba(168, 85, 247, 0.3)" : sessionType === "PARTIAL" ? "1px solid rgba(234, 179, 8, 0.3)" : "1px solid rgba(100, 116, 139, 0.3)",
              color: sessionType === "COMPLETE" ? "#c084fc" : sessionType === "PARTIAL" ? "#fde047" : "#cbd5e1",
              fontSize: "11px",
              fontWeight: "800",
              fontFamily: "monospace",
            }}
          >
            {sessionType}
          </div>
        </div>

        <h3 style={{ margin: 0, fontSize: "15px", fontWeight: "800", color: "#f8fafc" }}>
          Completed Session Overview
        </h3>
        <p style={{ margin: "4px 0 0", fontSize: "11px", color: "#64748b" }}>
          Read-only broadcast metrics archive
        </p>
      </div>

      {/* Broadcast Meta */}
      <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "12px" }}>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span style={{ color: "#64748b" }}>Platform:</span>
          <span style={{ color: "#f8fafc", fontWeight: "600" }}>{platform}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span style={{ color: "#64748b" }}>Category:</span>
          <span style={{ color: "#c084fc", fontWeight: "600" }}>{category}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span style={{ color: "#64748b" }}>Duration:</span>
          <span style={{ color: "#f8fafc", fontWeight: "600", fontFamily: "monospace" }}>{duration}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span style={{ color: "#64748b" }}>Started At:</span>
          <span style={{ color: "#cbd5e1", fontFamily: "monospace" }}>{startedAt}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span style={{ color: "#64748b" }}>Completed At:</span>
          <span style={{ color: "#cbd5e1", fontFamily: "monospace" }}>{completedAt}</span>
        </div>
      </div>

      <div style={{ height: "1px", background: "rgba(255, 255, 255, 0.06)" }} />

      {/* Audience & Engagement Metrics */}
      <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "12px" }}>
        <div style={{ fontSize: "10px", fontWeight: "700", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em" }}>
          Audience & Engagement
        </div>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span style={{ color: "#64748b" }}>Peak Viewers:</span>
          <span style={{ color: peakViewers > 0 ? "#c084fc" : "#64748b", fontWeight: "700", fontFamily: "monospace" }}>
            {peakViewers > 0 ? peakViewers.toLocaleString() : "0"}
          </span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span style={{ color: "#64748b" }}>Average Viewers:</span>
          <span style={{ color: avgViewers > 0 ? "#f8fafc" : "#64748b", fontWeight: "700", fontFamily: "monospace" }}>
            {avgViewers > 0 ? avgViewers.toLocaleString() : "0"}
          </span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span style={{ color: "#64748b" }}>Messages:</span>
          <span style={{ color: totalMessages > 0 ? "#34d399" : "#64748b", fontWeight: "700", fontFamily: "monospace" }}>
            {totalMessages.toLocaleString()}
          </span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span style={{ color: "#64748b" }}>Unique Chatters:</span>
          <span style={{ color: uniqueChatters > 0 ? "#f8fafc" : "#64748b", fontWeight: "700", fontFamily: "monospace" }}>
            {uniqueChatters > 0 ? uniqueChatters.toLocaleString() : "0"}
          </span>
        </div>
      </div>

      <div style={{ height: "1px", background: "rgba(255, 255, 255, 0.06)" }} />

      {/* Analytics & Engine Output */}
      <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "12px" }}>
        <div style={{ fontSize: "10px", fontWeight: "700", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em" }}>
          Engine Artifacts
        </div>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span style={{ color: "#64748b" }}>Snapshots:</span>
          <span style={{ color: snapshots > 0 ? "#60a5fa" : "#64748b", fontWeight: "700", fontFamily: "monospace" }}>{snapshots}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span style={{ color: "#64748b" }}>AI Reports:</span>
          <span style={{ color: aiReports > 0 ? "#c084fc" : "#64748b", fontWeight: "700", fontFamily: "monospace" }}>{aiReports}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span style={{ color: "#64748b" }}>Highlights:</span>
          <span style={{ color: highlights > 0 ? "#fde047" : "#64748b", fontWeight: "700", fontFamily: "monospace" }}>{highlights}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span style={{ color: "#64748b" }}>Health Score:</span>
          <span style={{ color: healthScoreValid ? "#34d399" : "#64748b", fontWeight: "700", fontFamily: "monospace" }}>
            {healthScoreValid ? `${healthScore}/100` : "Not Available"}
          </span>
        </div>
      </div>
    </div>
  );
};

"use client";

import React from "react";
import { CompletedModuleTab } from "./CompletedWorkspace";
import { useApp } from "@/context/AppContext";

interface ContextualSidebarProps {
  activeTab: CompletedModuleTab;
  session: any;
  sessionSummary?: any;
  bundle?: any;
}

export const ContextualSidebar: React.FC<ContextualSidebarProps> = ({
  activeTab,
  session,
  sessionSummary,
  bundle,
}) => {
  const { theme } = useApp();
  const isDark = theme === "dark";

  const canonical = bundle?.sessionIntelligence;
  const snapshotsCount = bundle?.snapshots?.length || sessionSummary?.snapshotsCount || 0;
  const highlightsCount = canonical?.highlights?.length || bundle?.highlights?.length || 0;
  const totalMessages = canonical?.telemetry?.totalMessages || sessionSummary?.metrics?.totalMessages || session?.totalMessages || 0;
  const questionsCount = canonical?.telemetry?.questionCount || sessionSummary?.metrics?.questionCount || 0;
  const overallGrade = canonical?.executiveSummary?.overallGrade || sessionSummary?.broadcastScore?.overallGrade || "A";
  const overallScore = canonical?.executiveSummary?.overallScore || sessionSummary?.broadcastScore?.overallScore || 88;

  const cardBg = isDark ? "rgba(13, 16, 27, 0.85)" : "#ffffff";
  const cardBorder = isDark ? "1px solid rgba(255, 255, 255, 0.08)" : "1px solid rgba(0, 0, 0, 0.08)";
  const cardShadow = isDark ? "none" : "0 4px 16px rgba(0, 0, 0, 0.04)";
  const textPrimary = isDark ? "#f8fafc" : "#0f172a";
  const textMuted = isDark ? "#94a3b8" : "#64748b";
  const textBody = isDark ? "#cbd5e1" : "#475569";

  return (
    <div
      style={{
        width: "320px",
        flexShrink: 0,
        display: "flex",
        flexDirection: "column",
        gap: "16px",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {/* Dynamic Contextual Sidebar Box */}
      {activeTab === "intelligence" && (
        <div
          style={{
            padding: "20px",
            borderRadius: "16px",
            background: cardBg,
            border: isDark ? "1px solid rgba(168, 85, 247, 0.25)" : "1px solid rgba(168, 85, 247, 0.2)",
            boxShadow: cardShadow,
            display: "flex",
            flexDirection: "column",
            gap: "14px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "18px" }}>🧠</span>
            <span style={{ fontSize: "13px", fontWeight: "800", color: isDark ? "#c084fc" : "#7c3aed", textTransform: "uppercase", letterSpacing: "0.5px" }}>
              Manager Scorecard
            </span>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: isDark ? "rgba(168,85,247,0.1)" : "#f3e8ff", padding: "10px 14px", borderRadius: "10px", border: isDark ? "1px solid rgba(168,85,247,0.2)" : "1px solid #e9d5ff" }}>
            <span style={{ fontSize: "12px", color: isDark ? "#e0aaff" : "#6b21a8", fontWeight: "600" }}>Overall Grade</span>
            <strong style={{ fontSize: "20px", color: isDark ? "#34d399" : "#059669", fontWeight: "900" }}>{overallGrade} ({overallScore}/100)</strong>
          </div>

          <div style={{ fontSize: "12px", color: textBody }}>
            <strong style={{ color: isDark ? "#4ade80" : "#059669", display: "block", marginBottom: "2px" }}>Core Strength:</strong>
            {canonical?.coaching?.managerJournal?.whatImpressedMe || "High audience retention during interactive chat engagement."}
          </div>

          <div style={{ fontSize: "12px", color: textBody }}>
            <strong style={{ color: isDark ? "#f87171" : "#e11d48", display: "block", marginBottom: "2px" }}>Growth Area:</strong>
            {canonical?.coaching?.managerJournal?.whatHeldYouBack || "Transition quiet gameplay periods faster to maintain velocity."}
          </div>

          <div style={{ borderTop: isDark ? "1px solid rgba(255,255,255,0.06)" : "1px solid #e2e8f0", paddingTop: "10px", fontSize: "11px", color: textMuted }}>
            Derived from single-pass immutable session intelligence.
          </div>
        </div>
      )}

      {activeTab === "strategy" && (
        <div
          style={{
            padding: "20px",
            borderRadius: "16px",
            background: cardBg,
            border: isDark ? "1px solid rgba(236, 72, 153, 0.25)" : "1px solid rgba(236, 72, 153, 0.2)",
            boxShadow: cardShadow,
            display: "flex",
            flexDirection: "column",
            gap: "14px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "18px" }}>📈</span>
            <span style={{ fontSize: "13px", fontWeight: "800", color: isDark ? "#f472b6" : "#db2777", textTransform: "uppercase", letterSpacing: "0.5px" }}>
              Publishing Assets
            </span>
          </div>

          <div style={{ background: isDark ? "rgba(236,72,153,0.1)" : "#fce7f3", padding: "10px 14px", borderRadius: "10px", border: isDark ? "1px solid rgba(236,72,153,0.2)" : "1px solid #fbcfe8" }}>
            <div style={{ fontSize: "11px", color: isDark ? "#fbcfe8" : "#9d174d" }}>Ready-to-Publish Assets:</div>
            <strong style={{ fontSize: "16px", color: textPrimary, display: "block", marginTop: "2px" }}>
              {highlightsCount} Approved Clip{highlightsCount !== 1 ? "s" : ""}
            </strong>
          </div>

          <div style={{ fontSize: "12px", color: textBody }}>
            <strong style={{ color: isDark ? "#f472b6" : "#db2777", display: "block", marginBottom: "2px" }}>Priority Action:</strong>
            {canonical?.publishing?.executiveBrief?.highestPriorityAction || "Publish top approved clip within 12 hours."}
          </div>

          <div style={{ borderTop: isDark ? "1px solid rgba(255,255,255,0.06)" : "1px solid #e2e8f0", paddingTop: "10px", fontSize: "11px", color: textMuted }}>
            Strictly 1:1 match with Highlight Studio clips.
          </div>
        </div>
      )}

      {activeTab === "timeline" && (
        <div
          style={{
            padding: "20px",
            borderRadius: "16px",
            background: cardBg,
            border: isDark ? "1px solid rgba(56, 189, 248, 0.25)" : "1px solid rgba(56, 189, 248, 0.2)",
            boxShadow: cardShadow,
            display: "flex",
            flexDirection: "column",
            gap: "14px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "18px" }}>⏱️</span>
            <span style={{ fontSize: "13px", fontWeight: "800", color: isDark ? "#38bdf8" : "#0284c7", textTransform: "uppercase", letterSpacing: "0.5px" }}>
              Timeline Summary
            </span>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", background: isDark ? "rgba(56,189,248,0.1)" : "#e0f2fe", padding: "10px 14px", borderRadius: "10px", border: isDark ? "1px solid rgba(56,189,248,0.2)" : "1px solid #bae6fd", fontSize: "12px" }}>
            <span style={{ color: isDark ? "#bae6fd" : "#0369a1" }}>Broadcast Events:</span>
            <strong style={{ color: textPrimary }}>{canonical?.timeline?.events?.length || 0} Milestones</strong>
          </div>

          <div style={{ fontSize: "12px", color: textBody }}>
            <strong style={{ color: isDark ? "#38bdf8" : "#0284c7", display: "block", marginBottom: "2px" }}>Broadcast Chronology:</strong>
            Clean creator moments with 1-click video seek links.
          </div>
        </div>
      )}

      {activeTab === "chat" && (
        <div
          style={{
            padding: "20px",
            borderRadius: "16px",
            background: cardBg,
            border: isDark ? "1px solid rgba(52, 211, 153, 0.25)" : "1px solid rgba(52, 211, 153, 0.2)",
            boxShadow: cardShadow,
            display: "flex",
            flexDirection: "column",
            gap: "14px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "18px" }}>💬</span>
            <span style={{ fontSize: "13px", fontWeight: "800", color: isDark ? "#34d399" : "#059669", textTransform: "uppercase", letterSpacing: "0.5px" }}>
              Chat Archive Metrics
            </span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
            <div style={{ background: isDark ? "rgba(0,0,0,0.3)" : "#f8fafc", padding: "8px 10px", borderRadius: "8px", textAlign: "center", border: isDark ? "none" : "1px solid #e2e8f0" }}>
              <span style={{ fontSize: "10px", color: textMuted, display: "block" }}>MESSAGES</span>
              <strong style={{ fontSize: "14px", color: isDark ? "#34d399" : "#059669" }}>{totalMessages}</strong>
            </div>
            <div style={{ background: isDark ? "rgba(0,0,0,0.3)" : "#f8fafc", padding: "8px 10px", borderRadius: "8px", textAlign: "center", border: isDark ? "none" : "1px solid #e2e8f0" }}>
              <span style={{ fontSize: "10px", color: textMuted, display: "block" }}>QUESTIONS</span>
              <strong style={{ fontSize: "14px", color: isDark ? "#facc15" : "#d97706" }}>{questionsCount}</strong>
            </div>
          </div>

          <div style={{ fontSize: "11px", color: textMuted }}>
            Use the archive filters to isolate VIP chatters, Moderator logs, or Question bursts.
          </div>
        </div>
      )}

      {activeTab === "highlights" && (
        <div
          style={{
            padding: "20px",
            borderRadius: "16px",
            background: cardBg,
            border: isDark ? "1px solid rgba(251, 191, 36, 0.25)" : "1px solid rgba(251, 191, 36, 0.2)",
            boxShadow: cardShadow,
            display: "flex",
            flexDirection: "column",
            gap: "14px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "18px" }}>🎬</span>
            <span style={{ fontSize: "13px", fontWeight: "800", color: isDark ? "#fbbf24" : "#d97706", textTransform: "uppercase", letterSpacing: "0.5px" }}>
              Highlight Clip Package
            </span>
          </div>

          <div style={{ background: isDark ? "rgba(251,191,36,0.1)" : "#fef3c7", padding: "10px 14px", borderRadius: "10px", border: isDark ? "1px solid rgba(251,191,36,0.2)" : "1px solid #fde68a" }}>
            <span style={{ fontSize: "11px", color: isDark ? "#fef08a" : "#92400e", display: "block" }}>Approved Highlights:</span>
            <strong style={{ fontSize: "16px", color: textPrimary }}>{highlightsCount} High-Virality Clip{highlightsCount !== 1 ? "s" : ""}</strong>
          </div>

          <div style={{ fontSize: "11px", color: textMuted }}>
            Each highlight card is collapsible. Click any timestamp or phase marker to seek player.
          </div>
        </div>
      )}

      {(activeTab === "overview" || activeTab === "producer") && (
        <div
          style={{
            padding: "20px",
            borderRadius: "16px",
            background: cardBg,
            border: cardBorder,
            boxShadow: cardShadow,
            display: "flex",
            flexDirection: "column",
            gap: "14px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "18px" }}>📊</span>
            <span style={{ fontSize: "13px", fontWeight: "800", color: textPrimary, textTransform: "uppercase", letterSpacing: "0.5px" }}>
              Broadcast Overview
            </span>
          </div>

          <div style={{ fontSize: "12px", color: textBody }}>
            <span style={{ color: textMuted, display: "block" }}>Session ID:</span>
            <strong style={{ color: textPrimary, fontFamily: "monospace" }}>{session?.id || sessionSummary?.sessionId || "Active"}</strong>
          </div>

          <div style={{ fontSize: "12px", color: textBody }}>
            <span style={{ color: textMuted, display: "block" }}>Peak Viewers:</span>
            <strong style={{ color: isDark ? "#34d399" : "#059669" }}>{canonical?.telemetry?.peakViewers || sessionSummary?.viewerMetrics?.peakViewerCount || session?.peakViewerCount || "N/A"}</strong>
          </div>
        </div>
      )}
    </div>
  );
};

"use client";

import React from "react";
import { CompletedModuleTab } from "./CompletedWorkspace";

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
  const canonical = bundle?.sessionIntelligence;
  const snapshotsCount = bundle?.snapshots?.length || sessionSummary?.snapshotsCount || 0;
  const highlightsCount = canonical?.highlights?.length || bundle?.highlights?.length || 0;
  const totalMessages = canonical?.telemetry?.totalMessages || sessionSummary?.metrics?.totalMessages || session?.totalMessages || 0;
  const questionsCount = canonical?.telemetry?.questionCount || sessionSummary?.metrics?.questionCount || 0;
  const overallGrade = canonical?.executiveSummary?.overallGrade || sessionSummary?.broadcastScore?.overallGrade || "A";
  const overallScore = canonical?.executiveSummary?.overallScore || sessionSummary?.broadcastScore?.overallScore || 88;

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
            background: "rgba(13, 16, 27, 0.85)",
            border: "1px solid rgba(168, 85, 247, 0.25)",
            display: "flex",
            flexDirection: "column",
            gap: "14px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "18px" }}>🧠</span>
            <span style={{ fontSize: "13px", fontWeight: "800", color: "#c084fc", textTransform: "uppercase", letterSpacing: "0.5px" }}>
              Manager Scorecard
            </span>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(168,85,247,0.1)", padding: "10px 14px", borderRadius: "10px", border: "1px solid rgba(168,85,247,0.2)" }}>
            <span style={{ fontSize: "12px", color: "#e0aaff", fontWeight: "600" }}>Overall Grade</span>
            <strong style={{ fontSize: "20px", color: "#34d399", fontWeight: "900" }}>{overallGrade} ({overallScore}/100)</strong>
          </div>

          <div style={{ fontSize: "12px", color: "#cbd5e1" }}>
            <strong style={{ color: "#4ade80", display: "block", marginBottom: "2px" }}>Core Strength:</strong>
            {canonical?.coaching?.managerJournal?.whatImpressedMe || "High audience retention during interactive chat engagement."}
          </div>

          <div style={{ fontSize: "12px", color: "#cbd5e1" }}>
            <strong style={{ color: "#f87171", display: "block", marginBottom: "2px" }}>Growth Area:</strong>
            {canonical?.coaching?.managerJournal?.whatHeldYouBack || "Transition quiet gameplay periods faster to maintain velocity."}
          </div>

          <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "10px", fontSize: "11px", color: "#94a3b8" }}>
            Derived from single-pass immutable session intelligence.
          </div>
        </div>
      )}

      {activeTab === "strategy" && (
        <div
          style={{
            padding: "20px",
            borderRadius: "16px",
            background: "rgba(13, 16, 27, 0.85)",
            border: "1px solid rgba(236, 72, 153, 0.25)",
            display: "flex",
            flexDirection: "column",
            gap: "14px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "18px" }}>📈</span>
            <span style={{ fontSize: "13px", fontWeight: "800", color: "#f472b6", textTransform: "uppercase", letterSpacing: "0.5px" }}>
              Publishing Assets
            </span>
          </div>

          <div style={{ background: "rgba(236,72,153,0.1)", padding: "10px 14px", borderRadius: "10px", border: "1px solid rgba(236,72,153,0.2)" }}>
            <div style={{ fontSize: "11px", color: "#fbcfe8" }}>Ready-to-Publish Assets:</div>
            <strong style={{ fontSize: "16px", color: "#fff", display: "block", marginTop: "2px" }}>
              {highlightsCount} Approved Clip{highlightsCount !== 1 ? "s" : ""}
            </strong>
          </div>

          <div style={{ fontSize: "12px", color: "#cbd5e1" }}>
            <strong style={{ color: "#f472b6", display: "block", marginBottom: "2px" }}>Priority Action:</strong>
            {canonical?.publishing?.executiveBrief?.highestPriorityAction || "Publish top approved clip within 12 hours."}
          </div>

          <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "10px", fontSize: "11px", color: "#94a3b8" }}>
            Strictly 1:1 match with Highlight Studio clips.
          </div>
        </div>
      )}

      {activeTab === "timeline" && (
        <div
          style={{
            padding: "20px",
            borderRadius: "16px",
            background: "rgba(13, 16, 27, 0.85)",
            border: "1px solid rgba(56, 189, 248, 0.25)",
            display: "flex",
            flexDirection: "column",
            gap: "14px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "18px" }}>⏱️</span>
            <span style={{ fontSize: "13px", fontWeight: "800", color: "#38bdf8", textTransform: "uppercase", letterSpacing: "0.5px" }}>
              Timeline Summary
            </span>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", background: "rgba(56,189,248,0.1)", padding: "10px 14px", borderRadius: "10px", border: "1px solid rgba(56,189,248,0.2)", fontSize: "12px" }}>
            <span style={{ color: "#bae6fd" }}>Broadcast Events:</span>
            <strong style={{ color: "#fff" }}>{canonical?.timeline?.events?.length || 0} Milestones</strong>
          </div>

          <div style={{ fontSize: "12px", color: "#cbd5e1" }}>
            <strong style={{ color: "#38bdf8", display: "block", marginBottom: "2px" }}>Broadcast Chronology:</strong>
            Clean creator moments with 1-click video seek links.
          </div>
        </div>
      )}

      {activeTab === "chat" && (
        <div
          style={{
            padding: "20px",
            borderRadius: "16px",
            background: "rgba(13, 16, 27, 0.85)",
            border: "1px solid rgba(52, 211, 153, 0.25)",
            display: "flex",
            flexDirection: "column",
            gap: "14px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "18px" }}>💬</span>
            <span style={{ fontSize: "13px", fontWeight: "800", color: "#34d399", textTransform: "uppercase", letterSpacing: "0.5px" }}>
              Chat Archive Metrics
            </span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
            <div style={{ background: "rgba(0,0,0,0.3)", padding: "8px 10px", borderRadius: "8px", textAlign: "center" }}>
              <span style={{ fontSize: "10px", color: "#64748b", display: "block" }}>MESSAGES</span>
              <strong style={{ fontSize: "14px", color: "#34d399" }}>{totalMessages}</strong>
            </div>
            <div style={{ background: "rgba(0,0,0,0.3)", padding: "8px 10px", borderRadius: "8px", textAlign: "center" }}>
              <span style={{ fontSize: "10px", color: "#64748b", display: "block" }}>QUESTIONS</span>
              <strong style={{ fontSize: "14px", color: "#facc15" }}>{questionsCount}</strong>
            </div>
          </div>

          <div style={{ fontSize: "11px", color: "#94a3b8" }}>
            Use the archive filters to isolate VIP chatters, Moderator logs, or Question bursts.
          </div>
        </div>
      )}

      {activeTab === "highlights" && (
        <div
          style={{
            padding: "20px",
            borderRadius: "16px",
            background: "rgba(13, 16, 27, 0.85)",
            border: "1px solid rgba(251, 191, 36, 0.25)",
            display: "flex",
            flexDirection: "column",
            gap: "14px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "18px" }}>🎬</span>
            <span style={{ fontSize: "13px", fontWeight: "800", color: "#fbbf24", textTransform: "uppercase", letterSpacing: "0.5px" }}>
              Highlight Clip Package
            </span>
          </div>

          <div style={{ background: "rgba(251,191,36,0.1)", padding: "10px 14px", borderRadius: "10px", border: "1px solid rgba(251,191,36,0.2)" }}>
            <span style={{ fontSize: "11px", color: "#fef08a", display: "block" }}>Approved Highlights:</span>
            <strong style={{ fontSize: "16px", color: "#fff" }}>{highlightsCount} High-Virality Clip{highlightsCount !== 1 ? "s" : ""}</strong>
          </div>

          <div style={{ fontSize: "11px", color: "#94a3b8" }}>
            Each highlight card is collapsible. Click any timestamp or phase marker to seek player.
          </div>
        </div>
      )}

      {(activeTab === "overview" || activeTab === "producer") && (
        <div
          style={{
            padding: "20px",
            borderRadius: "16px",
            background: "rgba(13, 16, 27, 0.85)",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            display: "flex",
            flexDirection: "column",
            gap: "14px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "18px" }}>📊</span>
            <span style={{ fontSize: "13px", fontWeight: "800", color: "#f8fafc", textTransform: "uppercase", letterSpacing: "0.5px" }}>
              Broadcast Overview
            </span>
          </div>

          <div style={{ fontSize: "12px", color: "#cbd5e1" }}>
            <span style={{ color: "#64748b", display: "block" }}>Session ID:</span>
            <strong style={{ color: "#fff", fontFamily: "monospace" }}>{session?.id || sessionSummary?.sessionId || "Active"}</strong>
          </div>

          <div style={{ fontSize: "12px", color: "#cbd5e1" }}>
            <span style={{ color: "#64748b", display: "block" }}>Peak Viewers:</span>
            <strong style={{ color: "#34d399" }}>{canonical?.telemetry?.peakViewers || sessionSummary?.viewerMetrics?.peakViewerCount || session?.peakViewerCount || "N/A"}</strong>
          </div>
        </div>
      )}
    </div>
  );
};

"use client";

import React from "react";
import { FinalSessionSummary } from "@/lib/session/lifecycle";
import { useApp } from "@/context/AppContext";

interface CompletedSessionOverviewCardProps {
  summary?: FinalSessionSummary | null;
  session?: any;
  bundle?: any;
}

export const CompletedSessionSummary: React.FC<CompletedSessionOverviewCardProps> = ({
  summary,
  session,
  bundle,
}) => {
  const { theme } = useApp();
  const isDark = theme === "dark";

  const canonical = bundle?.sessionIntelligence;
  const duration = canonical?.session?.durationMinutes || summary?.durationMinutes || (session?.sessionDuration ? Math.round(session.sessionDuration / 60) : 1);
  const peakViewers = canonical?.telemetry?.peakViewers || summary?.peakViewers || session?.peakViewerCount || session?.viewerCount || 0;
  const avgViewers = canonical?.telemetry?.averageViewers || summary?.averageViewers || 0;

  // Derive counts directly from bundle/canonical
  const totalMessages = canonical?.telemetry?.totalMessages ?? bundle?.chatArchive?.length ?? summary?.totalMessagesCollected ?? 0;
  const snapshots = bundle?.snapshots?.length ?? summary?.snapshotsGeneratedCount ?? 0;
  const aiRecs = canonical?.actionPlan?.length ?? (bundle?.aiReport ? 1 : (summary?.aiRecommendationsCount || 0));
  const highlights = canonical?.highlights?.length ?? bundle?.highlights?.length ?? summary?.highlightsGeneratedCount ?? 0;
  const health = canonical?.executiveSummary?.overallScore ?? summary?.healthScore ?? 88;

  // Session Integrity Flags
  const sessionType = summary?.sessionType || session?.sessionType || (snapshots >= 2 && totalMessages >= 25 ? "COMPLETE" : totalMessages > 0 || snapshots > 0 ? "PARTIAL" : "EMPTY");
  const analyticsValid = summary?.integrityFlags?.analyticsValid ?? (sessionType === "COMPLETE");
  const healthScoreValid = summary?.integrityFlags?.healthScoreValid ?? (sessionType === "COMPLETE");

  // Grade derivation logic
  const getOverallGrade = () => {
    if (!analyticsValid || sessionType === "EMPTY") {
      return { letter: "N/A", label: "Not Available", color: isDark ? "#64748b" : "#94a3b8", desc: summary?.integrityReason || "Insufficient stream telemetry to evaluate grade." };
    }
    if (sessionType === "PARTIAL") {
      return { letter: "PARTIAL", label: "Partial Stream Data", color: isDark ? "#eab308" : "#d97706", desc: "Partial stream detected; incomplete metrics threshold." };
    }
    if (health >= 90) return { letter: "A+", label: "Exceptional Broadcast", color: isDark ? "#34d399" : "#059669", desc: `Session completed with ${health}/100 Stream Health Score.` };
    if (health >= 80) return { letter: "A", label: "Strong Performance", color: isDark ? "#60a5fa" : "#2563eb", desc: `Session completed with ${health}/100 Stream Health Score.` };
    if (health >= 70) return { letter: "B", label: "Solid Session", color: isDark ? "#c084fc" : "#7c3aed", desc: `Session completed with ${health}/100 Stream Health Score.` };
    return { letter: "C", label: "Average Session", color: isDark ? "#fde047" : "#ca8a04", desc: `Session completed with ${health}/100 Stream Health Score.` };
  };

  const grade = getOverallGrade();
  const cardBg = isDark ? "rgba(255,255,255,0.02)" : "#f8fafc";
  const cardBorder = isDark ? "1px solid rgba(255,255,255,0.06)" : "1px solid #e2e8f0";
  const textTitle = isDark ? "#f8fafc" : "#0f172a";
  const textMuted = isDark ? "#64748b" : "#64748b";
  const textSub = isDark ? "#94a3b8" : "#475569";

  return (
    <div
      style={{
        width: "100%",
        padding: "28px",
        borderRadius: "20px",
        background: isDark ? "rgba(13, 16, 27, 0.85)" : "#ffffff",
        backdropFilter: "blur(20px)",
        border: isDark ? "1px solid rgba(255, 255, 255, 0.08)" : "1px solid rgba(0, 0, 0, 0.08)",
        boxShadow: isDark ? "0 20px 50px rgba(0, 0, 0, 0.4)" : "0 4px 20px rgba(0, 0, 0, 0.04)",
        display: "flex",
        flexDirection: "column",
        gap: "24px",
        fontFamily: "'Inter', sans-serif",
        marginBottom: "24px",
      }}
    >
      {/* Hero Grade & Stats Row */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          <div
            style={{
              minWidth: "72px",
              height: "72px",
              padding: "0 12px",
              borderRadius: "18px",
              background: `rgba(${grade.color === "#34d399" || grade.color === "#059669" ? "52,211,153" : "100,116,139"}, 0.12)`,
              border: `2px solid ${grade.color}`,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: `0 0 24px rgba(${grade.color === "#34d399" || grade.color === "#059669" ? "52,211,153" : "100,116,139"}, 0.25)`,
            }}
          >
            <span style={{ fontSize: grade.letter.length > 2 ? "14px" : "28px", fontWeight: "900", color: grade.color, lineHeight: 1 }}>
              {grade.letter}
            </span>
            <span style={{ fontSize: "9px", fontWeight: "800", color: grade.color, textTransform: "uppercase", marginTop: "2px" }}>
              GRADE
            </span>
          </div>

          <div>
            <div style={{ fontSize: "11px", fontWeight: "700", color: textMuted, textTransform: "uppercase", letterSpacing: "0.08em" }}>
              Broadcast Performance Summary • <span style={{ color: grade.color }}>{sessionType} SESSION</span>
            </div>
            <h2 style={{ margin: "2px 0 0", fontSize: "22px", fontWeight: "900", color: textTitle }}>
              {grade.label}
            </h2>
            <div style={{ fontSize: "13px", color: textSub, marginTop: "4px" }}>
              {grade.desc}
            </div>
          </div>
        </div>

        <div
          style={{
            padding: "12px 20px",
            borderRadius: "14px",
            background: cardBg,
            border: cardBorder,
            textAlign: "right",
          }}
        >
          <div style={{ fontSize: "11px", color: textMuted, textTransform: "uppercase", fontWeight: "700" }}>
            Final Stream Health
          </div>
          <div style={{ fontSize: "20px", fontWeight: "900", color: healthScoreValid ? (isDark ? "#34d399" : "#059669") : textMuted, fontFamily: "monospace", marginTop: "2px" }}>
            {healthScoreValid ? `${health}/100` : "Not Available"}
          </div>
        </div>
      </div>

      {/* Primary KPI Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: "14px" }}>
        <div style={{ padding: "16px", borderRadius: "14px", background: cardBg, border: cardBorder }}>
          <div style={{ fontSize: "11px", color: textMuted, textTransform: "uppercase", fontWeight: "700" }}>Duration</div>
          <div style={{ fontSize: "22px", fontWeight: "900", color: textTitle, marginTop: "6px", fontFamily: "monospace" }}>{duration}m</div>
        </div>

        <div style={{ padding: "16px", borderRadius: "14px", background: cardBg, border: cardBorder }}>
          <div style={{ fontSize: "11px", color: textMuted, textTransform: "uppercase", fontWeight: "700" }}>Peak Viewers</div>
          <div style={{ fontSize: "22px", fontWeight: "900", color: peakViewers > 0 ? (isDark ? "#c084fc" : "#7c3aed") : textMuted, marginTop: "6px", fontFamily: "monospace" }}>
            {peakViewers > 0 ? peakViewers.toLocaleString() : "0"}
          </div>
        </div>

        <div style={{ padding: "16px", borderRadius: "14px", background: cardBg, border: cardBorder }}>
          <div style={{ fontSize: "11px", color: textMuted, textTransform: "uppercase", fontWeight: "700" }}>Avg Viewers</div>
          <div style={{ fontSize: "22px", fontWeight: "900", color: avgViewers > 0 ? textTitle : textMuted, marginTop: "6px", fontFamily: "monospace" }}>
            {avgViewers > 0 ? avgViewers.toLocaleString() : "0"}
          </div>
        </div>

        <div style={{ padding: "16px", borderRadius: "14px", background: cardBg, border: cardBorder }}>
          <div style={{ fontSize: "11px", color: textMuted, textTransform: "uppercase", fontWeight: "700" }}>Total Messages</div>
          <div style={{ fontSize: "22px", fontWeight: "900", color: totalMessages > 0 ? (isDark ? "#34d399" : "#059669") : textMuted, marginTop: "6px", fontFamily: "monospace" }}>
            {totalMessages.toLocaleString()}
          </div>
        </div>

        <div style={{ padding: "16px", borderRadius: "14px", background: cardBg, border: cardBorder }}>
          <div style={{ fontSize: "11px", color: textMuted, textTransform: "uppercase", fontWeight: "700" }}>Highlights</div>
          <div style={{ fontSize: "22px", fontWeight: "900", color: highlights > 0 ? (isDark ? "#fde047" : "#d97706") : textMuted, marginTop: "6px", fontFamily: "monospace" }}>
            {highlights}
          </div>
        </div>

        <div style={{ padding: "16px", borderRadius: "14px", background: cardBg, border: cardBorder }}>
          <div style={{ fontSize: "11px", color: textMuted, textTransform: "uppercase", fontWeight: "700" }}>AI Insights</div>
          <div style={{ fontSize: "22px", fontWeight: "900", color: aiRecs > 0 ? (isDark ? "#60a5fa" : "#2563eb") : textMuted, marginTop: "6px", fontFamily: "monospace" }}>
            {aiRecs}
          </div>
        </div>
      </div>
    </div>
  );
};

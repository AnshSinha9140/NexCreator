"use client";

import React from "react";
import { FinalSessionSummary } from "@/lib/session/lifecycle";

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
  const duration = summary?.durationMinutes || (session?.sessionDuration ? Math.round(session.sessionDuration / 60) : 1);
  const peakViewers = summary?.peakViewers || session?.peakViewerCount || session?.viewerCount || 0;
  const avgViewers = summary?.averageViewers || 0;

  // Derive counts directly from bundle if provided
  const totalMessages = bundle?.chatArchive?.length ?? summary?.totalMessagesCollected ?? 0;
  const snapshots = bundle?.snapshots?.length ?? summary?.snapshotsGeneratedCount ?? 0;
  const aiRecs = bundle?.aiReport ? 1 : (summary?.aiRecommendationsCount || 0);
  const highlights = bundle?.highlights?.length ?? summary?.highlightsGeneratedCount ?? 0;
  const health = summary?.healthScore || 0;


  // Session Integrity Flags
  const sessionType = summary?.sessionType || session?.sessionType || (snapshots >= 2 && totalMessages >= 25 ? "COMPLETE" : totalMessages > 0 || snapshots > 0 ? "PARTIAL" : "EMPTY");
  const analyticsValid = summary?.integrityFlags?.analyticsValid ?? (sessionType === "COMPLETE");
  const healthScoreValid = summary?.integrityFlags?.healthScoreValid ?? (sessionType === "COMPLETE");

  // Grade derivation logic
  const getOverallGrade = () => {
    if (!analyticsValid || sessionType === "EMPTY") {
      return { letter: "N/A", label: "Not Available", color: "#64748b", desc: summary?.integrityReason || "Insufficient stream telemetry to evaluate grade." };
    }
    if (sessionType === "PARTIAL") {
      return { letter: "PARTIAL", label: "Partial Stream Data", color: "#eab308", desc: "Partial stream detected; incomplete metrics threshold." };
    }
    if (health >= 90) return { letter: "A+", label: "Exceptional Broadcast", color: "#34d399", desc: `Session completed with ${health}/100 Stream Health Score.` };
    if (health >= 80) return { letter: "A", label: "Strong Performance", color: "#60a5fa", desc: `Session completed with ${health}/100 Stream Health Score.` };
    if (health >= 70) return { letter: "B", label: "Solid Session", color: "#c084fc", desc: `Session completed with ${health}/100 Stream Health Score.` };
    return { letter: "C", label: "Average Session", color: "#fde047", desc: `Session completed with ${health}/100 Stream Health Score.` };
  };

  const grade = getOverallGrade();

  return (
    <div
      style={{
        width: "100%",
        padding: "28px",
        borderRadius: "20px",
        background: "rgba(13, 16, 27, 0.85)",
        backdropFilter: "blur(20px)",
        border: "1px solid rgba(255, 255, 255, 0.08)",
        boxShadow: "0 20px 50px rgba(0, 0, 0, 0.4)",
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
              background: `rgba(${grade.color === "#34d399" ? "52,211,153" : grade.color === "#64748b" ? "100,116,139" : "234,179,8"}, 0.12)`,
              border: `2px solid ${grade.color}`,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: `0 0 24px rgba(${grade.color === "#34d399" ? "52,211,153" : "100,116,139"}, 0.25)`,
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
            <div style={{ fontSize: "11px", fontWeight: "700", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.08em" }}>
              Broadcast Performance Summary • <span style={{ color: grade.color }}>{sessionType} SESSION</span>
            </div>
            <h2 style={{ margin: "2px 0 0", fontSize: "22px", fontWeight: "900", color: "#f8fafc" }}>
              {grade.label}
            </h2>
            <div style={{ fontSize: "13px", color: "#94a3b8", marginTop: "4px" }}>
              {grade.desc}
            </div>
          </div>
        </div>

        <div
          style={{
            padding: "12px 20px",
            borderRadius: "14px",
            background: "rgba(255, 255, 255, 0.03)",
            border: "1px solid rgba(255, 255, 255, 0.06)",
            textAlign: "right",
          }}
        >
          <div style={{ fontSize: "11px", color: "#64748b", textTransform: "uppercase", fontWeight: "700" }}>
            Final Stream Health
          </div>
          <div style={{ fontSize: "20px", fontWeight: "900", color: healthScoreValid ? "#34d399" : "#64748b", fontFamily: "monospace", marginTop: "2px" }}>
            {healthScoreValid ? `${health}/100` : "Not Available"}
          </div>
        </div>
      </div>

      {/* Primary KPI Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: "14px" }}>
        <div style={{ padding: "16px", borderRadius: "14px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
          <div style={{ fontSize: "11px", color: "#64748b", textTransform: "uppercase", fontWeight: "700" }}>Duration</div>
          <div style={{ fontSize: "22px", fontWeight: "900", color: "#f8fafc", marginTop: "6px", fontFamily: "monospace" }}>{duration}m</div>
        </div>

        <div style={{ padding: "16px", borderRadius: "14px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
          <div style={{ fontSize: "11px", color: "#64748b", textTransform: "uppercase", fontWeight: "700" }}>Peak Viewers</div>
          <div style={{ fontSize: "22px", fontWeight: "900", color: peakViewers > 0 ? "#c084fc" : "#64748b", marginTop: "6px", fontFamily: "monospace" }}>
            {peakViewers > 0 ? peakViewers.toLocaleString() : "0"}
          </div>
        </div>

        <div style={{ padding: "16px", borderRadius: "14px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
          <div style={{ fontSize: "11px", color: "#64748b", textTransform: "uppercase", fontWeight: "700" }}>Avg Viewers</div>
          <div style={{ fontSize: "22px", fontWeight: "900", color: avgViewers > 0 ? "#f8fafc" : "#64748b", marginTop: "6px", fontFamily: "monospace" }}>
            {avgViewers > 0 ? avgViewers.toLocaleString() : "0"}
          </div>
        </div>

        <div style={{ padding: "16px", borderRadius: "14px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
          <div style={{ fontSize: "11px", color: "#64748b", textTransform: "uppercase", fontWeight: "700" }}>Total Messages</div>
          <div style={{ fontSize: "22px", fontWeight: "900", color: totalMessages > 0 ? "#34d399" : "#64748b", marginTop: "6px", fontFamily: "monospace" }}>
            {totalMessages.toLocaleString()}
          </div>
        </div>

        <div style={{ padding: "16px", borderRadius: "14px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
          <div style={{ fontSize: "11px", color: "#64748b", textTransform: "uppercase", fontWeight: "700" }}>Highlights</div>
          <div style={{ fontSize: "22px", fontWeight: "900", color: highlights > 0 ? "#fde047" : "#64748b", marginTop: "6px", fontFamily: "monospace" }}>
            {highlights}
          </div>
        </div>

        <div style={{ padding: "16px", borderRadius: "14px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
          <div style={{ fontSize: "11px", color: "#64748b", textTransform: "uppercase", fontWeight: "700" }}>AI Insights</div>
          <div style={{ fontSize: "22px", fontWeight: "900", color: aiRecs > 0 ? "#60a5fa" : "#64748b", marginTop: "6px", fontFamily: "monospace" }}>
            {aiRecs}
          </div>
        </div>
      </div>
    </div>
  );
};

"use client";

import React from "react";
import { StreamScores, StreamGrade } from "@/lib/ai/executiveTypes";

interface PerformanceScoreProps {
  scores: StreamScores;
}

function getGradeColor(grade: StreamGrade): string {
  if (grade.startsWith("A")) return "#10b981";
  if (grade.startsWith("B")) return "#3b82f6";
  if (grade.startsWith("C")) return "#f59e0b";
  return "#ef4444";
}

function ScoreBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: "12px", color: "#94a3b8", fontWeight: 600 }}>{label}</span>
        <span style={{
          fontSize: "12px",
          fontFamily: "'JetBrains Mono', monospace",
          fontWeight: 800,
          color,
        }}>
          {value}
        </span>
      </div>
      <div style={{ height: "6px", borderRadius: "99px", background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
        <div
          style={{
            height: "100%",
            width: `${value}%`,
            borderRadius: "99px",
            background: color,
            boxShadow: `0 0 8px ${color}60`,
            transition: "width 0.6s ease",
          }}
        />
      </div>
    </div>
  );
}

export const PerformanceScore: React.FC<PerformanceScoreProps> = ({ scores }) => {
  const gradeColor = getGradeColor(scores.overallGrade);

  const categories = [
    { label: "Content Quality", value: scores.content, color: "#a855f7" },
    { label: "Audience Engagement", value: scores.audience, color: "#3b82f6" },
    { label: "Viewer Retention", value: scores.retention, color: "#10b981" },
    { label: "Energy Level", value: scores.energy, color: "#f59e0b" },
    { label: "Interaction", value: scores.interaction, color: "#ec4899" },
    { label: "Consistency", value: scores.consistency, color: "#06b6d4" },
    { label: "Community Response", value: scores.communityResponse, color: "#8b5cf6" },
  ];

  return (
    <section
      style={{
        padding: "32px 36px",
        borderRadius: "20px",
        background: "rgba(11, 13, 22, 0.7)",
        border: "1px solid rgba(255,255,255,0.07)",
        backdropFilter: "blur(16px)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "28px" }}>
        <div
          style={{
            width: "38px",
            height: "38px",
            borderRadius: "12px",
            background: "rgba(168,85,247,0.12)",
            border: "1px solid rgba(168,85,247,0.25)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "18px",
          }}
        >
          🏆
        </div>
        <h2 style={{ margin: 0, fontSize: "18px", fontWeight: 800, color: "#f8fafc" }}>
          Stream Score
        </h2>
      </div>

      <div style={{ display: "flex", gap: "40px", flexWrap: "wrap" }}>
        {/* Overall Grade */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "24px 32px",
            borderRadius: "18px",
            background: `${gradeColor}10`,
            border: `2px solid ${gradeColor}30`,
            minWidth: "120px",
            flexShrink: 0,
          }}
        >
          <span style={{
            fontSize: "56px",
            fontWeight: 900,
            color: gradeColor,
            fontFamily: "'JetBrains Mono', monospace",
            lineHeight: 1,
            textShadow: `0 0 30px ${gradeColor}60`,
          }}>
            {scores.overallGrade}
          </span>
          <span style={{ fontSize: "11px", color: "#64748b", marginTop: "8px", fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>
            Overall Grade
          </span>
          <span style={{ fontSize: "20px", fontWeight: 800, color: gradeColor, fontFamily: "'JetBrains Mono', monospace", marginTop: "4px" }}>
            {scores.overall}%
          </span>
        </div>

        {/* Score bars */}
        <div style={{ flex: 1, minWidth: "240px", display: "flex", flexDirection: "column", gap: "14px" }}>
          {categories.map((cat) => (
            <ScoreBar key={cat.label} label={cat.label} value={cat.value} color={cat.color} />
          ))}
        </div>
      </div>
    </section>
  );
};

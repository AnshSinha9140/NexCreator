"use client";

import React from "react";
import { useApp } from "@/context/AppContext";

interface ReportHistoryItem {
  id: string;
  streamTitle?: string;
  platform?: string;
  createdAt: string;
  scores?: { overallGrade?: string; overall?: number };
  isFavorited?: boolean;
  aiMetadata?: { snapshotsAnalyzed?: number };
}

interface ReportHistoryViewProps {
  reports: ReportHistoryItem[];
  onOpenReport: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  onDeleteReport: (id: string) => void;
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("en-US", {
      year: "numeric", month: "short", day: "numeric",
    });
  } catch (e) {
    return iso;
  }
}

export const ReportHistoryView: React.FC<ReportHistoryViewProps> = ({
  reports,
  onOpenReport,
  onToggleFavorite,
  onDeleteReport,
}) => {
  const { theme } = useApp();
  const isDark = theme === "dark";

  const [search, setSearch] = React.useState("");
  const [sortBy, setSortBy] = React.useState<"date" | "score">("date");

  const filtered = reports
    .filter((r) =>
      (r.streamTitle || "").toLowerCase().includes(search.toLowerCase()) ||
      (r.platform || "").toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === "score") {
        return (b.scores?.overall ?? 0) - (a.scores?.overall ?? 0);
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  const platformColors: Record<string, string> = {
    kick: isDark ? "#53fc18" : "#059669",
    youtube: "#ff0000",
    twitch: isDark ? "#9146ff" : "#7c3aed",
  };

  if (reports.length === 0) {
    return (
      <div
        style={{
          padding: "64px 32px",
          textAlign: "center",
          borderRadius: "20px",
          background: isDark ? "rgba(11, 13, 22, 0.6)" : "#ffffff",
          border: isDark ? "1px solid rgba(255,255,255,0.06)" : "1px solid #e2e8f0",
          boxShadow: isDark ? "none" : "0 1px 3px rgba(0,0,0,0.05)",
        }}
      >
        <div style={{ fontSize: "36px", marginBottom: "16px" }}>📄</div>
        <h3 style={{ margin: "0 0 10px", fontSize: "18px", fontWeight: 700, color: isDark ? "#f1f5f9" : "#0f172a" }}>
          No Reports Yet
        </h3>
        <p style={{ margin: 0, fontSize: "13px", color: isDark ? "#64748b" : "#475569", lineHeight: 1.5 }}>
          Complete a stream session to automatically generate your first Executive Producer Report.
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* Search & Sort Controls */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
        <input
          type="text"
          placeholder="Search reports..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            flex: 1,
            minWidth: "200px",
            padding: "10px 16px",
            borderRadius: "10px",
            background: isDark ? "rgba(255,255,255,0.04)" : "#ffffff",
            border: isDark ? "1px solid rgba(255,255,255,0.08)" : "1px solid #cbd5e1",
            color: isDark ? "#f1f5f9" : "#0f172a",
            fontSize: "13px",
            outline: "none",
          }}
        />
        <div style={{ display: "flex", gap: "8px" }}>
          {(["date", "score"] as const).map((opt) => (
            <button
              key={opt}
              onClick={() => setSortBy(opt)}
              style={{
                padding: "8px 14px",
                borderRadius: "10px",
                fontSize: "12px",
                fontWeight: 700,
                fontFamily: "'JetBrains Mono', monospace",
                cursor: "pointer",
                background: sortBy === opt ? (isDark ? "rgba(168,85,247,0.15)" : "rgba(168,85,247,0.1)") : (isDark ? "rgba(255,255,255,0.04)" : "#f1f5f9"),
                border: sortBy === opt ? "1px solid rgba(168,85,247,0.35)" : (isDark ? "1px solid rgba(255,255,255,0.08)" : "1px solid #cbd5e1"),
                color: sortBy === opt ? (isDark ? "#c084fc" : "#9333ea") : (isDark ? "#94a3b8" : "#475569"),
                textTransform: "capitalize",
              }}
            >
              Sort by {opt}
            </button>
          ))}
        </div>
      </div>

      {/* Report Cards */}
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {filtered.map((report) => {
          const plColor = platformColors[(report.platform || "").toLowerCase()] || (isDark ? "#94a3b8" : "#64748b");
          const grade = report.scores?.overallGrade;
          const overall = report.scores?.overall ?? 0;
          const gradeColors: Record<string, string> = { A: isDark ? "#10b981" : "#059669", B: "#3b82f6", C: "#f59e0b", D: "#ef4444", F: "#ef4444" };
          const gradeColor = gradeColors[(grade || "B")[0]] || "#3b82f6";

          return (
            <div
              key={report.id}
              style={{
                padding: "20px 24px",
                borderRadius: "14px",
                background: isDark ? "rgba(11, 13, 22, 0.7)" : "#ffffff",
                border: isDark ? "1px solid rgba(255,255,255,0.07)" : "1px solid #e2e8f0",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "16px",
                flexWrap: "wrap",
                boxShadow: isDark ? "none" : "0 1px 3px rgba(0,0,0,0.05)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                {/* Grade badge */}
                <div
                  style={{
                    width: "44px",
                    height: "44px",
                    borderRadius: "12px",
                    background: `${gradeColor}18`,
                    border: `1px solid ${gradeColor}40`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "16px",
                    fontWeight: 900,
                    fontFamily: "'JetBrains Mono', monospace",
                    color: gradeColor,
                    flexShrink: 0,
                  }}
                >
                  {grade || "?"}
                </div>

                <div>
                  <h4 style={{ margin: "0 0 4px", fontSize: "14px", fontWeight: 700, color: isDark ? "#f1f5f9" : "#0f172a" }}>
                    {report.streamTitle || "Untitled Stream"}
                  </h4>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                    <span
                      style={{
                        padding: "1px 8px",
                        borderRadius: "5px",
                        fontSize: "10px",
                        fontFamily: "'JetBrains Mono', monospace",
                        fontWeight: 700,
                        background: `${plColor}18`,
                        border: `1px solid ${plColor}40`,
                        color: plColor,
                        textTransform: "capitalize",
                      }}
                    >
                      {report.platform || "unknown"}
                    </span>
                    <span style={{ fontSize: "11px", color: isDark ? "#64748b" : "#64748b" }}>{formatDate(report.createdAt)}</span>
                    <span style={{ fontSize: "11px", fontFamily: "'JetBrains Mono', monospace", color: isDark ? "#94a3b8" : "#475569" }}>
                      Overall: {overall}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div style={{ display: "flex", alignItems: "center", gap: "10px", flexShrink: 0 }}>
                <button
                  onClick={() => onToggleFavorite(report.id)}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    fontSize: "16px",
                    padding: "4px",
                  }}
                  title={report.isFavorited ? "Unstar Report" : "Star Report"}
                >
                  {report.isFavorited ? "⭐" : "☆"}
                </button>
                <button
                  onClick={() => onOpenReport(report.id)}
                  style={{
                    padding: "8px 16px",
                    borderRadius: "10px",
                    background: "linear-gradient(135deg, #a855f7 0%, #6366f1 100%)",
                    border: "none",
                    color: "#ffffff",
                    fontSize: "12px",
                    fontWeight: 700,
                    cursor: "pointer",
                    boxShadow: "0 4px 12px rgba(168,85,247,0.25)",
                  }}
                >
                  Open Report
                </button>
                <button
                  onClick={() => onDeleteReport(report.id)}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    fontSize: "14px",
                    color: isDark ? "#64748b" : "#94a3b8",
                    padding: "4px",
                  }}
                  title="Delete Report"
                >
                  🗑️
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

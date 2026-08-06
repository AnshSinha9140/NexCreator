"use client";

import React from "react";
import { ExecutiveReport } from "@/lib/ai/executiveTypes";

interface ReportHeaderProps {
  report: ExecutiveReport;
  onToggleFavorite: () => void;
  onExportMarkdown: () => void;
  onCopyToClipboard: () => void;
}

function formatDuration(seconds?: number): string {
  if (!seconds) return "Unknown";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

function formatDate(iso?: string): string {
  if (!iso) return "Unknown";
  try {
    return new Date(iso).toLocaleDateString("en-US", {
      weekday: "long", year: "numeric", month: "long", day: "numeric",
    });
  } catch (e) {
    return iso;
  }
}

export const ReportHeader: React.FC<ReportHeaderProps> = ({
  report, onToggleFavorite, onExportMarkdown, onCopyToClipboard,
}) => {
  const platform = report.platform || "unknown";
  const platformColors: Record<string, string> = {
    kick: "#53fc18",
    youtube: "#ff0000",
    twitch: "#9146ff",
    unknown: "#94a3b8",
  };
  const platformColor = platformColors[platform.toLowerCase()] || platformColors.unknown;

  return (
    <div
      style={{
        padding: "32px 36px",
        borderRadius: "24px",
        background: "linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(11, 13, 22, 0.95) 100%)",
        border: "1px solid rgba(255,255,255,0.08)",
        backdropFilter: "blur(20px)",
        display: "flex",
        flexDirection: "column",
        gap: "20px",
      }}
    >
      {/* Top row */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "16px", flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          {/* Executive Producer badge */}
          <div
            style={{
              width: "52px",
              height: "52px",
              borderRadius: "16px",
              background: "linear-gradient(135deg, #a855f7 0%, #6366f1 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "24px",
              boxShadow: "0 4px 20px rgba(168,85,247,0.4)",
              flexShrink: 0,
            }}
          >
            🎬
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
              <span
                style={{
                  fontSize: "11px",
                  fontFamily: "'JetBrains Mono', monospace",
                  fontWeight: 800,
                  color: "#a855f7",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                }}
              >
                Executive Producer Report
              </span>
              <span
                style={{
                  padding: "2px 8px",
                  borderRadius: "6px",
                  fontSize: "10px",
                  fontWeight: 700,
                  fontFamily: "'JetBrains Mono', monospace",
                  background: `${platformColor}18`,
                  border: `1px solid ${platformColor}40`,
                  color: platformColor,
                  textTransform: "capitalize",
                }}
              >
                {platform}
              </span>
            </div>
            <h1 style={{ margin: "0 0 6px", fontSize: "24px", fontWeight: 800, color: "#f8fafc", lineHeight: 1.2 }}>
              {report.streamTitle || "Stream Report"}
            </h1>
            <div style={{ display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
              <span style={{ fontSize: "13px", color: "#64748b", fontFamily: "'JetBrains Mono', monospace" }}>
                📅 {formatDate(report.completedAt || report.createdAt)}
              </span>
              <span style={{ fontSize: "13px", color: "#64748b", fontFamily: "'JetBrains Mono', monospace" }}>
                ⏱️ {formatDuration(report.streamDurationSeconds)}
              </span>
              <span style={{ fontSize: "13px", color: "#64748b", fontFamily: "'JetBrains Mono', monospace" }}>
                🔍 {report.aiMetadata?.snapshotsAnalyzed ?? 0} snapshots analyzed
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexShrink: 0 }}>
          <button
            onClick={onToggleFavorite}
            title={report.isFavorited ? "Remove from favorites" : "Add to favorites"}
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "12px",
              background: report.isFavorited ? "rgba(245, 158, 11, 0.15)" : "rgba(255,255,255,0.04)",
              border: report.isFavorited ? "1px solid rgba(245,158,11,0.4)" : "1px solid rgba(255,255,255,0.08)",
              color: report.isFavorited ? "#fbbf24" : "#64748b",
              fontSize: "18px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {report.isFavorited ? "⭐" : "☆"}
          </button>

          <button
            onClick={onCopyToClipboard}
            style={{
              padding: "8px 16px",
              borderRadius: "10px",
              fontSize: "12px",
              fontWeight: 700,
              cursor: "pointer",
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              color: "#94a3b8",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <span>📋</span><span>Copy</span>
          </button>

          <button
            onClick={onExportMarkdown}
            style={{
              padding: "8px 16px",
              borderRadius: "10px",
              fontSize: "12px",
              fontWeight: 700,
              cursor: "pointer",
              background: "rgba(168,85,247,0.15)",
              border: "1px solid rgba(168,85,247,0.35)",
              color: "#c084fc",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <span>⬇</span><span>Export MD</span>
          </button>
        </div>
      </div>

      {/* AI Metadata row */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "16px",
          padding: "10px 16px",
          borderRadius: "10px",
          background: "rgba(6,8,16,0.5)",
          border: "1px solid rgba(255,255,255,0.05)",
          fontSize: "11px",
          fontFamily: "'JetBrains Mono', monospace",
          color: "#64748b",
          flexWrap: "wrap",
        }}
      >
        {report.aiMetadata && (
          <>
            <span>
              <span style={{ color: "#10b981" }}>●</span> {report.aiMetadata.model || "Gemini Flash"}
            </span>
            <span>•</span>
            <span>{report.aiMetadata.latencyMs ?? 0}ms generation</span>
            <span>•</span>
            <span>{report.aiMetadata.insightsAnalyzed ?? 0} insights processed</span>
            {report.aiMetadata.fallbackUsed && (
              <>
                <span>•</span>
                <span style={{ color: "#f59e0b" }}>⚠ Fallback Used</span>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

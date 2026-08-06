"use client";

import React from "react";
import { ManagerBriefing, BriefingType } from "@/lib/conversation/types";
import { useApp } from "@/context/AppContext";

interface ManagerBriefingCardProps {
  briefing: ManagerBriefing;
  snapshotTime?: string;
}

const BRIEFING_BADGE: Record<BriefingType, { label: string; color: string; bg: string; border: string }> = {
  live_update:     { label: "LIVE UPDATE",       color: "#34d399", bg: "rgba(52,211,153,0.12)",  border: "rgba(52,211,153,0.3)" },
  mid_stream:      { label: "MID-STREAM BRIEFING", color: "#60a5fa", bg: "rgba(96,165,250,0.12)", border: "rgba(96,165,250,0.3)" },
  critical_alert:  { label: "CRITICAL ALERT",    color: "#fb7185", bg: "rgba(244,63,94,0.12)",   border: "rgba(244,63,94,0.3)" },
  end_of_stream:   { label: "END-OF-STREAM REVIEW", color: "#c084fc", bg: "rgba(168,85,247,0.12)", border: "rgba(168,85,247,0.3)" },
};

export const ManagerBriefingCard: React.FC<ManagerBriefingCardProps> = ({
  briefing,
  snapshotTime,
}) => {
  const badge = BRIEFING_BADGE[briefing.type];
  const { theme } = useApp();
  const isDark = theme === "dark";

  return (
    <div
      style={{
        padding: "24px 28px",
        borderRadius: "20px",
        background: isDark
          ? "linear-gradient(135deg, rgba(13,16,27,0.95) 0%, rgba(20,26,46,0.9) 100%)"
          : "#ffffff",
        border: `1px solid ${badge.border}`,
        boxShadow: isDark ? "none" : "0 4px 20px rgba(0, 0, 0, 0.05)",
        display: "flex",
        flexDirection: "column",
        gap: "14px",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {/* Header row */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            padding: "4px 12px",
            borderRadius: "20px",
            background: badge.bg,
            border: `1px solid ${badge.border}`,
            color: badge.color,
            fontSize: "10px",
            fontWeight: "800",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
          }}
        >
          <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: badge.color, display: "inline-block" }} />
          {badge.label}
        </div>

        {snapshotTime && (
          <span style={{ fontSize: "11px", color: isDark ? "#475569" : "#64748b", fontVariantNumeric: "tabular-nums" }}>
            {snapshotTime}
          </span>
        )}
      </div>

      {/* Headline */}
      <div style={{ fontSize: "20px", fontWeight: "800", color: isDark ? "#f8fafc" : "#0f172a", lineHeight: 1.3 }}>
        {briefing.headline}
      </div>

      {/* Body — the natural language briefing */}
      <p
        style={{
          margin: 0,
          fontSize: "14px",
          color: isDark ? "#cbd5e1" : "#334155",
          lineHeight: 1.7,
          maxWidth: "640px",
        }}
      >
        {briefing.body}
      </p>

      {/* Memory Context — what happened earlier */}
      {briefing.memoryContext && (
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 text-xs text-slate-500 italic dark:text-slate-400 leading-relaxed">
          {briefing.memoryContext}
        </div>
      )}
    </div>
  );
};

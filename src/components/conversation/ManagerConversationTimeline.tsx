"use client";

import React, { useState } from "react";
import { ConversationEntry, ConversationMessageType, ConversationTimelineEntry } from "@/lib/conversation/types";
import { useApp } from "@/context/AppContext";

interface ManagerConversationTimelineProps {
  entries?: ConversationEntry[];
  timeline?: ConversationTimelineEntry[];
}

const TYPE_STYLES: Record<ConversationMessageType, { color: string; bg: string; border: string; icon: string }> = {
  Warning:      { color: "#fb7185", bg: "rgba(244,63,94,0.12)",   border: "rgba(244,63,94,0.3)",   icon: "⚠️" },
  Advice:       { color: "#60a5fa", bg: "rgba(96,165,250,0.12)",  border: "rgba(96,165,250,0.3)",  icon: "💡" },
  Praise:       { color: "#34d399", bg: "rgba(52,211,153,0.12)",  border: "rgba(52,211,153,0.3)",  icon: "🌟" },
  Observation:  { color: "#c084fc", bg: "rgba(168,85,247,0.12)", border: "rgba(168,85,247,0.3)", icon: "👁️" },
  Decision:     { color: "#eab308", bg: "rgba(234,179,8,0.12)",   border: "rgba(234,179,8,0.3)",   icon: "🎯" },
  Reflection:   { color: "#38bdf8", bg: "rgba(56,189,248,0.12)",  border: "rgba(56,189,248,0.3)",  icon: "📘" },
};

export const ManagerConversationTimeline: React.FC<ManagerConversationTimelineProps> = ({
  entries = [],
  timeline = [],
}) => {
  const [showAll, setShowAll] = useState(false);
  const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>({});
  const { theme } = useApp();
  const isDark = theme === "dark";

  const toggleCard = (id: string) => {
    setExpandedCards((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // If structured entries are available, render Sprint 19.1 unified cards
  if (entries && entries.length > 0) {
    const reversed = [...entries].reverse(); // newest first
    const MAX_VISIBLE = 15;
    const visibleEntries = showAll ? reversed : reversed.slice(0, MAX_VISIBLE);
    const hiddenCount = reversed.length - MAX_VISIBLE;

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "16px", fontFamily: "'Inter', sans-serif" }}>
        {visibleEntries.map((entry) => {
          const style = TYPE_STYLES[entry.messageType] || TYPE_STYLES.Observation;
          const isExpanded = expandedCards[entry.id] ?? false;

          return (
            <div
              key={entry.id}
              style={{
                padding: "20px",
                borderRadius: "16px",
                background: isDark
                  ? "linear-gradient(135deg, rgba(13,16,27,0.95) 0%, rgba(20,26,46,0.85) 100%)"
                  : "#ffffff",
                border: `1px solid ${style.border}`,
                boxShadow: isDark ? "none" : "0 4px 16px rgba(0, 0, 0, 0.04)",
                display: "flex",
                flexDirection: "column",
                gap: "12px",
              }}
            >
              {/* Header row */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span
                    style={{
                      padding: "3px 8px",
                      borderRadius: "6px",
                      background: style.bg,
                      border: `1px solid ${style.border}`,
                      color: style.color,
                      fontSize: "10px",
                      fontWeight: "800",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                    }}
                  >
                    <span>{style.icon}</span>
                    {entry.messageType}
                  </span>
                  <span style={{ fontSize: "14px", fontWeight: "800", color: isDark ? "#f8fafc" : "#0f172a" }}>
                    {entry.headline}
                  </span>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <span style={{ fontSize: "11px", color: isDark ? "#64748b" : "#64748b", fontVariantNumeric: "tabular-nums" }}>
                    {entry.timestamp}
                  </span>
                  <span className="text-xs text-slate-500 italic dark:text-slate-400">
                    {entry.confidencePhrase}
                  </span>
                </div>
              </div>

              {/* Statement Body (Target 60-90 words, max 120 words) */}
              <p style={{ margin: 0, fontSize: "13px", color: isDark ? "#cbd5e1" : "#334155", lineHeight: 1.6 }}>
                "{entry.statement}"
              </p>

              {/* Supporting Evidence Bullets */}
              {entry.supportingEvidence && entry.supportingEvidence.length > 0 && (
                <div
                  style={{
                    padding: "10px 14px",
                    borderRadius: "10px",
                    background: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)",
                    border: isDark ? "1px solid rgba(255,255,255,0.05)" : "1px solid rgba(0,0,0,0.06)",
                    fontSize: "12px",
                    color: isDark ? "#94a3b8" : "#64748b",
                    display: "flex",
                    flexDirection: "column",
                    gap: "4px",
                  }}
                >
                  <div style={{ fontSize: "10px", fontWeight: "800", color: style.color, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    Supporting Evidence
                  </div>
                  {entry.supportingEvidence.map((ev, idx) => (
                    <div key={idx} style={{ display: "flex", alignItems: "center", gap: "6px", color: isDark ? "#cbd5e1" : "#334155" }}>
                      <span style={{ color: style.color }}>•</span> {ev}
                    </div>
                  ))}
                </div>
              )}

              {/* Expandable Reasoning & Actions */}
              {(entry.reasoning || entry.actions) && (
                <>
                  <button
                    onClick={() => toggleCard(entry.id)}
                    style={{
                      background: "none",
                      border: "none",
                      color: style.color,
                      fontSize: "11px",
                      fontWeight: "700",
                      cursor: "pointer",
                      padding: 0,
                      textAlign: "left",
                      width: "fit-content",
                    }}
                  >
                    {isExpanded ? "▲ Less Details" : "▼ Manager Reasoning & Recommended Actions"}
                  </button>

                  {isExpanded && (
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: "12px",
                        paddingTop: "8px",
                        borderTop: isDark ? "1px solid rgba(255,255,255,0.05)" : "1px solid rgba(0,0,0,0.06)",
                        fontSize: "12px",
                      }}
                    >
                      {entry.reasoning && (
                        <div>
                          <div style={{ fontSize: "10px", fontWeight: "800", color: isDark ? "#94a3b8" : "#64748b", textTransform: "uppercase", marginBottom: "4px" }}>
                            Why this matters
                          </div>
                          <div style={{ color: isDark ? "#cbd5e1" : "#334155", lineHeight: 1.5 }}>{entry.reasoning}</div>
                        </div>
                      )}
                      {entry.actions && (
                        <div>
                          <div style={{ fontSize: "10px", fontWeight: "800", color: style.color, textTransform: "uppercase", marginBottom: "4px" }}>
                            Recommended Action
                          </div>
                          <div style={{ color: isDark ? "#cbd5e1" : "#334155", lineHeight: 1.5 }}>{entry.actions}</div>
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          );
        })}

        {/* Sprint 19.1 Part 10: Collapsible earlier entries limit */}
        {hiddenCount > 0 && !showAll && (
          <button
            onClick={() => setShowAll(true)}
            style={{
              padding: "12px",
              borderRadius: "12px",
              background: isDark ? "rgba(255, 255, 255, 0.04)" : "rgba(0, 0, 0, 0.04)",
              border: isDark ? "1px solid rgba(255, 255, 255, 0.08)" : "1px solid rgba(0, 0, 0, 0.08)",
              color: isDark ? "#94a3b8" : "#64748b",
              fontSize: "12px",
              fontWeight: "700",
              cursor: "pointer",
              textAlign: "center",
            }}
          >
            📜 Show Earlier Conversation ({hiddenCount} older updates)
          </button>
        )}
      </div>
    );
  }

  // Fallback for legacy timeline entries
  if (!timeline || timeline.length === 0) {
    return (
      <div style={{ padding: "20px", color: isDark ? "#64748b" : "#64748b", fontSize: "13px", textAlign: "center" }}>
        No manager updates recorded yet.
      </div>
    );
  }

  const reversedTimeline = [...timeline].reverse();
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px", fontFamily: "'Inter', sans-serif" }}>
      {reversedTimeline.slice(0, 15).map((entry, idx) => (
        <div
          key={idx}
          style={{
            padding: "12px 16px",
            borderRadius: "12px",
            background: isDark ? "rgba(13,16,27,0.8)" : "#ffffff",
            border: isDark ? "1px solid rgba(255,255,255,0.06)" : "1px solid rgba(0,0,0,0.08)",
            boxShadow: isDark ? "none" : "0 2px 8px rgba(0,0,0,0.04)",
            fontSize: "13px",
            color: isDark ? "#e2e8f0" : "#334155",
          }}
        >
          <div style={{ fontSize: "11px", color: isDark ? "#64748b" : "#64748b", marginBottom: "4px" }}>
            {entry.timestamp}
          </div>
          <div>{entry.statement}</div>
        </div>
      ))}
    </div>
  );
};

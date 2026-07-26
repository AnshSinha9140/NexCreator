"use client";

import React from "react";
import { BiggestWinItem } from "@/lib/ai/executiveTypes";

interface BiggestWinsCardProps {
  wins: BiggestWinItem[];
}

const WIN_CONFIG: Record<string, { icon: string; color: string }> = {
  best_topic:          { icon: "💬", color: "#a855f7" },
  best_segment:        { icon: "📺", color: "#3b82f6" },
  highest_engagement:  { icon: "🚀", color: "#10b981" },
  best_reaction:       { icon: "💫", color: "#f59e0b" },
  best_growth:         { icon: "📈", color: "#ec4899" },
  best_conversation:   { icon: "🗣️", color: "#06b6d4" },
  other:               { icon: "⭐", color: "#64748b" },
};

export const BiggestWinsCard: React.FC<BiggestWinsCardProps> = ({ wins }) => {
  if (!wins || wins.length === 0) return null;

  return (
    <section
      style={{
        padding: "32px 36px",
        borderRadius: "20px",
        background: "rgba(11, 13, 22, 0.7)",
        border: "1px solid rgba(255,255,255,0.07)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px" }}>
        <div
          style={{
            width: "38px",
            height: "38px",
            borderRadius: "12px",
            background: "rgba(16, 185, 129, 0.12)",
            border: "1px solid rgba(16, 185, 129, 0.25)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "18px",
          }}
        >
          🏅
        </div>
        <h2 style={{ margin: 0, fontSize: "18px", fontWeight: 800, color: "#f8fafc" }}>
          Biggest Wins
        </h2>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "16px" }}>
        {wins.map((win) => {
          const cfg = WIN_CONFIG[win.category] || WIN_CONFIG.other;
          return (
            <div
              key={win.id}
              style={{
                padding: "20px",
                borderRadius: "14px",
                background: `${cfg.color}08`,
                border: `1px solid ${cfg.color}25`,
                display: "flex",
                flexDirection: "column",
                gap: "10px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ fontSize: "22px" }}>{cfg.icon}</span>
                <div style={{ flex: 1 }}>
                  <h4 style={{ margin: 0, fontSize: "14px", fontWeight: 700, color: "#f1f5f9" }}>
                    {win.title}
                  </h4>
                  {win.timestamp && (
                    <span style={{ fontSize: "11px", fontFamily: "'JetBrains Mono', monospace", color: "#64748b" }}>
                      {win.timestamp}
                    </span>
                  )}
                </div>
                <span
                  style={{
                    fontSize: "10px",
                    fontFamily: "'JetBrains Mono', monospace",
                    fontWeight: 800,
                    color: "#34d399",
                    background: "rgba(16,185,129,0.1)",
                    border: "1px solid rgba(16,185,129,0.25)",
                    borderRadius: "6px",
                    padding: "2px 8px",
                  }}
                >
                  {win.confidence}%
                </span>
              </div>
              <p style={{ margin: 0, fontSize: "13px", color: "#94a3b8", lineHeight: 1.5 }}>
                {win.explanation}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
};

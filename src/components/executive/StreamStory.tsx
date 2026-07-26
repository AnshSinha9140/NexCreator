"use client";

import React from "react";
import { StoryMilestone } from "@/lib/ai/executiveTypes";

interface StreamStoryProps {
  milestones: StoryMilestone[];
}

const MILESTONE_CONFIG: Record<string, { icon: string; color: string }> = {
  start:        { icon: "▶", color: "#94a3b8" },
  momentum_up:  { icon: "🚀", color: "#10b981" },
  peak:         { icon: "⚡", color: "#f59e0b" },
  drop:         { icon: "📉", color: "#f43f5e" },
  recovery:     { icon: "💪", color: "#3b82f6" },
  raid:         { icon: "⚡", color: "#a855f7" },
  end:          { icon: "⏹", color: "#94a3b8" },
  highlight:    { icon: "🌟", color: "#fbbf24" },
};

export const StreamStory: React.FC<StreamStoryProps> = ({ milestones }) => {
  if (!milestones || milestones.length === 0) return null;

  return (
    <section
      style={{
        padding: "32px 36px",
        borderRadius: "20px",
        background: "rgba(11, 13, 22, 0.7)",
        border: "1px solid rgba(255,255,255,0.07)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "28px" }}>
        <div
          style={{
            width: "38px",
            height: "38px",
            borderRadius: "12px",
            background: "rgba(99, 102, 241, 0.12)",
            border: "1px solid rgba(99, 102, 241, 0.25)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "18px",
          }}
        >
          📖
        </div>
        <h2 style={{ margin: 0, fontSize: "18px", fontWeight: 800, color: "#f8fafc" }}>
          Stream Story
        </h2>
        <span style={{ marginLeft: "auto", fontSize: "12px", color: "#64748b" }}>
          {milestones.length} milestones
        </span>
      </div>

      {/* Horizontal flow */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: "0", overflowX: "auto", paddingBottom: "8px" }}>
        {milestones.map((milestone, idx) => {
          const cfg = MILESTONE_CONFIG[milestone.type] || MILESTONE_CONFIG.highlight;
          const isLast = idx === milestones.length - 1;

          return (
            <React.Fragment key={milestone.id}>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  minWidth: "130px",
                  flexShrink: 0,
                }}
              >
                {/* Node */}
                <div
                  style={{
                    width: "44px",
                    height: "44px",
                    borderRadius: "50%",
                    background: `${cfg.color}15`,
                    border: `2px solid ${cfg.color}50`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "18px",
                    boxShadow: `0 0 16px ${cfg.color}25`,
                    marginBottom: "10px",
                  }}
                >
                  {cfg.icon}
                </div>

                {/* Milestone info */}
                <div style={{ textAlign: "center", padding: "0 8px" }}>
                  <div style={{ fontSize: "12px", fontWeight: 700, color: "#e2e8f0", marginBottom: "4px" }}>
                    {milestone.title}
                  </div>
                  {milestone.timestamp && (
                    <div style={{ fontSize: "10px", fontFamily: "'JetBrains Mono', monospace", color: "#64748b", marginBottom: "4px" }}>
                      {milestone.timestamp}
                    </div>
                  )}
                  <div style={{ fontSize: "11px", color: "#94a3b8", lineHeight: 1.4 }}>
                    {milestone.description}
                  </div>
                </div>
              </div>

              {/* Arrow connector */}
              {!isLast && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    paddingTop: "12px",
                    flexShrink: 0,
                  }}
                >
                  <div
                    style={{
                      width: "40px",
                      height: "2px",
                      background: "rgba(168, 85, 247, 0.25)",
                      position: "relative",
                    }}
                  >
                    <div style={{
                      position: "absolute",
                      right: 0,
                      top: "-4px",
                      color: "rgba(168, 85, 247, 0.5)",
                      fontSize: "12px",
                    }}>›</div>
                  </div>
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </section>
  );
};

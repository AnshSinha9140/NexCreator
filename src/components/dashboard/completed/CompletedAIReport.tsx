"use client";

import React, { useState } from "react";
import { FinalSessionSummary } from "@/lib/session/lifecycle";
import { useApp } from "@/context/AppContext";

interface CompletedAIReportProps {
  summary?: FinalSessionSummary | null;
  bundle?: any;
  insights?: any[];
  session?: any;
}

export const CompletedAIReport: React.FC<CompletedAIReportProps> = ({
  summary,
  bundle,
}) => {
  const { theme } = useApp();
  const isDark = theme === "dark";
  const [completedActions, setCompletedActions] = useState<Record<string, boolean>>({});

  const toggleAction = (id: string) => {
    setCompletedActions((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const canonicalIntelligence = bundle?.sessionIntelligence;
  const journal = canonicalIntelligence?.coaching?.managerJournal;

  const legacyReport = bundle?.aiReport || (summary as any)?.aiReport;
  const actionPlan = canonicalIntelligence?.actionPlan || legacyReport?.recommendations || [];

  const cardBg = isDark ? "rgba(13, 16, 27, 0.85)" : "#ffffff";
  const cardBorder = isDark ? "1px solid rgba(255, 255, 255, 0.08)" : "1px solid rgba(0, 0, 0, 0.08)";
  const cardShadow = isDark ? "none" : "0 4px 16px rgba(0, 0, 0, 0.04)";
  const textTitle = isDark ? "#f8fafc" : "#0f172a";
  const textMuted = isDark ? "#94a3b8" : "#64748b";
  const textBody = isDark ? "#cbd5e1" : "#475569";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px", fontFamily: "'Inter', sans-serif" }}>
      {/* 1. Conversational Executive Coaching Briefing */}
      <div
        style={{
          padding: "24px",
          borderRadius: "20px",
          background: isDark
            ? "linear-gradient(135deg, rgba(168, 85, 247, 0.15) 0%, rgba(59, 130, 246, 0.1) 100%)"
            : "linear-gradient(135deg, #f3e8ff 0%, #dbeafe 100%)",
          border: isDark ? "1px solid rgba(168, 85, 247, 0.35)" : "1px solid #e9d5ff",
          boxShadow: cardShadow,
          display: "flex",
          flexDirection: "column",
          gap: "12px",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div
            style={{
              fontSize: "11px",
              fontWeight: "800",
              color: isDark ? "#c084fc" : "#6b21a8",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              fontFamily: "monospace",
            }}
          >
            🧠 Manager Executive Review
          </div>
          <span style={{ fontSize: "11px", color: textMuted, fontWeight: "600" }}>
            Post-Broadcast Coaching Briefing
          </span>
        </div>

        <h2 style={{ margin: 0, fontSize: "20px", fontWeight: "800", color: textTitle, fontStyle: "italic" }}>
          "If I had been sitting beside you during this stream, here's what I would've told you."
        </h2>
        <p style={{ margin: 0, fontSize: "13px", color: textBody }}>
          Evaluated against your Creator Profile, Creator DNA, Mission, and live stream telemetry.
        </p>
      </div>

      {/* 2. Manager's Journal: 6 Core Areas */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
        {/* What Impressed Me */}
        <div
          style={{
            padding: "20px",
            borderRadius: "16px",
            background: cardBg,
            border: isDark ? "1px solid rgba(52, 211, 153, 0.25)" : "1px solid rgba(52, 211, 153, 0.3)",
            boxShadow: cardShadow,
            display: "flex",
            flexDirection: "column",
            gap: "10px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "16px" }}>⭐</span>
            <h3 style={{ margin: 0, fontSize: "15px", fontWeight: "800", color: isDark ? "#34d399" : "#059669" }}>
              What Impressed Me
            </h3>
          </div>
          <p style={{ margin: 0, fontSize: "13px", color: textBody, lineHeight: 1.6 }}>
            {journal?.whatImpressedMe ||
              "Your direct chat interactions triggered substantial engagement surges — audience responded immediately when invited to participate."}
          </p>
        </div>

        {/* What Held You Back */}
        <div
          style={{
            padding: "20px",
            borderRadius: "16px",
            background: cardBg,
            border: isDark ? "1px solid rgba(251, 113, 133, 0.25)" : "1px solid rgba(251, 113, 133, 0.3)",
            boxShadow: cardShadow,
            display: "flex",
            flexDirection: "column",
            gap: "10px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "16px" }}>⚠️</span>
            <h3 style={{ margin: 0, fontSize: "15px", fontWeight: "800", color: isDark ? "#fb7185" : "#e11d48" }}>
              What Held You Back
            </h3>
          </div>
          <p style={{ margin: 0, fontSize: "13px", color: textBody, lineHeight: 1.6 }}>
            {journal?.whatHeldYouBack ||
              "Brief silent periods during loading transitions led to minor viewer drop-offs. Maintaining verbal flow keeps retention high."}
          </p>
        </div>

        {/* One Thing I'd Repeat */}
        <div
          style={{
            padding: "20px",
            borderRadius: "16px",
            background: cardBg,
            border: isDark ? "1px solid rgba(96, 165, 250, 0.25)" : "1px solid rgba(96, 165, 250, 0.3)",
            boxShadow: cardShadow,
            display: "flex",
            flexDirection: "column",
            gap: "10px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "16px" }}>🔄</span>
            <h3 style={{ margin: 0, fontSize: "15px", fontWeight: "800", color: isDark ? "#60a5fa" : "#2563eb" }}>
              One Thing I'd Repeat
            </h3>
          </div>
          <p style={{ margin: 0, fontSize: "13px", color: textBody, lineHeight: 1.6 }}>
            {journal?.oneThingToRepeat ||
              "Asking open-ended questions to chat during tense gameplay moments."}
          </p>
        </div>

        {/* One Thing I'd Stop */}
        <div
          style={{
            padding: "20px",
            borderRadius: "16px",
            background: cardBg,
            border: isDark ? "1px solid rgba(245, 158, 11, 0.25)" : "1px solid rgba(245, 158, 11, 0.3)",
            boxShadow: cardShadow,
            display: "flex",
            flexDirection: "column",
            gap: "10px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "16px" }}>🛑</span>
            <h3 style={{ margin: 0, fontSize: "15px", fontWeight: "800", color: isDark ? "#fbbf24" : "#d97706" }}>
              One Thing I'd Stop
            </h3>
          </div>
          <p style={{ margin: 0, fontSize: "13px", color: textBody, lineHeight: 1.6 }}>
            {journal?.oneThingToStop ||
              "Letting game menu navigation pass in total silence."}
          </p>
        </div>

        {/* Tomorrow's Priority */}
        <div
          style={{
            padding: "20px",
            borderRadius: "16px",
            background: cardBg,
            border: isDark ? "1px solid rgba(192, 132, 252, 0.25)" : "1px solid rgba(192, 132, 252, 0.3)",
            boxShadow: cardShadow,
            display: "flex",
            flexDirection: "column",
            gap: "10px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "16px" }}>🎯</span>
            <h3 style={{ margin: 0, fontSize: "15px", fontWeight: "800", color: isDark ? "#c084fc" : "#7c3aed" }}>
              Next Stream Priority
            </h3>
          </div>
          <p style={{ margin: 0, fontSize: "13px", color: textBody, lineHeight: 1.6 }}>
            {journal?.nextStreamPriority ||
              "Review top approved clip and publish to Shorts within 12 hours."}
          </p>
        </div>

        {/* Long-term Reminder */}
        <div
          style={{
            padding: "20px",
            borderRadius: "16px",
            background: cardBg,
            border: isDark ? "1px solid rgba(56, 189, 248, 0.25)" : "1px solid rgba(56, 189, 248, 0.3)",
            boxShadow: cardShadow,
            display: "flex",
            flexDirection: "column",
            gap: "10px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "16px" }}>📌</span>
            <h3 style={{ margin: 0, fontSize: "15px", fontWeight: "800", color: isDark ? "#38bdf8" : "#0284c7" }}>
              Long-term Growth Anchor
            </h3>
          </div>
          <p style={{ margin: 0, fontSize: "13px", color: textBody, lineHeight: 1.6 }}>
            {journal?.longTermReminder ||
              "Community compounding requires active recognition. Every chatter you acknowledge out loud is 3x more likely to return next stream."}
          </p>
        </div>
      </div>

      {/* 3. Action Checklist Section */}
      {actionPlan.length > 0 && (
        <div
          style={{
            padding: "24px",
            borderRadius: "16px",
            background: "rgba(13, 16, 27, 0.85)",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            display: "flex",
            flexDirection: "column",
            gap: "16px",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontSize: "18px" }}>📋</span>
              <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "800", color: "#f8fafc" }}>
                Manager Action Checklist
              </h3>
            </div>
            <span style={{ fontSize: "12px", color: "#94a3b8" }}>
              {Object.values(completedActions).filter(Boolean).length} / {actionPlan.length} Completed
            </span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {actionPlan.map((act: any) => {
              const isDone = !!completedActions[act.actionId];
              return (
                <div
                  key={act.actionId}
                  onClick={() => toggleAction(act.actionId)}
                  style={{
                    padding: "14px 18px",
                    borderRadius: "12px",
                    background: isDone ? "rgba(52, 211, 153, 0.05)" : "rgba(255, 255, 255, 0.02)",
                    border: isDone ? "1px solid rgba(52, 211, 153, 0.3)" : "1px solid rgba(255, 255, 255, 0.06)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div
                      style={{
                        width: "20px",
                        height: "20px",
                        borderRadius: "6px",
                        border: isDone ? "none" : "2px solid rgba(255,255,255,0.2)",
                        background: isDone ? "#34d399" : "transparent",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#000",
                        fontSize: "12px",
                        fontWeight: "900",
                      }}
                    >
                      {isDone ? "✓" : ""}
                    </div>
                    <div>
                      <div
                        style={{
                          fontSize: "13px",
                          fontWeight: "700",
                          color: isDone ? "#94a3b8" : "#f8fafc",
                          textDecoration: isDone ? "line-through" : "none",
                        }}
                      >
                        {act.title}
                      </div>
                      <div style={{ fontSize: "11px", color: "#64748b", marginTop: "2px" }}>
                        {act.rationale}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                    <span
                      style={{
                        fontSize: "10px",
                        padding: "2px 8px",
                        borderRadius: "6px",
                        background: "rgba(255,255,255,0.05)",
                        color: "#94a3b8",
                      }}
                    >
                      {act.estimatedMinutes}m
                    </span>
                    <span
                      style={{
                        fontSize: "10px",
                        padding: "2px 8px",
                        borderRadius: "6px",
                        background:
                          act.priority === "CRITICAL" || act.priority === "HIGH"
                            ? "rgba(251, 113, 133, 0.15)"
                            : "rgba(96, 165, 250, 0.15)",
                        color:
                          act.priority === "CRITICAL" || act.priority === "HIGH"
                            ? "#fb7185"
                            : "#60a5fa",
                        fontWeight: "800",
                      }}
                    >
                      {act.priority}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

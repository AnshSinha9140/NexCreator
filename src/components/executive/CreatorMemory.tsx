"use client";

import React from "react";
import { useApp } from "@/context/AppContext";
import { CreatorMemoryUpdate } from "@/lib/ai/executiveTypes";

interface CreatorMemoryProps {
  memoryUpdate?: CreatorMemoryUpdate;
}

export const CreatorMemory: React.FC<CreatorMemoryProps> = ({ memoryUpdate }) => {
  const { theme } = useApp();
  const isDark = theme === "dark";

  const todayILearned = memoryUpdate?.todayILearned || [
    "Your audience enjoys spontaneous, unscripted reactions over rigid gameplay loops.",
    "Comedy and relatable commentary consistently outperform high-intensity competitive play.",
    "Viewer questions were occasionally missed during high-focus combat sequences.",
  ];

  const becomingConfidentAbout = memoryUpdate?.becomingConfidentAbout || [
    "Your audience stays primarily for your personality and storytelling, not raw mechanics.",
    "Direct Q&A prompts yield immediate message velocity bursts (+180%).",
  ];

  const stillTesting = memoryUpdate?.stillTesting || [
    "Whether structured 15-minute chat segments increase overall broadcast retention.",
    "Optimal short-form upload window timing for TikTok vs YouTube Shorts.",
  ];

  const changedMyMind = memoryUpdate?.changedMyMind || [
    {
      previousBelief: "Competitive gameplay drives audience retention.",
      updatedBelief: "Conversational banter and direct chat responses drive retention.",
      confidence: 84,
      reasoning: "Telemetry recorded zero viewer drop-off during banter vs 6% drop during silent combat.",
    },
  ];

  return (
    <div
      style={{
        padding: "24px",
        borderRadius: "20px",
        background: isDark ? "rgba(13, 16, 27, 0.85)" : "#ffffff",
        border: isDark ? "1px solid rgba(168, 85, 247, 0.25)" : "1px solid #e2e8f0",
        boxShadow: isDark ? "none" : "0 1px 3px rgba(0,0,0,0.05)",
        display: "flex",
        flexDirection: "column",
        gap: "20px",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <span style={{ fontSize: "18px" }}>🧠</span>
        <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "800", color: isDark ? "#c084fc" : "#9333ea" }}>
          Creator Memory Update
        </h3>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
        {/* Today I Learned */}
        <div style={{ padding: "16px", borderRadius: "14px", background: isDark ? "rgba(255,255,255,0.02)" : "#f8fafc", border: isDark ? "1px solid rgba(255,255,255,0.06)" : "1px solid #e2e8f0" }}>
          <div style={{ fontSize: "12px", fontWeight: "800", color: isDark ? "#34d399" : "#059669", textTransform: "uppercase", marginBottom: "8px" }}>
            📌 Today I Learned About You
          </div>
          <ul style={{ margin: 0, paddingLeft: "16px", fontSize: "12px", color: isDark ? "#cbd5e1" : "#334155", display: "flex", flexDirection: "column", gap: "6px", lineHeight: 1.5 }}>
            {todayILearned.map((item, idx) => (
              <li key={idx}>+ {item}</li>
            ))}
          </ul>
        </div>

        {/* Becoming Confident About */}
        <div style={{ padding: "16px", borderRadius: "14px", background: isDark ? "rgba(255,255,255,0.02)" : "#f8fafc", border: isDark ? "1px solid rgba(255,255,255,0.06)" : "1px solid #e2e8f0" }}>
          <div style={{ fontSize: "12px", fontWeight: "800", color: isDark ? "#60a5fa" : "#2563eb", textTransform: "uppercase", marginBottom: "8px" }}>
            🎯 Things I'm Becoming Confident About
          </div>
          <ul style={{ margin: 0, paddingLeft: "16px", fontSize: "12px", color: isDark ? "#cbd5e1" : "#334155", display: "flex", flexDirection: "column", gap: "6px", lineHeight: 1.5 }}>
            {becomingConfidentAbout.map((item, idx) => (
              <li key={idx}>✓ {item}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* Changed My Mind Box */}
      {changedMyMind.length > 0 && (
        <div style={{ padding: "16px", borderRadius: "14px", background: isDark ? "rgba(168, 85, 247, 0.08)" : "rgba(168, 85, 247, 0.05)", border: isDark ? "1px solid rgba(168, 85, 247, 0.25)" : "1px solid rgba(168, 85, 247, 0.2)", display: "flex", flexDirection: "column", gap: "8px" }}>
          <div style={{ fontSize: "12px", fontWeight: "800", color: isDark ? "#c084fc" : "#9333ea", textTransform: "uppercase" }}>
            🔄 Things That Changed My Mind
          </div>
          {changedMyMind.map((item, idx) => (
            <div key={idx} style={{ fontSize: "12px", color: isDark ? "#cbd5e1" : "#334155", display: "flex", flexDirection: "column", gap: "4px" }}>
              <div><span style={{ color: "#e11d48", textDecoration: "line-through" }}>Previous Belief: {item.previousBelief}</span></div>
              <div><strong style={{ color: isDark ? "#34d399" : "#059669" }}>Updated Belief: {item.updatedBelief}</strong></div>
              <div style={{ fontSize: "11px", color: isDark ? "#94a3b8" : "#64748b", fontStyle: "italic", marginTop: "2px" }}>
                Confidence: {item.confidence}% · Reason: {item.reasoning}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

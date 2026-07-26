"use client";

import React from "react";
import { AudienceIntelligence } from "@/lib/ai/executiveTypes";

interface AudienceInsightsProps {
  data: AudienceIntelligence;
}

const MOOD_CONFIG = {
  very_positive: { label: "Very Positive", emoji: "😄", color: "#10b981" },
  positive:      { label: "Positive",      emoji: "🙂", color: "#3b82f6" },
  neutral:       { label: "Neutral",       emoji: "😐", color: "#94a3b8" },
  mixed:         { label: "Mixed",         emoji: "🤔", color: "#f59e0b" },
  negative:      { label: "Negative",      emoji: "😟", color: "#f43f5e" },
};

function TagList({ items, color }: { items: string[]; color: string }) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
      {items.map((item, idx) => (
        <span
          key={idx}
          style={{
            padding: "4px 10px",
            borderRadius: "8px",
            fontSize: "12px",
            background: `${color}12`,
            border: `1px solid ${color}25`,
            color: "#cbd5e1",
          }}
        >
          {item}
        </span>
      ))}
    </div>
  );
}

export const AudienceInsights: React.FC<AudienceInsightsProps> = ({ data }) => {
  const mood = MOOD_CONFIG[data.overallMood] || MOOD_CONFIG.neutral;

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
            background: "rgba(59,130,246,0.12)",
            border: "1px solid rgba(59,130,246,0.25)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "18px",
          }}
        >
          👥
        </div>
        <h2 style={{ margin: 0, fontSize: "18px", fontWeight: 800, color: "#f8fafc" }}>
          Audience Intelligence
        </h2>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "20px" }}>
        {/* Overall Mood */}
        <div
          style={{
            padding: "20px",
            borderRadius: "14px",
            background: `${mood.color}08`,
            border: `1px solid ${mood.color}22`,
            display: "flex",
            flexDirection: "column",
            gap: "10px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ fontSize: "24px" }}>{mood.emoji}</span>
            <div>
              <div style={{ fontSize: "10px", fontWeight: 800, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em", fontFamily: "'JetBrains Mono', monospace" }}>
                Overall Mood
              </div>
              <div style={{ fontSize: "15px", fontWeight: 800, color: mood.color }}>{mood.label}</div>
            </div>
          </div>
          <p style={{ margin: 0, fontSize: "12px", color: "#94a3b8", lineHeight: 1.4 }}>{data.moodExplanation}</p>
        </div>

        {/* Participation Rate */}
        <div style={{ padding: "20px", borderRadius: "14px", background: "rgba(168,85,247,0.06)", border: "1px solid rgba(168,85,247,0.15)" }}>
          <div style={{ fontSize: "10px", fontWeight: 800, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em", fontFamily: "'JetBrains Mono', monospace", marginBottom: "8px" }}>
            Viewer Participation
          </div>
          <div style={{ fontSize: "36px", fontWeight: 900, color: "#c084fc", fontFamily: "'JetBrains Mono', monospace", lineHeight: 1 }}>
            {data.viewerParticipationRate}%
          </div>
          <div style={{ fontSize: "12px", color: "#94a3b8", marginTop: "4px" }}>of viewers engaged in chat</div>
        </div>

        {/* Most Discussed Topics */}
        {data.mostDiscussedTopics.length > 0 && (
          <div style={{ padding: "20px", borderRadius: "14px", background: "rgba(6,182,212,0.06)", border: "1px solid rgba(6,182,212,0.15)" }}>
            <div style={{ fontSize: "10px", fontWeight: 800, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em", fontFamily: "'JetBrains Mono', monospace", marginBottom: "12px" }}>
              Top Topics
            </div>
            <TagList items={data.mostDiscussedTopics} color="#06b6d4" />
          </div>
        )}

        {/* FAQs */}
        {data.frequentlyAskedQuestions.length > 0 && (
          <div style={{ padding: "20px", borderRadius: "14px", background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.15)" }}>
            <div style={{ fontSize: "10px", fontWeight: 800, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em", fontFamily: "'JetBrains Mono', monospace", marginBottom: "10px" }}>
              Frequently Asked Questions
            </div>
            <ul style={{ margin: 0, paddingLeft: "18px", display: "flex", flexDirection: "column", gap: "6px" }}>
              {data.frequentlyAskedQuestions.map((q, i) => (
                <li key={i} style={{ fontSize: "12px", color: "#cbd5e1", lineHeight: 1.4 }}>{q}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Top Keywords */}
        {data.topKeywords.length > 0 && (
          <div style={{ padding: "20px", borderRadius: "14px", background: "rgba(16,185,129,0.06)", border: "1px solid rgba(16,185,129,0.15)" }}>
            <div style={{ fontSize: "10px", fontWeight: 800, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em", fontFamily: "'JetBrains Mono', monospace", marginBottom: "12px" }}>
              Top Keywords
            </div>
            <TagList items={data.topKeywords} color="#10b981" />
          </div>
        )}
      </div>
    </section>
  );
};

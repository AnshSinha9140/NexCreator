"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { useApp } from "@/context/AppContext";
import { CreatorDNA, CreatorFeedbackResponse } from "@/lib/creatorDNA/CreatorDNATypes";

interface Props {
  creatorDNA: CreatorDNA | null;
  onNavigate?: (tab: string) => void;
}

function ConfidenceBadge({ value, observedStreams }: { value: number; observedStreams?: number }) {
  if (observedStreams === 0) {
    return (
      <span style={{ fontSize: 10, color: "#cbd5e1", backgroundColor: "rgba(255, 255, 255, 0.08)", padding: "3px 8px", borderRadius: 99, fontWeight: 700 }}>
        Learning Phase
      </span>
    );
  }
  const color = value >= 75 ? "#34d399" : value >= 50 ? "#fbbf24" : "#f87171";
  const bg = value >= 75 ? "rgba(52, 211, 153, 0.1)" : value >= 50 ? "rgba(251, 191, 36, 0.1)" : "rgba(248, 113, 113, 0.1)";
  return (
    <span style={{ fontSize: 10, color, backgroundColor: bg, padding: "3px 8px", borderRadius: 99, fontWeight: 700 }}>
      {value}% Confidence
    </span>
  );
}

export const CreatorDNAView: React.FC<Props> = ({ creatorDNA, onNavigate }) => {
  const { theme } = useApp();
  const isDark = theme === "dark";

  const cardStyle: React.CSSProperties = {
    background: isDark ? "rgba(15, 23, 42, 0.65)" : "#ffffff",
    backdropFilter: "blur(12px)",
    border: isDark ? "1px solid rgba(255, 255, 255, 0.08)" : "1px solid #e2e8f0",
    borderRadius: 16,
    padding: 24,
    boxShadow: isDark ? "0 8px 32px rgba(0, 0, 0, 0.3)" : "0 1px 3px rgba(0, 0, 0, 0.05)",
  };

  const labelStyle: React.CSSProperties = {
    color: isDark ? "#94a3b8" : "#64748b",
    textTransform: "uppercase",
    letterSpacing: "1.2px",
    fontSize: 11,
    fontWeight: 700,
  };

  const [dna, setDNA] = useState(creatorDNA);
  const [busy, setBusy] = useState<string | null>(null);

  if (!dna) {
    return (
      <div style={{ ...cardStyle, color: isDark ? "#94a3b8" : "#64748b", textAlign: "center", padding: "40px" }}>
        🧬 Creator DNA is being generated after your onboarding alignment.
      </div>
    );
  }

  const giveFeedback = async (field: string, response: CreatorFeedbackResponse) => {
    setBusy(`${field}:${response}`);
    try {
      const res = await fetch("/api/creator/identity/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ field, response }),
      });
      const result = await res.json();
      if (result.success) {
        setDNA(result.creatorDNA);
      }
    } catch (err) {
      console.error("Failed to save creator DNA feedback", err);
    } finally {
      setBusy(null);
    }
  };

  const renderFeedbackButtons = (field: string) => {
    const options: Array<{ label: string; value: CreatorFeedbackResponse; color: string }> = [
      { label: "Agree", value: "agree", color: "rgba(52, 211, 153, 0.15)" },
      { label: "Disagree", value: "disagree", color: "rgba(248, 113, 113, 0.15)" },
      { label: "Needs Evidence", value: "needs_more_evidence", color: "rgba(251, 191, 36, 0.15)" },
    ];
    return (
      <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
        {options.map((opt) => (
          <button
            key={opt.value}
            disabled={!!busy}
            onClick={() => giveFeedback(field, opt.value)}
            style={{
              cursor: "pointer",
              border: isDark ? "1px solid rgba(255, 255, 255, 0.1)" : "1px solid #cbd5e1",
              borderRadius: 8,
              background: opt.color,
              color: isDark ? "#cbd5e1" : "#334155",
              fontSize: 11,
              fontWeight: 600,
              padding: "6px 12px",
              transition: "all 0.2s ease",
            }}
          >
            {busy === `${field}:${opt.value}` ? "Updating..." : opt.label}
          </button>
        ))}
      </div>
    );
  };

  const isLearning = dna.observedStreams === 0;
  const displayConfidence = isLearning ? "35% (Learning Phase)" : `${Math.round((dna.identity.primaryCreatorType.confidence + dna.audienceRelationship.confidence) / 2)}%`;

  const stats = [
    { label: "Overall Confidence", value: displayConfidence },
    { label: "Observed Streams", value: dna.observedStreams },
    { label: "Hours Watched", value: `${dna.hoursWatched.toFixed(1)} hrs` },
    { label: "Messages Analyzed", value: dna.messagesAnalyzed.toLocaleString() },
    { label: "Last Refined", value: new Date(dna.updatedAt).toLocaleDateString() },
  ];

  const identityFields = [
    { label: "Primary Creator Type", key: "primaryCreatorType", item: dna.identity.primaryCreatorType },
    { label: "Secondary Creator Type", key: "secondaryCreatorType", item: dna.identity.secondaryCreatorType },
    { label: "Creator Archetype", key: "creatorArchetype", item: dna.identity.creatorArchetype },
    { label: "Brand Personality", key: "brandPersonality", item: dna.identity.brandPersonality },
    { label: "Communication Style", key: "communicationStyle", item: dna.identity.communicationStyle },
    { label: "Humor Style", key: "humorStyle", item: dna.identity.humorStyle },
    { label: "Storytelling Style", key: "storytellingStyle", item: dna.identity.storytellingStyle },
    { label: "Editing Style", key: "editingStyle", item: dna.identity.editingStyle },
  ];

  const sliders = [
    { left: "Calm 🧘", right: "⚡ Chaotic", field: "personality.energyLevel", attr: dna.personality.energyLevel },
    { left: "Serious 🧐", right: "🎭 Funny", field: "personality.creativeStyle", attr: dna.personality.creativeStyle },
    { left: "Gameplay 🎮", right: "💬 Conversation", field: "personality.interactionStyle", attr: dna.personality.interactionStyle },
    { left: "Competitive 🏆", right: "🎪 Entertainer", field: "personality.riskTolerance", attr: dna.personality.riskTolerance },
    { left: "Solo 👤", right: "👥 Community", field: "personality.interactionStyle", attr: dna.personality.interactionStyle },
    { left: "Analytical 📊", right: "⚡ Spontaneous", field: "personality.decisionMakingStyle", attr: dna.personality.decisionMakingStyle },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      style={{ maxWidth: 1200, margin: "0 auto", color: isDark ? "#f8fafc" : "#0f172a", display: "flex", flexDirection: "column", gap: 24 }}
    >
      {/* Living Creator DNA Stats Summary */}
      <section style={{ ...cardStyle, background: isDark ? "linear-gradient(135deg, rgba(147, 51, 234, 0.15) 0%, rgba(15, 23, 42, 0.9) 100%)" : "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
          <div>
            <span style={labelStyle}>AI Manager Intelligence Layer</span>
            <h1 style={{ fontSize: 32, fontWeight: 800, margin: "6px 0", letterSpacing: "-0.5px", color: isDark ? "#f8fafc" : "#0f172a" }}>🧬 Living Creator DNA</h1>
            <p style={{ color: isDark ? "#94a3b8" : "#475569", margin: 0, fontSize: 14 }}>
              A living intelligence log representing your core creative brand. Refined automatically with every stream monitored.
            </p>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button
              onClick={() => onNavigate?.("mission")}
              style={{
                backgroundColor: "#a855f7",
                color: "#fff",
                border: "none",
                borderRadius: 10,
                padding: "10px 18px",
                fontWeight: 700,
                fontSize: 13,
                cursor: "pointer",
                boxShadow: "0 4px 12px rgba(168, 85, 247, 0.3)",
              }}
            >
              View Mission 🎯
            </button>
            <button
              onClick={() => onNavigate?.("reports")}
              style={{
                backgroundColor: isDark ? "rgba(255, 255, 255, 0.08)" : "#f1f5f9",
                color: isDark ? "#e2e8f0" : "#1e293b",
                border: isDark ? "1px solid rgba(255, 255, 255, 0.12)" : "1px solid #cbd5e1",
                borderRadius: 10,
                padding: "10px 18px",
                fontWeight: 700,
                fontSize: 13,
                cursor: "pointer",
              }}
            >
              View Reports 📁
            </button>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12, marginTop: 24 }}>
          {stats.map((s) => (
            <div key={s.label} style={{ background: isDark ? "rgba(0, 0, 0, 0.25)" : "#f8fafc", border: isDark ? "1px solid rgba(255, 255, 255, 0.04)" : "1px solid #e2e8f0", borderRadius: 12, padding: 16 }}>
              <div style={{ ...labelStyle, fontSize: 9 }}>{s.label}</div>
              <div style={{ fontSize: 16, fontWeight: 800, color: isDark ? "#e9d5ff" : "#9333ea", marginTop: 4 }}>{s.value}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Identity Cards */}
      <section style={cardStyle}>
        <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 16, color: isDark ? "#f8fafc" : "#0f172a" }}>Identity Dimensions</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16 }}>
          {identityFields.map((field) => (
            <div key={field.label} style={{ background: isDark ? "rgba(0,0,0,0.15)" : "#f8fafc", borderRadius: 12, border: isDark ? "1px solid rgba(255,255,255,0.03)" : "1px solid #e2e8f0", padding: 16, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              <div>
                <span style={{ ...labelStyle, fontSize: 9 }}>{field.label}</span>
                <div style={{ fontSize: 16, fontWeight: 700, margin: "6px 0", color: isDark ? "#f1f5f9" : "#0f172a" }}>
                  {field.item.value || "Analyzing streams..."}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
                  <ConfidenceBadge value={field.item.confidence} observedStreams={dna.observedStreams} />
                  <span style={{ fontSize: 10, color: isDark ? "#64748b" : "#64748b" }}>{field.item.observationCount} Obs</span>
                </div>
              </div>
              {renderFeedbackButtons(`identity.${field.key}`)}
            </div>
          ))}
        </div>
      </section>

      {/* Personality Sliders */}
      <section style={cardStyle}>
        <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 16, color: isDark ? "#f8fafc" : "#0f172a" }}>Personality & Brand Spectrum</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 20 }}>
          {sliders.map((s, idx) => (
            <div key={idx} style={{ background: isDark ? "rgba(0,0,0,0.15)" : "#f8fafc", padding: 16, borderRadius: 12, border: isDark ? "1px solid rgba(255,255,255,0.03)" : "1px solid #e2e8f0" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, fontWeight: 700, marginBottom: 8, color: isDark ? "#cbd5e1" : "#334155" }}>
                <span>{s.left}</span>
                <span>{s.right}</span>
              </div>
              <div style={{ height: 8, background: isDark ? "rgba(255,255,255,0.1)" : "#e2e8f0", borderRadius: 4, position: "relative" }}>
                <div
                  style={{
                    position: "absolute",
                    left: `${s.attr.value}%`,
                    top: -4,
                    width: 16,
                    height: 16,
                    borderRadius: "50%",
                    backgroundColor: "#a855f7",
                    border: "2px solid #fff",
                    boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
                    transform: "translateX(-50%)",
                  }}
                />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8 }}>
                <span style={{ fontSize: 10, color: isDark ? "#64748b" : "#64748b" }}>Value: {s.attr.value}/100</span>
                <ConfidenceBadge value={s.attr.confidence} observedStreams={dna.observedStreams} />
              </div>
            </div>
          ))}
        </div>
      </section>
    </motion.div>
  );
};

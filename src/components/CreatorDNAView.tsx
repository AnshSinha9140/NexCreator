"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { CreatorDNA, CreatorFeedbackResponse } from "@/lib/creatorDNA/CreatorDNATypes";

interface Props {
  creatorDNA: CreatorDNA | null;
  onNavigate?: (tab: string) => void;
}

const cardStyle: React.CSSProperties = {
  background: "rgba(15, 23, 42, 0.65)",
  backdropFilter: "blur(12px)",
  border: "1px solid rgba(255, 255, 255, 0.08)",
  borderRadius: 16,
  padding: 24,
  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
};

const labelStyle: React.CSSProperties = {
  color: "#94a3b8",
  textTransform: "uppercase",
  letterSpacing: "1.2px",
  fontSize: 11,
  fontWeight: 700,
};

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
  const [dna, setDNA] = useState(creatorDNA);
  const [busy, setBusy] = useState<string | null>(null);

  if (!dna) {
    return (
      <div style={{ ...cardStyle, color: "#94a3b8", textAlign: "center", padding: "40px" }}>
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
              border: "1px solid rgba(255, 255, 255, 0.1)",
              borderRadius: 8,
              background: opt.color,
              color: "#cbd5e1",
              fontSize: 11,
              fontWeight: 600,
              padding: "6px 12px",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.25)")}
            onMouseLeave={(e) => (e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.1)")}
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
    { left: "Solo 👤", right: "👥 Community", field: "personality.interactionStyle", attr: dna.personality.interactionStyle }, // fallback mapped to interactionStyle
    { left: "Analytical 📊", right: "⚡ Spontaneous", field: "personality.decisionMakingStyle", attr: dna.personality.decisionMakingStyle },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      style={{ maxWidth: 1200, margin: "0 auto", color: "#f8fafc", display: "flex", flexDirection: "column", gap: 24 }}
    >
      {/* living Creator DNA Stats Summary */}
      <section style={{ ...cardStyle, background: "linear-gradient(135deg, rgba(147, 51, 234, 0.15) 0%, rgba(15, 23, 42, 0.9) 100%)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
          <div>
            <span style={labelStyle}>AI Manager Intelligence Layer</span>
            <h1 style={{ fontSize: 32, fontWeight: 800, margin: "6px 0", letterSpacing: "-0.5px" }}>🧬 Living Creator DNA</h1>
            <p style={{ color: "#94a3b8", margin: 0, fontSize: 14 }}>
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
                backgroundColor: "rgba(255, 255, 255, 0.08)",
                color: "#e2e8f0",
                border: "1px solid rgba(255, 255, 255, 0.12)",
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
            <div key={s.label} style={{ background: "rgba(0, 0, 0, 0.25)", border: "1px solid rgba(255, 255, 255, 0.04)", borderRadius: 12, padding: 16 }}>
              <div style={{ ...labelStyle, fontSize: 9 }}>{s.label}</div>
              <div style={{ fontSize: 16, fontWeight: 800, color: "#e9d5ff", marginTop: 4 }}>{s.value}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Identity Cards */}
      <section style={cardStyle}>
        <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 16 }}>Identity Dimensions</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16 }}>
          {identityFields.map((field) => (
            <div key={field.label} style={{ background: "rgba(0,0,0,0.15)", borderRadius: 12, border: "1px solid rgba(255,255,255,0.03)", padding: 16, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              <div>
                <span style={{ ...labelStyle, fontSize: 9 }}>{field.label}</span>
                <div style={{ fontSize: 16, fontWeight: 700, margin: "6px 0", color: "#f1f5f9" }}>
                  {field.item.value || "Analyzing streams..."}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
                  <ConfidenceBadge value={field.item.confidence} observedStreams={dna.observedStreams} />
                  <span style={{ fontSize: 10, color: "#64748b" }}>{field.item.observationCount} Obs</span>
                </div>
              </div>
              {renderFeedbackButtons(`identity.${field.key}`)}
            </div>
          ))}
        </div>
      </section>

      {/* Creator Personality Sliders */}
      <section style={cardStyle}>
        <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 4 }}>Brand Personality Spectrum</h2>
        <p style={{ color: "#94a3b8", fontSize: 13, marginBottom: 20 }}>Based on gameplay pace, dialogue speed, and chat frequency signals.</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 24 }}>
          {sliders.map((s) => (
            <div key={s.left} style={{ background: "rgba(0,0,0,0.15)", borderRadius: 12, border: "1px solid rgba(255,255,255,0.03)", padding: 18 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <span style={{ fontSize: 12, color: "#94a3b8", fontWeight: 600 }}>{s.left}</span>
                <ConfidenceBadge value={s.attr.confidence} observedStreams={dna.observedStreams} />
                <span style={{ fontSize: 12, color: "#94a3b8", fontWeight: 600 }}>{s.right}</span>
              </div>
              
              <div style={{ position: "relative", height: 8, background: "rgba(255,255,255,0.06)", borderRadius: 99, display: "flex", alignItems: "center" }}>
                {/* Visual Sliders Track */}
                <div
                  style={{
                    position: "absolute",
                    left: `${Math.min(50, s.attr.value)}%`,
                    right: `${100 - Math.max(50, s.attr.value)}%`,
                    height: "100%",
                    background: "linear-gradient(90deg, #38bdf8, #a855f7)",
                    borderRadius: 99,
                  }}
                />
                {/* Sliding indicator */}
                <div
                  style={{
                    position: "absolute",
                    left: `${s.attr.value}%`,
                    transform: "translateX(-50%)",
                    width: 16,
                    height: 16,
                    borderRadius: "50%",
                    background: "#fff",
                    boxShadow: "0 0 8px rgba(168, 85, 247, 0.8)",
                    border: "2px solid #a855f7",
                  }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "#64748b", marginTop: 8 }}>
                <span>Observed: {s.attr.observationCount} times</span>
                <span>Value: {s.attr.value}%</span>
              </div>
              {renderFeedbackButtons(s.field)}
            </div>
          ))}
        </div>
      </section>

      {/* Content Pillars */}
      <section style={cardStyle}>
        <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 16 }}>Content Pillars</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16 }}>
          {dna.contentPillars && dna.contentPillars.length ? (
            dna.contentPillars.map((pillar) => (
              <div key={pillar.name} style={{ background: "rgba(0,0,0,0.15)", borderRadius: 12, border: "1px solid rgba(255,255,255,0.03)", padding: 18 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                  <b style={{ fontSize: 14 }}>{pillar.name}</b>
                  <span style={{ fontSize: 11, color: "#34d399", fontWeight: 700, textTransform: "uppercase" }}>{pillar.growth}</span>
                </div>
                <div style={{ height: 6, background: "rgba(255,255,255,0.05)", borderRadius: 99, overflow: "hidden", marginBottom: 8 }}>
                  <div style={{ width: `${pillar.strength}%`, height: "100%", background: "linear-gradient(90deg, #38bdf8, #a855f7)", borderRadius: 99 }} />
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 11 }}>
                  <span style={{ color: "#64748b" }}>Strength: {pillar.strength}%</span>
                  <ConfidenceBadge value={pillar.confidence} observedStreams={dna.observedStreams} />
                </div>
                {renderFeedbackButtons(`contentPillars.${pillar.name}`)}
              </div>
            ))
          ) : (
            <div style={{ color: "#64748b", fontSize: 13 }}>No verified content pillars yet.</div>
          )}
        </div>
      </section>

      {/* Strengths & Developing Areas */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))", gap: 24 }}>
        {/* Natural Strengths */}
        <section style={cardStyle}>
          <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 16 }}>Natural Strengths</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {dna.naturalStrengths.map((s) => (
              <div key={s.name} style={{ background: "rgba(0,0,0,0.15)", borderRadius: 12, border: "1px solid rgba(255,255,255,0.03)", padding: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <b style={{ fontSize: 14 }}>{s.name}</b>
                  <span style={{ color: "#34d399", fontSize: 11, fontWeight: 700, textTransform: "uppercase" }}>{s.trend}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 12 }}>
                  <span style={{ color: "#94a3b8" }}>Observed Score: {s.score}</span>
                  <ConfidenceBadge value={s.confidence} observedStreams={dna.observedStreams} />
                </div>
                {renderFeedbackButtons(`naturalStrengths.${s.name}`)}
              </div>
            ))}
          </div>
        </section>

        {/* Developing Areas */}
        <section style={cardStyle}>
          <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 16 }}>Developing Areas</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {dna.developingAreas.map((s) => (
              <div key={s.name} style={{ background: "rgba(0,0,0,0.15)", borderRadius: 12, border: "1px solid rgba(255,255,255,0.03)", padding: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                  <b style={{ fontSize: 14 }}>{s.name}</b>
                  <span style={{ color: "#fca5a5", fontSize: 11, fontWeight: 700, textTransform: "uppercase" }}>{s.trend}</span>
                </div>
                <p style={{ color: "#94a3b8", fontSize: 12, margin: "6px 0" }}>{s.recommendation || "System is collecting coaching context."}</p>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 12 }}>
                  <span style={{ color: "#64748b" }}>Current level: {s.score}</span>
                  <ConfidenceBadge value={s.confidence} observedStreams={dna.observedStreams} />
                </div>
                {renderFeedbackButtons(`developingAreas.${s.name}`)}
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Advantage & Relationship */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))", gap: 24 }}>
        <section style={cardStyle}>
          <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 6 }}>Unique Creator Advantage</h2>
          <span style={labelStyle}>Evidence-backed answer to &quot;What makes you different?&quot;</span>
          <p style={{ fontSize: 14, color: "#cbd5e1", lineHeight: 1.6, marginTop: 12, minHeight: 60 }}>
            {dna.uniqueCreatorAdvantage.value || "AI Manager is analyzing stream logs to clarify your unique differentiator."}
          </p>
          <div style={{ marginTop: 12 }}>
            <ConfidenceBadge value={dna.uniqueCreatorAdvantage.confidence} observedStreams={dna.observedStreams} />
          </div>
          {renderFeedbackButtons("uniqueCreatorAdvantage")}
        </section>

        <section style={cardStyle}>
          <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 6 }}>Audience Relationship & Expectation</h2>
          <span style={labelStyle}>Why viewers return & emotional connection archetype</span>
          <p style={{ fontSize: 14, color: "#cbd5e1", lineHeight: 1.6, marginTop: 12, minHeight: 60 }}>
            {dna.audienceRelationship.value || "System is analyzing chat activity patterns."}
          </p>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 8 }}>
            {dna.viewerExpectations.value.map((e) => (
              <span key={e} style={{ background: "rgba(56, 189, 248, 0.12)", color: "#38bdf8", padding: "4px 10px", borderRadius: 8, fontSize: 11, fontWeight: 600 }}>
                {e}
              </span>
            ))}
          </div>
          <div style={{ marginTop: 12 }}>
            <ConfidenceBadge value={dna.audienceRelationship.confidence} observedStreams={dna.observedStreams} />
          </div>
          {renderFeedbackButtons("audienceRelationship")}
        </section>
      </div>

      {/* My Creator Evolution timeline */}
      <section style={cardStyle}>
        <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 8 }}>🧠 My Creator Evolution</h2>
        <span style={labelStyle}>Permanent log of brand beliefs & changes over time</span>
        <div style={{ display: "flex", flexDirection: "column", gap: 20, marginTop: 24, borderLeft: "2px solid rgba(168,85,247,0.3)", paddingLeft: 20, marginLeft: 8 }}>
          {dna.evolution && dna.evolution.length ? (
            dna.evolution.slice().reverse().map((event) => (
              <div key={event.id} style={{ position: "relative" }}>
                {/* timeline bullet */}
                <div style={{ position: "absolute", left: -27, top: 4, width: 12, height: 12, borderRadius: "50%", backgroundColor: "#a855f7", border: "2px solid #060810" }} />
                
                <div style={{ fontSize: 12, color: "#c084fc", fontWeight: 700 }}>
                  {new Date(event.timestamp).toLocaleString()}
                </div>
                <div style={{ fontSize: 15, fontWeight: 700, margin: "4px 0", color: "#f8fafc" }}>
                  {event.field}
                </div>
                <div style={{ background: "rgba(0,0,0,0.15)", borderRadius: 8, padding: 12, marginTop: 6, fontSize: 13, color: "#94a3b8", border: "1px solid rgba(255,255,255,0.03)" }}>
                  <div>
                    <span style={{ color: "#fca5a5", fontWeight: 600 }}>Previous Belief:</span> {event.previousBelief}
                  </div>
                  <div style={{ marginTop: 4 }}>
                    <span style={{ color: "#34d399", fontWeight: 600 }}>Refined Belief:</span> {event.currentBelief}
                  </div>
                  {event.evidence && event.evidence.length > 0 && (
                    <div style={{ marginTop: 8, fontSize: 11, color: "#64748b", borderTop: "1px solid rgba(255, 255, 255, 0.05)", paddingTop: 6 }}>
                      <b>Evidence:</b> {event.evidence.map(ev => ev.detail).join(" · ")}
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div style={{ color: "#64748b", fontSize: 13 }}>No major identity adjustments recorded yet.</div>
          )}
        </div>
      </section>
    </motion.div>
  );
};

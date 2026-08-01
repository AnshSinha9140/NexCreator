"use client";

import React from "react";
import { motion } from "framer-motion";
import { CreatorKnowledgeGraph } from "@/lib/creatorKnowledge/types";

interface CreatorDNAViewProps {
  knowledgeGraph: CreatorKnowledgeGraph | null;
}

export const CreatorDNAView: React.FC<CreatorDNAViewProps> = ({ knowledgeGraph }) => {
  if (!knowledgeGraph) {
    return (
      <div style={{ padding: "40px", color: "#94a3b8", textAlign: "center", fontFamily: "'Inter', sans-serif" }}>
        <h2 style={{ fontSize: "20px", color: "#f8fafc", marginBottom: "8px" }}>🧬 Creator DNA</h2>
        <p>No Living Creator Model has been initialized yet. Complete your Alignment Session to generate your profile.</p>
      </div>
    );
  }

  const containerStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    gap: "32px",
    fontFamily: "'Inter', sans-serif",
    color: "#f8fafc",
    maxWidth: "1000px",
    margin: "0 auto",
  };

  const sectionStyle: React.CSSProperties = {
    background: "rgba(13, 17, 30, 0.65)",
    backdropFilter: "blur(20px)",
    border: "1px solid rgba(255, 255, 255, 0.08)",
    borderRadius: "20px",
    padding: "32px",
    display: "flex",
    flexDirection: "column",
    gap: "20px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
  };

  const titleStyle: React.CSSProperties = {
    fontSize: "22px",
    fontWeight: "900",
    color: "#c084fc",
    margin: 0,
    display: "flex",
    alignItems: "center",
    gap: "10px",
  };

  const gridStyle: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "20px",
  };

  const cardStyle: React.CSSProperties = {
    background: "rgba(0, 0, 0, 0.25)",
    border: "1px solid rgba(255, 255, 255, 0.04)",
    borderRadius: "14px",
    padding: "20px",
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      style={containerStyle}
    >
      {/* Page Header */}
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontSize: "24px" }}>🧬</span>
          <span style={{ fontSize: "11px", fontWeight: "800", color: "#a855f7", textTransform: "uppercase", letterSpacing: "1.5px" }}>
            NexCreator Living Model
          </span>
        </div>
        <h1 style={{ fontSize: "28px", fontWeight: "900", margin: "4px 0 0", color: "#f8fafc" }}>
          Your Creator DNA
        </h1>
        <p style={{ margin: "6px 0 0", fontSize: "14px", color: "#94a3b8" }}>
          How I observe, understand, and coach you. This model updates dynamically as we work together.
        </p>
      </div>

      {/* 1. Who I Think You Are */}
      <div style={sectionStyle}>
        <h2 style={titleStyle}><span>👤</span> Who I Think You Are</h2>
        <div style={gridStyle}>
          <div style={cardStyle}>
            <span style={{ fontSize: "10px", fontWeight: 800, color: "#64748b", textTransform: "uppercase" }}>Primary Identity</span>
            <span style={{ fontSize: "15px", fontWeight: 700, color: "#cbd5e1" }}>{knowledgeGraph.creatorIdentity.primaryIdentity}</span>
          </div>
          <div style={cardStyle}>
            <span style={{ fontSize: "10px", fontWeight: 800, color: "#64748b", textTransform: "uppercase" }}>Secondary Identity</span>
            <span style={{ fontSize: "15px", fontWeight: 700, color: "#cbd5e1" }}>{knowledgeGraph.creatorIdentity.secondaryIdentity}</span>
          </div>
          <div style={cardStyle}>
            <span style={{ fontSize: "10px", fontWeight: 800, color: "#64748b", textTransform: "uppercase" }}>Hidden Identity</span>
            <span style={{ fontSize: "15px", fontWeight: 700, color: "#cbd5e1" }}>{knowledgeGraph.creatorIdentity.hiddenIdentity}</span>
          </div>
        </div>
        <div style={{ fontSize: "11px", color: "#64748b", fontFamily: "monospace" }}>
          Confidence: {knowledgeGraph.creatorIdentity.confidence}% (Based on {knowledgeGraph.creatorIdentity.evidence.length} evidence sources)
        </div>
      </div>

      {/* 2. What Drives You */}
      <div style={sectionStyle}>
        <h2 style={titleStyle}><span>🔥</span> What Drives You</h2>
        <div style={gridStyle}>
          <div style={cardStyle}>
            <span style={{ fontSize: "10px", fontWeight: 800, color: "#64748b", textTransform: "uppercase" }}>Primary Motivation</span>
            <span style={{ fontSize: "15px", fontWeight: 700, color: "#38bdf8" }}>{knowledgeGraph.creatorMotivations.primaryMotivation}</span>
          </div>
          <div style={cardStyle}>
            <span style={{ fontSize: "10px", fontWeight: 800, color: "#64748b", textTransform: "uppercase" }}>Secondary Motivation</span>
            <span style={{ fontSize: "15px", fontWeight: 700, color: "#38bdf8" }}>{knowledgeGraph.creatorMotivations.secondaryMotivation}</span>
          </div>
          <div style={cardStyle}>
            <span style={{ fontSize: "10px", fontWeight: 800, color: "#64748b", textTransform: "uppercase" }}>Core Values</span>
            <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginTop: "4px" }}>
              {knowledgeGraph.creatorValues.values.map(v => (
                <span key={v.value} style={{ fontSize: "12px", background: "rgba(56,189,248,0.1)", border: "1px solid rgba(56,189,248,0.2)", padding: "2px 8px", borderRadius: "6px", color: "#38bdf8" }}>
                  {v.value}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 3. What You're Building */}
      <div style={sectionStyle}>
        <h2 style={titleStyle}><span>🚀</span> What You're Building</h2>
        <div style={gridStyle}>
          <div style={{ ...cardStyle, gridColumn: "span 2" }}>
            <span style={{ fontSize: "10px", fontWeight: 800, color: "#64748b", textTransform: "uppercase" }}>Success Definition</span>
            <span style={{ fontSize: "14px", color: "#e2e8f0", lineHeight: "1.5" }}>{knowledgeGraph.successDefinition.definition}</span>
          </div>
          <div style={cardStyle}>
            <span style={{ fontSize: "10px", fontWeight: 800, color: "#64748b", textTransform: "uppercase" }}>Growth Priorities</span>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginTop: "4px" }}>
              {knowledgeGraph.growthPriorities.map((p, i) => (
                <span key={p} style={{ fontSize: "13px", color: "#e2e8f0" }}>
                  <strong style={{ color: "#a855f7" }}>{i + 1}.</strong> {p}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 4. What Worries You */}
      <div style={sectionStyle}>
        <h2 style={titleStyle}><span>⚠️</span> What Worries You</h2>
        <div style={gridStyle}>
          <div style={cardStyle}>
            <span style={{ fontSize: "10px", fontWeight: 800, color: "#64748b", textTransform: "uppercase" }}>Creator Fears</span>
            {knowledgeGraph.creatorFears.fears.map((f, i) => (
              <div key={i} style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                <span style={{ fontSize: "13px", color: "#f87171" }}>• {f.fear}</span>
                <span style={{ fontSize: "11px", color: "#64748b" }}>Underlying: {f.hiddenFear}</span>
              </div>
            ))}
          </div>
          <div style={cardStyle}>
            <span style={{ fontSize: "10px", fontWeight: 800, color: "#64748b", textTransform: "uppercase" }}>Sensitive Topics</span>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginTop: "4px" }}>
              {knowledgeGraph.sensitiveTopics.map(t => (
                <span key={t} style={{ fontSize: "13px", color: "#cbd5e1" }}>
                  • {t}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 5. What Makes You Shine */}
      <div style={sectionStyle}>
        <h2 style={titleStyle}><span>✨</span> What Makes You Shine</h2>
        <div style={cardStyle}>
          <span style={{ fontSize: "10px", fontWeight: 800, color: "#64748b", textTransform: "uppercase" }}>Creative Energy Spike Elements</span>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginTop: "4px" }}>
            {knowledgeGraph.creativeEnergy.feelsAliveWhen.map(e => (
              <span key={e} style={{ fontSize: "14px", color: "#34d399" }}>
                ✓ {e}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* 6. Where I Think You're Underrated */}
      <div style={sectionStyle}>
        <h2 style={titleStyle}><span>🕵️</span> Where I Think You're Underrated</h2>
        <div style={cardStyle}>
          <span style={{ fontSize: "10px", fontWeight: 800, color: "#64748b", textTransform: "uppercase" }}>AI Inferred Blind Spots</span>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginTop: "4px" }}>
            {knowledgeGraph.blindSpots.blindSpots.map(b => (
              <span key={b} style={{ fontSize: "14px", color: "#fbbf24" }}>
                ⚠️ {b}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* 7. Beliefs I'm Still Testing */}
      <div style={sectionStyle}>
        <h2 style={titleStyle}><span>🔬</span> Beliefs I'm Still Testing</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          {knowledgeGraph.managerHypotheses.length > 0 ? (
            knowledgeGraph.managerHypotheses.map(h => (
              <div key={h.id} style={{ ...cardStyle, borderLeft: "4px solid #a855f7" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "13px", fontWeight: 700, color: "#e2e8f0" }}>{h.belief}</span>
                  <span style={{ fontSize: "11px", background: "rgba(168,85,247,0.15)", color: "#c084fc", padding: "2px 8px", borderRadius: "4px" }}>
                    {h.status}
                  </span>
                </div>
                <span style={{ fontSize: "11px", color: "#64748b" }}>Validation Path: {h.futureValidation}</span>
              </div>
            ))
          ) : (
            <div style={{ color: "#64748b", fontSize: "13px" }}>No active hypotheses currently pending test.</div>
          )}
        </div>
      </div>

      {/* 8. How My Understanding Has Changed */}
      <div style={sectionStyle}>
        <h2 style={titleStyle}><span>📈</span> How My Understanding Has Changed</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "16px", borderLeft: "2px solid rgba(255,255,255,0.06)", marginLeft: "10px", paddingLeft: "20px" }}>
          {/* Milestone 1: Alignment */}
          <div style={{ position: "relative" }}>
            <div style={{ position: "absolute", left: "-27px", top: "4px", width: "12px", height: "12px", borderRadius: "50%", background: "#a855f7", border: "2px solid #060810" }} />
            <div style={{ fontSize: "12px", color: "#a855f7", fontWeight: 800 }}>MONTH 1</div>
            <div style={{ fontSize: "14px", fontWeight: 700, color: "#cbd5e1", marginTop: "2px" }}>Initial Alignment Complete</div>
            <div style={{ fontSize: "12px", color: "#64748b" }}>Setup initial coaching vectors and personal baseline.</div>
          </div>

          {knowledgeGraph.evolutionHistory.map((h, i) => (
            <div key={i} style={{ position: "relative" }}>
              <div style={{ position: "absolute", left: "-27px", top: "4px", width: "12px", height: "12px", borderRadius: "50%", background: "#10b981", border: "2px solid #060810" }} />
              <div style={{ fontSize: "12px", color: "#10b981", fontWeight: 800 }}>MONTH {i + 2}</div>
              <div style={{ fontSize: "14px", fontWeight: 700, color: "#cbd5e1", marginTop: "2px" }}>Updated: {h.field}</div>
              <div style={{ fontSize: "12px", color: "#64748b" }}>{h.reason}</div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

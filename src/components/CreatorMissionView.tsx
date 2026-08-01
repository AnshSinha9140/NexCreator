"use client";

import React from "react";
import { motion } from "framer-motion";
import { CreatorMissionData } from "@/lib/creatorMission/types";
import { CreatorKnowledgeGraph } from "@/lib/creatorKnowledge/types";

interface CreatorMissionViewProps {
  creatorMission: CreatorMissionData | null;
  knowledgeGraph: CreatorKnowledgeGraph | null;
}

export const CreatorMissionView: React.FC<CreatorMissionViewProps> = ({
  creatorMission,
  knowledgeGraph,
}) => {
  if (!creatorMission) {
    return (
      <div style={{ padding: "40px", color: "#94a3b8", textAlign: "center", fontFamily: "'Inter', sans-serif" }}>
        <h2 style={{ fontSize: "20px", color: "#f8fafc", marginBottom: "8px" }}>🧭 Mission Workspace</h2>
        <p>No Mission Workspace data has been initialized yet. Complete your Alignment Session to generate your career compass.</p>
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

  const compassHeroStyle: React.CSSProperties = {
    background: "linear-gradient(135deg, rgba(147, 51, 234, 0.15) 0%, rgba(99, 102, 241, 0.15) 100%)",
    border: "1px solid rgba(168, 85, 247, 0.35)",
    borderRadius: "24px",
    padding: "36px",
    display: "flex",
    flexDirection: "column",
    gap: "24px",
    boxShadow: "0 20px 40px rgba(0,0,0,0.4)",
  };

  const gridStyle: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "20px",
  };

  const cardStyle: React.CSSProperties = {
    background: "rgba(0,0,0,0.25)",
    padding: "20px",
    borderRadius: "14px",
    border: "1px solid rgba(255,255,255,0.05)",
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
          <span style={{ fontSize: "24px" }}>🧭</span>
          <span style={{ fontSize: "11px", fontWeight: "800", color: "#a855f7", textTransform: "uppercase", letterSpacing: "1.5px" }}>
            NexCreator Career Compass
          </span>
        </div>
        <h1 style={{ fontSize: "28px", fontWeight: "900", margin: "4px 0 0", color: "#f8fafc" }}>
          Mission Workspace
        </h1>
        <p style={{ margin: "6px 0 0", fontSize: "14px", color: "#94a3b8" }}>
          Protecting and directing your long-term creative mission.
        </p>
      </div>

      {/* Career Compass Hero Card */}
      <div style={compassHeroStyle}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ fontSize: "24px" }}>🧭</span>
          <h2 style={{ margin: 0, fontSize: "20px", fontWeight: "900", color: "#f8fafc" }}>
            Manager Compass
          </h2>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "20px" }}>
          <div style={{ background: "rgba(0,0,0,0.3)", padding: "20px", borderRadius: "16px", border: "1px solid rgba(255,255,255,0.04)" }}>
            <span style={{ fontSize: "11px", fontWeight: 800, color: "#10b981", textTransform: "uppercase", display: "block", marginBottom: "8px" }}>
              Biggest Opportunity
            </span>
            <p style={{ margin: 0, fontSize: "14px", color: "#cbd5e1", lineHeight: "1.5" }}>
              {creatorMission.careerCompass.biggestOpportunity}
            </p>
          </div>

          <div style={{ background: "rgba(0,0,0,0.3)", padding: "20px", borderRadius: "16px", border: "1px solid rgba(255,255,255,0.04)" }}>
            <span style={{ fontSize: "11px", fontWeight: 800, color: "#f87171", textTransform: "uppercase", display: "block", marginBottom: "8px" }}>
              One Thing to Protect
            </span>
            <p style={{ margin: 0, fontSize: "14px", color: "#cbd5e1", lineHeight: "1.5" }}>
              {creatorMission.careerCompass.protectThing}
            </p>
          </div>

          <div style={{ background: "rgba(0,0,0,0.3)", padding: "20px", borderRadius: "16px", border: "1px solid rgba(255,255,255,0.04)" }}>
            <span style={{ fontSize: "11px", fontWeight: 800, color: "#a855f7", textTransform: "uppercase", display: "block", marginBottom: "8px" }}>
              Long-term Reminder
            </span>
            <p style={{ margin: 0, fontSize: "14px", color: "#cbd5e1", lineHeight: "1.5", fontStyle: "italic" }}>
              "{creatorMission.careerCompass.longTermReminder}"
            </p>
          </div>
        </div>
      </div>

      {/* My Mission & Why It Matters */}
      <div style={sectionStyle}>
        <h2 style={titleStyle}><span>🎯</span> My Mission</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <div style={{ background: "rgba(0,0,0,0.2)", padding: "24px", borderRadius: "16px", borderLeft: "4px solid #a855f7" }}>
            <span style={{ fontSize: "10px", fontWeight: 800, color: "#64748b", textTransform: "uppercase", display: "block", marginBottom: "4px" }}>
              Statement
            </span>
            <span style={{ fontSize: "18px", fontWeight: 800, color: "#f8fafc" }}>
              "{creatorMission.mission.statement}"
            </span>
          </div>
          <div>
            <span style={{ fontSize: "10px", fontWeight: 800, color: "#64748b", textTransform: "uppercase", display: "block", marginBottom: "4px" }}>
              Why It Matters
            </span>
            <p style={{ margin: 0, fontSize: "14px", color: "#cbd5e1", lineHeight: "1.6" }}>
              {creatorMission.mission.reason}
            </p>
          </div>
        </div>
      </div>

      {/* Success Definitions */}
      <div style={sectionStyle}>
        <h2 style={titleStyle}><span>🏆</span> Defining Success</h2>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
          <div style={{ background: "rgba(0,0,0,0.25)", padding: "20px", borderRadius: "14px", border: "1px solid rgba(255,255,255,0.05)" }}>
            <span style={{ fontSize: "10px", fontWeight: 800, color: "#64748b", textTransform: "uppercase", display: "block", marginBottom: "6px" }}>
              How You Define Success
            </span>
            <p style={{ margin: 0, fontSize: "14px", color: "#cbd5e1", lineHeight: "1.5" }}>
              {creatorMission.successDefinition.creatorDefinition}
            </p>
          </div>
          <div style={{ background: "rgba(147,51,234,0.04)", padding: "20px", borderRadius: "14px", border: "1px solid rgba(147,51,234,0.15)" }}>
            <span style={{ fontSize: "10px", fontWeight: 800, color: "#a855f7", textTransform: "uppercase", display: "block", marginBottom: "6px" }}>
              How My AI Manager Defines Success
            </span>
            <p style={{ margin: 0, fontSize: "14px", color: "#cbd5e1", lineHeight: "1.5" }}>
              {creatorMission.successDefinition.aiDefinition}
            </p>
          </div>
        </div>
      </div>

      {/* Things We're Working Through / Contradictions */}
      <div style={sectionStyle}>
        <h2 style={titleStyle}><span>⚖️</span> Things We're Working Through</h2>
        <p style={{ margin: 0, fontSize: "14px", color: "#94a3b8", lineHeight: "1.5" }}>
          Contradictions represent gaps between your expressed values and observed behaviors. We approach these with constructive coaching.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginTop: "8px" }}>
          {creatorMission.contradictions.map(c => (
            <div key={c.id} style={{ background: "rgba(0,0,0,0.25)", padding: "24px", borderRadius: "16px", border: "1px solid rgba(255,255,255,0.04)", display: "flex", flexDirection: "column", gap: "12px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "8px" }}>
                <span style={{ fontSize: "15px", fontWeight: 800, color: "#f8fafc" }}>{c.title}</span>
                <span style={{ fontSize: "11px", background: "rgba(251,191,36,0.12)", color: "#fbbf24", padding: "2px 8px", borderRadius: "6px", border: "1px solid rgba(251,191,36,0.25)" }}>
                  {c.status}
                </span>
              </div>
              <p style={{ margin: 0, fontSize: "13px", color: "#cbd5e1", lineHeight: "1.5" }}>{c.description}</p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", fontSize: "12px", background: "rgba(0,0,0,0.15)", padding: "14px", borderRadius: "10px" }}>
                <div>
                  <span style={{ color: "#a855f7", fontWeight: 700, display: "block" }}>Your Statement:</span>
                  <span style={{ color: "#94a3b8" }}>"{c.creatorStatement}"</span>
                </div>
                <div>
                  <span style={{ color: "#fbbf24", fontWeight: 700, display: "block" }}>Observed Behaviour:</span>
                  <span style={{ color: "#94a3b8" }}>{c.observedBehaviour}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Decision Framework */}
      <div style={sectionStyle}>
        <h2 style={titleStyle}><span>🧠</span> Decision Framework</h2>
        <div style={gridStyle}>
          <div style={cardStyle}>
            <span style={{ fontSize: "10px", fontWeight: 800, color: "#64748b", textTransform: "uppercase" }}>Decision Priorities</span>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginTop: "4px" }}>
              {creatorMission.decisionFramework.priorities.map(p => (
                <span key={p} style={{ fontSize: "13px", color: "#cbd5e1" }}>• {p}</span>
              ))}
            </div>
          </div>
          <div style={cardStyle}>
            <span style={{ fontSize: "10px", fontWeight: 800, color: "#64748b", textTransform: "uppercase" }}>Tradeoffs</span>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginTop: "4px" }}>
              {creatorMission.decisionFramework.tradeoffs.map(t => (
                <span key={t} style={{ fontSize: "13px", color: "#cbd5e1" }}>• {t}</span>
              ))}
            </div>
          </div>
          <div style={cardStyle}>
            <span style={{ fontSize: "10px", fontWeight: 800, color: "#64748b", textTransform: "uppercase" }}>Known Sacrifices</span>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginTop: "4px" }}>
              {creatorMission.decisionFramework.knownSacrifices.map(s => (
                <span key={s} style={{ fontSize: "13px", color: "#cbd5e1" }}>• {s}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Mission Timeline */}
      <div style={sectionStyle}>
        <h2 style={titleStyle}><span>📈</span> Mission Timeline</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "16px", borderLeft: "2px solid rgba(255,255,255,0.06)", marginLeft: "10px", paddingLeft: "20px" }}>
          {creatorMission.evolutionTimeline.map((e, idx) => (
            <div key={idx} style={{ position: "relative" }}>
              <div style={{ position: "absolute", left: "-27px", top: "4px", width: "12px", height: "12px", borderRadius: "50%", background: "#a855f7", border: "2px solid #060810" }} />
              <div style={{ fontSize: "12px", color: "#a855f7", fontWeight: 800 }}>{new Date(e.timestamp).toLocaleDateString()}</div>
              <div style={{ fontSize: "14px", fontWeight: 700, color: "#cbd5e1", marginTop: "2px" }}>{e.causedBy}</div>
              <div style={{ fontSize: "12px", color: "#64748b", marginTop: "2px" }}>
                <strong>New Mission:</strong> {e.newMission}<br />
                {e.reasonForChange}
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

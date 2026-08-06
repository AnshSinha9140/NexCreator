"use client";

import React from "react";
import { motion } from "framer-motion";
import { useApp } from "@/context/AppContext";
import { CreatorMissionData } from "@/lib/creatorMission/types";
import { CreatorKnowledgeGraph } from "@/lib/creatorKnowledge/types";

interface Props {
  creatorMission: CreatorMissionData | null;
  knowledgeGraph: CreatorKnowledgeGraph | null;
  onNavigate?: (tab: string) => void;
}

function StatusBadge({ status }: { status: "complete" | "current" | "upcoming" }) {
  const { theme } = useApp();
  const isDark = theme === "dark";

  const color = status === "complete" ? (isDark ? "#34d399" : "#059669") : status === "current" ? (isDark ? "#c084fc" : "#9333ea") : (isDark ? "#94a3b8" : "#64748b");
  const bg = status === "complete" ? (isDark ? "rgba(52, 211, 153, 0.1)" : "rgba(16, 185, 129, 0.1)") : status === "current" ? (isDark ? "rgba(168, 85, 247, 0.1)" : "rgba(168, 85, 247, 0.1)") : (isDark ? "rgba(148, 163, 184, 0.1)" : "#f1f5f9");
  return (
    <span style={{ fontSize: 10, color, backgroundColor: bg, padding: "3px 8px", borderRadius: 99, fontWeight: 700, textTransform: "uppercase" }}>
      {status}
    </span>
  );
}

export const CreatorMissionView: React.FC<Props> = ({ creatorMission: mission, onNavigate }) => {
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

  if (!mission) {
    return (
      <div style={{ ...cardStyle, color: isDark ? "#94a3b8" : "#64748b", textAlign: "center", padding: "40px" }}>
        🎯 Creator Mission is being synthesized from your onboarding alignment and deep research.
      </div>
    );
  }

  const nextMilestone = mission.milestones.find((item) => item.status === "current") || mission.milestones.find((item) => item.status === "upcoming");

  const stats = [
    { label: "Mission Progress", value: `${mission.missionProgress}%` },
    { label: "Current Phase", value: mission.currentPhase || "Foundation" },
    { label: "Next Milestone", value: nextMilestone?.title || "Awaiting Roadmap" },
    { label: "Confidence", value: `${mission.missionConfidence}%` },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      style={{ maxWidth: 1200, margin: "0 auto", color: isDark ? "#f8fafc" : "#0f172a", display: "flex", flexDirection: "column", gap: 24 }}
    >
      {/* 🎯 Creator Mission Header */}
      <section style={{ ...cardStyle, background: isDark ? "linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(15, 23, 42, 0.9) 100%)" : "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
          <div>
            <span style={labelStyle}>Strategic Identity & Blueprint</span>
            <h1 style={{ fontSize: 32, fontWeight: 800, margin: "6px 0", letterSpacing: "-0.5px", color: isDark ? "#f8fafc" : "#0f172a" }}>🎯 Creator Mission</h1>
            <p style={{ color: isDark ? "#e2e8f0" : "#1e293b", fontSize: 16, maxWidth: 800, lineHeight: 1.5, marginTop: 10, fontWeight: 500 }}>
              {mission.mission.statement || "Establishing community-centric roadmap..."}
            </p>
            {mission.mission.reason && (
              <p style={{ color: isDark ? "#94a3b8" : "#64748b", fontSize: 13, margin: "6px 0 0" }}>
                <i>Why: {mission.mission.reason}</i>
              </p>
            )}
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button
              onClick={() => onNavigate?.("dna")}
              style={{
                backgroundColor: "#6366f1",
                color: "#fff",
                border: "none",
                borderRadius: 10,
                padding: "10px 18px",
                fontWeight: 700,
                fontSize: 13,
                cursor: "pointer",
                boxShadow: "0 4px 12px rgba(99, 102, 241, 0.3)",
              }}
            >
              View DNA 🧬
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

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12, marginTop: 24 }}>
          {stats.map((s) => (
            <div key={s.label} style={{ background: isDark ? "rgba(0, 0, 0, 0.25)" : "#f8fafc", border: isDark ? "1px solid rgba(255, 255, 255, 0.04)" : "1px solid #e2e8f0", borderRadius: 12, padding: 16 }}>
              <div style={{ ...labelStyle, fontSize: 9 }}>{s.label}</div>
              <div style={{ fontSize: 18, fontWeight: 800, color: isDark ? "#c7d2fe" : "#4f46e5", marginTop: 4 }}>{s.value}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Vision & Long Term Reminder */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))", gap: 24 }}>
        <section style={cardStyle}>
          <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 12, color: isDark ? "#f8fafc" : "#0f172a" }}>Long-Term Vision</h2>
          <p style={{ color: isDark ? "#cbd5e1" : "#334155", fontSize: 14, lineHeight: 1.6, margin: 0 }}>
            {mission.vision || mission.longTermGoal || "Aligning long-term content strategy with metrics."}
          </p>
          {mission.careerCompass?.longTermReminder && (
            <div style={{ borderTop: isDark ? "1px solid rgba(255,255,255,0.06)" : "1px solid #e2e8f0", paddingTop: 12, marginTop: 12 }}>
              <span style={{ ...labelStyle, fontSize: 9 }}>Core Purpose Reminder</span>
              <p style={{ color: isDark ? "#e2e8f0" : "#1e293b", fontSize: 13, fontWeight: 500, margin: "4px 0 0" }}>
                &ldquo;{mission.careerCompass.longTermReminder}&rdquo;
              </p>
            </div>
          )}
        </section>

        <section style={cardStyle}>
          <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 12, color: isDark ? "#f8fafc" : "#0f172a" }}>Decision Boundaries</h2>
          <span style={labelStyle}>Things we will never sacrifice</span>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 12 }}>
            {mission.decisionFramework?.knownSacrifices?.length ? (
              mission.decisionFramework.knownSacrifices.map((item, idx) => (
                <span key={idx} style={{ background: isDark ? "rgba(244, 63, 94, 0.12)" : "rgba(244, 63, 94, 0.08)", color: isDark ? "#f43f5e" : "#e11d48", border: isDark ? "none" : "1px solid rgba(244,63,94,0.2)", padding: "4px 12px", borderRadius: 8, fontSize: 12, fontWeight: 600 }}>
                  {item}
                </span>
              ))
            ) : (
              <span style={{ color: isDark ? "#64748b" : "#64748b", fontSize: 13 }}>No hard limits established yet.</span>
            )}
          </div>
          <div style={{ marginTop: 16 }}>
            <span style={labelStyle}>Priorities Checklist</span>
            <ul style={{ color: isDark ? "#cbd5e1" : "#334155", fontSize: 13, paddingLeft: 18, margin: "6px 0 0", lineHeight: 1.5 }}>
              {mission.decisionFramework?.priorities?.map((p, idx) => (
                <li key={idx}>{p}</li>
              ))}
            </ul>
          </div>
        </section>
      </div>

      {/* Current Strategy */}
      <section style={cardStyle}>
        <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 4, color: isDark ? "#f8fafc" : "#0f172a" }}>Current Strategy</h2>
        <span style={labelStyle}>Execution blueprint for the current phase</span>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20, marginTop: 16 }}>
          <div>
            <b style={{ fontSize: 13, color: isDark ? "#34d399" : "#059669", textTransform: "uppercase" }}>🎯 Focus Areas</b>
            <ul style={{ color: isDark ? "#cbd5e1" : "#334155", paddingLeft: 18, lineHeight: 1.6, fontSize: 13, marginTop: 8 }}>
              {mission.currentStrategy.focus.length ? (
                mission.currentStrategy.focus.map((item) => <li key={item}>{item}</li>)
              ) : (
                <li>Gathering specific focus targets.</li>
              )}
            </ul>
          </div>
          <div>
            <b style={{ fontSize: 13, color: isDark ? "#f87171" : "#e11d48", textTransform: "uppercase" }}>🚫 Intentionally Ignoring</b>
            <ul style={{ color: isDark ? "#94a3b8" : "#64748b", paddingLeft: 18, lineHeight: 1.6, fontSize: 13, marginTop: 8 }}>
              {mission.currentStrategy.intentionallyIgnoring.length ? (
                mission.currentStrategy.intentionallyIgnoring.map((item) => <li key={item}>{item}</li>)
              ) : (
                <li>No exclusions recorded.</li>
              )}
            </ul>
          </div>
        </div>
        {mission.currentStrategy.rationale && (
          <p style={{ margin: "14px 0 0", color: isDark ? "#94a3b8" : "#64748b", fontSize: 12, borderTop: isDark ? "1px solid rgba(255,255,255,0.06)" : "1px solid #e2e8f0", paddingTop: 10 }}>
            <b>Strategy Rationale:</b> {mission.currentStrategy.rationale}
          </p>
        )}
      </section>

      {/* Roadmap milestones */}
      <section style={cardStyle}>
        <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 4, color: isDark ? "#f8fafc" : "#0f172a" }}>Mission Roadmap</h2>
        <span style={labelStyle}>Dynamic Milestone checklist compiled from telemetry</span>
        <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 12 }}>
          {mission.milestones.length ? (
            mission.milestones.map((item) => (
              <div
                key={item.id}
                style={{
                  display: "grid",
                  gridTemplateColumns: "24px 1fr auto",
                  alignItems: "center",
                  gap: 12,
                  background: item.status === "current" ? (isDark ? "rgba(168, 85, 247, 0.08)" : "rgba(168, 85, 247, 0.05)") : (isDark ? "transparent" : "#f8fafc"),
                  border: item.status === "current" ? (isDark ? "1px solid rgba(168, 85, 247, 0.2)" : "1px solid rgba(168, 85, 247, 0.25)") : (isDark ? "1px solid transparent" : "1px solid #e2e8f0"),
                  borderRadius: 10,
                  padding: item.status === "current" ? "10px 14px" : "6px 14px",
                }}
              >
                <span style={{ color: item.status === "complete" ? (isDark ? "#34d399" : "#059669") : item.status === "current" ? (isDark ? "#c084fc" : "#9333ea") : (isDark ? "#475569" : "#94a3b8"), fontSize: 18, fontWeight: "bold" }}>
                  {item.status === "complete" ? "✓" : item.status === "current" ? "◉" : "○"}
                </span>
                <span style={{ color: item.status === "upcoming" ? (isDark ? "#94a3b8" : "#64748b") : (isDark ? "#f1f5f9" : "#0f172a"), fontWeight: item.status === "current" ? 700 : 500, fontSize: 14 }}>
                  {item.title}
                </span>
                <StatusBadge status={item.status} />
              </div>
            ))
          ) : (
            <span style={{ color: isDark ? "#64748b" : "#64748b" }}>No milestones available.</span>
          )}
        </div>
      </section>

      {/* Experiments, Risks & Opportunities */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))", gap: 24 }}>
        {/* Experiments */}
        <section style={cardStyle}>
          <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 16, color: isDark ? "#f8fafc" : "#0f172a" }}>Current Experiments</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {mission.currentExperiments.length ? (
              mission.currentExperiments.map((item) => (
                <div key={item.id} style={{ background: isDark ? "rgba(0,0,0,0.15)" : "#f8fafc", border: isDark ? "1px solid rgba(255,255,255,0.03)" : "1px solid #e2e8f0", borderRadius: 12, padding: 16 }}>
                  <b style={{ fontSize: 14, color: isDark ? "#f1f5f9" : "#0f172a" }}>{item.title}</b>
                  <p style={{ color: isDark ? "#94a3b8" : "#475569", margin: "6px 0", fontSize: 12, lineHeight: 1.5 }}>{item.rationale}</p>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 11, color: isDark ? "#64748b" : "#64748b", marginTop: 8 }}>
                    <span>Confidence: {item.confidence}%</span>
                    {item.evidenceIds && item.evidenceIds.length > 0 && (
                      <span style={{ color: isDark ? "#38bdf8" : "#2563eb" }}>{item.evidenceIds.length} Evidence IDs</span>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <span style={{ color: isDark ? "#64748b" : "#64748b", fontSize: 13 }}>Stream evaluations will suggest experiments here.</span>
            )}
          </div>
        </section>

        {/* Risks */}
        <section style={cardStyle}>
          <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 16, color: isDark ? "#f8fafc" : "#0f172a" }}>Current Risks</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {mission.risks.length ? (
              mission.risks.map((item) => (
                <div key={item.id} style={{ background: isDark ? "rgba(0,0,0,0.15)" : "#f8fafc", border: isDark ? "1px solid rgba(255,255,255,0.03)" : "1px solid #e2e8f0", borderRadius: 12, padding: 16 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 8, marginBottom: 6 }}>
                    <b style={{ fontSize: 14, color: isDark ? "#f87171" : "#e11d48" }}>{item.title}</b>
                    <span style={{ fontSize: 11, color: item.severity === "high" ? "#ef4444" : "#fbbf24", fontWeight: 700, textTransform: "uppercase" }}>
                      {item.severity} · {item.confidence}% Conf
                    </span>
                  </div>
                  <p style={{ color: isDark ? "#94a3b8" : "#475569", fontSize: 12, margin: "4px 0", lineHeight: 1.45 }}>{item.recommendation}</p>
                </div>
              ))
            ) : (
              <span style={{ color: isDark ? "#64748b" : "#64748b", fontSize: 13 }}>No major risks identified.</span>
            )}
          </div>
        </section>

        {/* Opportunities */}
        <section style={cardStyle}>
          <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 16, color: isDark ? "#f8fafc" : "#0f172a" }}>Current Opportunities</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {mission.opportunities.length ? (
              mission.opportunities.map((item) => (
                <div key={item.id} style={{ background: isDark ? "rgba(0,0,0,0.15)" : "#f8fafc", border: isDark ? "1px solid rgba(255,255,255,0.03)" : "1px solid #e2e8f0", borderRadius: 12, padding: 16 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 8, marginBottom: 6 }}>
                    <b style={{ fontSize: 14, color: isDark ? "#34d399" : "#059669" }}>{item.title}</b>
                    <span style={{ fontSize: 11, color: isDark ? "#6366f1" : "#4f46e5", fontWeight: 700, textTransform: "uppercase" }}>
                      {item.expectedImpact} Impact · {item.confidence}% Conf
                    </span>
                  </div>
                  <p style={{ color: isDark ? "#94a3b8" : "#475569", fontSize: 12, margin: "4px 0", lineHeight: 1.45 }}>{item.reason}</p>
                </div>
              ))
            ) : (
              <span style={{ color: isDark ? "#64748b" : "#64748b", fontSize: 13 }}>No major opportunities detected.</span>
            )}
          </div>
        </section>
      </div>

      {/* Mission Alignment History */}
      <section style={cardStyle}>
        <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 4, color: isDark ? "#f8fafc" : "#0f172a" }}>Mission Alignment History</h2>
        <span style={labelStyle}>Stream evaluation scorecard against core goals</span>
        <div style={{ display: "flex", flexDirection: "column", gap: 16, marginTop: 16 }}>
          {mission.alignmentHistory && mission.alignmentHistory.length ? (
            mission.alignmentHistory.slice().reverse().map((item, idx) => (
              <div key={idx} style={{ background: isDark ? "rgba(0,0,0,0.15)" : "#f8fafc", border: isDark ? "1px solid rgba(255,255,255,0.03)" : "1px solid #e2e8f0", borderRadius: 12, padding: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <b style={{ fontSize: 15, color: isDark ? "#f8fafc" : "#0f172a" }}>Session Alignment: {item.score}%</b>
                  <span style={{ fontSize: 11, color: isDark ? "#64748b" : "#64748b" }}>{item.createdAt ? new Date(item.createdAt).toLocaleDateString() : ""}</span>
                </div>
                
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 12 }}>
                  <div>
                    <span style={{ fontSize: 10, color: isDark ? "#34d399" : "#059669", fontWeight: 700, textTransform: "uppercase" }}>🚀 What Helped</span>
                    <ul style={{ color: isDark ? "#cbd5e1" : "#334155", fontSize: 12, margin: "4px 0 0", paddingLeft: 16, lineHeight: 1.4 }}>
                      {item.helped && item.helped.length ? item.helped.map((h, i) => <li key={i}>{h}</li>) : <li>No specific boosters noted.</li>}
                    </ul>
                  </div>
                  <div>
                    <span style={{ fontSize: 10, color: isDark ? "#f87171" : "#e11d48", fontWeight: 700, textTransform: "uppercase" }}>⚠️ What Slowed Us Down</span>
                    <ul style={{ color: isDark ? "#cbd5e1" : "#334155", fontSize: 12, margin: "4px 0 0", paddingLeft: 16, lineHeight: 1.4 }}>
                      {item.slowed && item.slowed.length ? item.slowed.map((s, i) => <li key={i}>{s}</li>) : <li>No friction points reported.</li>}
                    </ul>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <span style={{ color: isDark ? "#64748b" : "#64748b" }}>Each stream evaluation details will display here.</span>
          )}
        </div>
      </section>
    </motion.div>
  );
};

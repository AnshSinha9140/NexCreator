"use client";

import React from "react";
import { useApp } from "@/context/AppContext";
import { NextStreamExperiment } from "@/lib/ai/executiveTypes";

interface ExperimentCardProps {
  experiment?: NextStreamExperiment;
}

export const ExperimentCard: React.FC<ExperimentCardProps> = ({ experiment }) => {
  const { theme } = useApp();
  const isDark = theme === "dark";

  const exp = experiment || {
    experimentNumber: 12,
    purpose: "Increase Chat Participation during Gameplay",
    testInstruction: "Spend five minutes directly answering chat questions every 20 minutes of broadcast time.",
    expectedImprovement: "+8% overall viewer engagement and higher message density",
    evidence: "Based on previous 3 streams where conversational windows yielded 0% drop-off.",
  };

  return (
    <div
      style={{
        padding: "24px",
        borderRadius: "20px",
        background: isDark
          ? "linear-gradient(135deg, rgba(168, 85, 247, 0.12) 0%, rgba(99, 102, 241, 0.08) 100%)"
          : "#ffffff",
        border: isDark ? "1px solid rgba(168, 85, 247, 0.3)" : "1px solid #e2e8f0",
        boxShadow: isDark ? "none" : "0 1px 3px rgba(0, 0, 0, 0.05)",
        display: "flex",
        flexDirection: "column",
        gap: "14px",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontSize: "18px" }}>🧪</span>
          <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "800", color: isDark ? "#f8fafc" : "#0f172a" }}>
            Experiment for Next Stream
          </h3>
        </div>
        <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
          <span
            style={{
              fontSize: "10px",
              fontWeight: "700",
              padding: "3px 8px",
              borderRadius: "99px",
              background: isDark ? "rgba(56, 189, 248, 0.15)" : "rgba(37, 99, 235, 0.1)",
              color: isDark ? "#38bdf8" : "#2563eb",
            }}
          >
            🧬 Aligns with DNA
          </span>
          <span
            style={{
              fontSize: "10px",
              fontWeight: "700",
              padding: "3px 8px",
              borderRadius: "99px",
              background: isDark ? "rgba(99, 102, 241, 0.15)" : "rgba(99, 102, 241, 0.1)",
              color: isDark ? "#818cf8" : "#4f46e5",
            }}
          >
            🎯 Supports Mission
          </span>
          <span
            style={{
              fontSize: "11px",
              fontWeight: "800",
              padding: "3px 10px",
              borderRadius: "99px",
              background: isDark ? "rgba(168, 85, 247, 0.2)" : "rgba(168, 85, 247, 0.1)",
              color: isDark ? "#c084fc" : "#9333ea",
              fontFamily: "monospace",
            }}
          >
            EXPERIMENT #{exp.experimentNumber}
          </span>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        <div style={{ fontSize: "13px", color: isDark ? "#cbd5e1" : "#334155" }}>
          <strong>Purpose:</strong> {exp.purpose}
        </div>
        <div style={{ fontSize: "14px", fontWeight: "700", color: isDark ? "#f8fafc" : "#0f172a", background: isDark ? "rgba(0,0,0,0.3)" : "#f8fafc", border: isDark ? "none" : "1px solid #e2e8f0", padding: "12px", borderRadius: "10px", borderLeft: "4px solid #a855f7" }}>
          <strong>Test:</strong> {exp.testInstruction}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: isDark ? "#94a3b8" : "#64748b", flexWrap: "wrap", gap: "8px", marginTop: "4px" }}>
          <span>📈 <strong>Expected Improvement:</strong> <span style={{ color: isDark ? "#34d399" : "#059669" }}>{exp.expectedImprovement}</span></span>
          <span>🔍 <strong>Evidence:</strong> {exp.evidence}</span>
        </div>
      </div>
    </div>
  );
};

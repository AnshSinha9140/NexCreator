"use client";

import React from "react";
import { NextStreamExperiment } from "@/lib/ai/executiveTypes";

interface ExperimentCardProps {
  experiment?: NextStreamExperiment;
}

export const ExperimentCard: React.FC<ExperimentCardProps> = ({ experiment }) => {
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
        background: "linear-gradient(135deg, rgba(168, 85, 247, 0.12) 0%, rgba(99, 102, 241, 0.08) 100%)",
        border: "1px solid rgba(168, 85, 247, 0.3)",
        display: "flex",
        flexDirection: "column",
        gap: "14px",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontSize: "18px" }}>🧪</span>
          <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "800", color: "#f8fafc" }}>
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
              background: "rgba(56, 189, 248, 0.15)",
              color: "#38bdf8",
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
              background: "rgba(99, 102, 241, 0.15)",
              color: "#818cf8",
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
              background: "rgba(168, 85, 247, 0.2)",
              color: "#c084fc",
              fontFamily: "monospace",
            }}
          >
            EXPERIMENT #{exp.experimentNumber}
          </span>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        <div style={{ fontSize: "13px", color: "#cbd5e1" }}>
          <strong>Purpose:</strong> {exp.purpose}
        </div>
        <div style={{ fontSize: "14px", fontWeight: "700", color: "#f8fafc", background: "rgba(0,0,0,0.3)", padding: "12px", borderRadius: "10px", borderLeft: "4px solid #a855f7" }}>
          <strong>Test:</strong> {exp.testInstruction}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "#94a3b8", flexWrap: "wrap", gap: "8px", marginTop: "4px" }}>
          <span>📈 <strong>Expected Improvement:</strong> <span style={{ color: "#34d399" }}>{exp.expectedImprovement}</span></span>
          <span>🔍 <strong>Evidence:</strong> {exp.evidence}</span>
        </div>
      </div>
    </div>
  );
};

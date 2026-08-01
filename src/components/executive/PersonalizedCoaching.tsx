"use client";

import React from "react";
import { CoachingInsightItem } from "@/lib/ai/executiveTypes";

interface PersonalizedCoachingProps {
  coaching: CoachingInsightItem[];
}

const IMPROVEMENT_CONFIG = {
  better: { icon: "📈", color: "#10b981", label: "Improved" },
  worse:  { icon: "📉", color: "#f43f5e", label: "Declined" },
  same:   { icon: "➡",  color: "#94a3b8", label: "Consistent" },
  new:    { icon: "✨",  color: "#a855f7", label: "New Pattern" },
};

export const PersonalizedCoaching: React.FC<PersonalizedCoachingProps> = ({ coaching }) => {
  const [kg, setKg] = React.useState<any>(null);

  React.useEffect(() => {
    fetch("/api/creator/hydration")
      .then((r) => r.json())
      .then((data) => {
        if (data.success && data.knowledgeGraph) {
          setKg(data.knowledgeGraph);
        }
      })
      .catch(() => {});
  }, []);

  if (!coaching || coaching.length === 0) return null;

  return (
    <section
      style={{
        padding: "32px 36px",
        borderRadius: "20px",
        background: "linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(11, 13, 22, 0.9) 100%)",
        border: "1px solid rgba(168,85,247,0.15)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "28px" }}>
        <div
          style={{
            width: "38px",
            height: "38px",
            borderRadius: "12px",
            background: "rgba(168,85,247,0.12)",
            border: "1px solid rgba(168,85,247,0.25)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "18px",
          }}
        >
          🧠
        </div>
        <div>
          <h2 style={{ margin: 0, fontSize: "18px", fontWeight: 800, color: "#f8fafc" }}>
            Personalized Coaching
          </h2>
          <p style={{ margin: 0, fontSize: "12px", color: "#64748b" }}>
            Insights tailored to your streaming patterns
          </p>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {coaching.map((item) => {
          const cfg = IMPROVEMENT_CONFIG[item.improvement] || IMPROVEMENT_CONFIG.same;
          return (
            <div
              key={item.id}
              style={{
                padding: "20px",
                borderRadius: "14px",
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.07)",
                display: "flex",
                flexDirection: "column",
                gap: "12px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "8px" }}>
                <span
                  style={{
                    fontSize: "11px",
                    fontFamily: "'JetBrains Mono', monospace",
                    color: "#64748b",
                    fontWeight: 600,
                  }}
                >
                  {item.comparisonLabel}
                </span>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <span
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                      padding: "3px 10px",
                      borderRadius: "8px",
                      fontSize: "11px",
                      fontFamily: "'JetBrains Mono', monospace",
                      fontWeight: 700,
                      background: `${cfg.color}12`,
                      border: `1px solid ${cfg.color}25`,
                      color: cfg.color,
                    }}
                  >
                    <span>{cfg.icon}</span>
                    <span>{cfg.label}</span>
                  </span>
                  <span
                    style={{
                      padding: "3px 10px",
                      borderRadius: "8px",
                      fontSize: "10px",
                      fontFamily: "'JetBrains Mono', monospace",
                      fontWeight: 800,
                      background: "rgba(16,185,129,0.1)",
                      border: "1px solid rgba(16,185,129,0.25)",
                      color: "#34d399",
                    }}
                  >
                    {item.confidence}%
                  </span>
                </div>
              </div>

              <p style={{ margin: 0, fontSize: "14px", fontWeight: 600, color: "#e2e8f0", lineHeight: 1.5 }}>
                {item.insight}
              </p>

              {(() => {
                let rec = item.recommendation;
                if (kg) {
                  const { RelationshipInsights } = require("@/lib/creatorKnowledge/relationshipInsights");
                  rec = RelationshipInsights.getCoachingAdvice(kg, rec);
                }
                return (
                  <div
                    style={{
                      padding: "10px 14px",
                      borderRadius: "10px",
                      background: "linear-gradient(135deg, rgba(168,85,247,0.08) 0%, rgba(99,102,241,0.05) 100%)",
                      border: "1px solid rgba(168,85,247,0.2)",
                      fontSize: "12px",
                      color: "#f1f5f9",
                      fontWeight: 600,
                      lineHeight: 1.4,
                    }}
                  >
                    <span style={{ color: "#c084fc" }}>→ </span>{rec}
                  </div>
                );
              })()}
            </div>
          );
        })}
      </div>
    </section>
  );
};

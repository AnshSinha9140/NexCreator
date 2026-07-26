"use client";

import React from "react";
import { ActionItem } from "@/lib/ai/executiveTypes";

interface ActionChecklistProps {
  actionPlan: ActionItem[];
  onToggleItem: (id: string, completed: boolean) => void;
}

const PRIORITY_CONFIG = {
  high:   { color: "#f43f5e", bg: "rgba(244,63,94,0.1)",   border: "rgba(244,63,94,0.25)",   label: "High" },
  medium: { color: "#f59e0b", bg: "rgba(245,158,11,0.1)",  border: "rgba(245,158,11,0.25)",  label: "Medium" },
  low:    { color: "#94a3b8", bg: "rgba(100,116,139,0.08)", border: "rgba(100,116,139,0.2)", label: "Low" },
};

export const ActionChecklist: React.FC<ActionChecklistProps> = ({ actionPlan, onToggleItem }) => {
  if (!actionPlan || actionPlan.length === 0) return null;

  const completed = actionPlan.filter((i) => i.isCompleted).length;

  return (
    <section
      style={{
        padding: "32px 36px",
        borderRadius: "20px",
        background: "linear-gradient(135deg, rgba(16, 185, 129, 0.05) 0%, rgba(11, 13, 22, 0.8) 100%)",
        border: "1px solid rgba(16, 185, 129, 0.2)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", marginBottom: "24px", flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div
            style={{
              width: "38px",
              height: "38px",
              borderRadius: "12px",
              background: "rgba(16,185,129,0.12)",
              border: "1px solid rgba(16,185,129,0.25)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "18px",
            }}
          >
            ✅
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: "18px", fontWeight: 800, color: "#f8fafc" }}>
              Action Plan
            </h2>
            <p style={{ margin: 0, fontSize: "12px", color: "#64748b" }}>
              Before your next stream
            </p>
          </div>
        </div>
        <span style={{ fontSize: "12px", fontFamily: "'JetBrains Mono', monospace", color: "#34d399" }}>
          {completed}/{actionPlan.length} completed
        </span>
      </div>

      {/* Progress bar */}
      <div style={{ marginBottom: "20px" }}>
        <div style={{ height: "4px", borderRadius: "99px", background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
          <div
            style={{
              height: "100%",
              width: `${actionPlan.length > 0 ? (completed / actionPlan.length) * 100 : 0}%`,
              borderRadius: "99px",
              background: "linear-gradient(90deg, #10b981, #34d399)",
              transition: "width 0.4s ease",
            }}
          />
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {actionPlan.map((item) => {
          const pCfg = PRIORITY_CONFIG[item.priority] || PRIORITY_CONFIG.medium;
          return (
            <button
              key={item.id}
              onClick={() => onToggleItem(item.id, !item.isCompleted)}
              style={{
                padding: "14px 18px",
                borderRadius: "12px",
                background: item.isCompleted ? "rgba(16,185,129,0.08)" : "rgba(255,255,255,0.03)",
                border: item.isCompleted ? "1px solid rgba(16,185,129,0.25)" : "1px solid rgba(255,255,255,0.06)",
                display: "flex",
                alignItems: "center",
                gap: "14px",
                cursor: "pointer",
                textAlign: "left",
                transition: "all 0.15s ease",
              }}
            >
              {/* Checkbox */}
              <div
                style={{
                  width: "22px",
                  height: "22px",
                  borderRadius: "7px",
                  flexShrink: 0,
                  background: item.isCompleted ? "#10b981" : "transparent",
                  border: item.isCompleted ? "2px solid #10b981" : "2px solid rgba(255,255,255,0.15)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#fff",
                  fontSize: "13px",
                  fontWeight: 900,
                }}
              >
                {item.isCompleted ? "✓" : ""}
              </div>

              {/* Text */}
              <span
                style={{
                  flex: 1,
                  fontSize: "13px",
                  fontWeight: 600,
                  color: item.isCompleted ? "#64748b" : "#e2e8f0",
                  textDecoration: item.isCompleted ? "line-through" : "none",
                }}
              >
                {item.text}
                {item.relatedTimestamp && (
                  <span style={{ marginLeft: "8px", fontSize: "11px", fontFamily: "'JetBrains Mono', monospace", color: "#a855f7" }}>
                    @ {item.relatedTimestamp}
                  </span>
                )}
              </span>

              {/* Priority */}
              <span
                style={{
                  padding: "2px 8px",
                  borderRadius: "6px",
                  fontSize: "10px",
                  fontFamily: "'JetBrains Mono', monospace",
                  fontWeight: 800,
                  background: pCfg.bg,
                  border: `1px solid ${pCfg.border}`,
                  color: pCfg.color,
                  textTransform: "uppercase",
                  flexShrink: 0,
                }}
              >
                {pCfg.label}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
};

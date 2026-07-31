"use client";

import React from "react";
import { ManagerConcern } from "@/lib/conversation/types";

interface ManagerConcernCardProps {
  concern: ManagerConcern;
}

const SEVERITY_STYLES = {
  watching: { color: "#eab308", bg: "rgba(234,179,8,0.08)", border: "rgba(234,179,8,0.2)", icon: "👁️" },
  concerned: { color: "#fb923c", bg: "rgba(251,146,60,0.08)", border: "rgba(251,146,60,0.2)", icon: "⚠️" },
  urgent: { color: "#fb7185", bg: "rgba(244,63,94,0.08)", border: "rgba(244,63,94,0.2)", icon: "🚨" },
};

export const ManagerConcernCard: React.FC<ManagerConcernCardProps> = ({
  concern,
}) => {
  const s = SEVERITY_STYLES[concern.severity] || SEVERITY_STYLES.watching;

  return (
    <div
      style={{
        padding: "16px",
        borderRadius: "14px",
        background: s.bg,
        border: `1px solid ${s.border}`,
        display: "flex",
        gap: "12px",
        alignItems: "flex-start",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <div style={{ fontSize: "16px", marginTop: "2px" }}>{s.icon}</div>
      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
        <div style={{ fontSize: "14px", fontWeight: "700", color: s.color }}>
          {concern.headline}
        </div>
        <div style={{ fontSize: "13px", color: "#cbd5e1", lineHeight: 1.5 }}>
          {concern.body}
        </div>
      </div>
    </div>
  );
};

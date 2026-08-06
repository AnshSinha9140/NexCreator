"use client";

import React from "react";
import { ManagerConcern } from "@/lib/conversation/types";
import { useApp } from "@/context/AppContext";

interface ManagerConcernCardProps {
  concern: ManagerConcern;
}

const SEVERITY_STYLES = {
  watching: { color: "#eab308", lightColor: "#d97706", bg: "rgba(234,179,8,0.08)", border: "rgba(234,179,8,0.25)", icon: "👁️" },
  concerned: { color: "#fb923c", lightColor: "#ea580c", bg: "rgba(251,146,60,0.08)", border: "rgba(251,146,60,0.25)", icon: "⚠️" },
  urgent: { color: "#fb7185", lightColor: "#dc2626", bg: "rgba(244,63,94,0.08)", border: "rgba(244,63,94,0.25)", icon: "🚨" },
};

export const ManagerConcernCard: React.FC<ManagerConcernCardProps> = ({
  concern,
}) => {
  const { theme } = useApp();
  const isDark = theme === "dark";
  const s = SEVERITY_STYLES[concern.severity] || SEVERITY_STYLES.watching;

  return (
    <div
      style={{
        padding: "16px",
        borderRadius: "14px",
        background: isDark ? s.bg : "#ffffff",
        border: `1px solid ${s.border}`,
        boxShadow: isDark ? "none" : "0 2px 10px rgba(0,0,0,0.04)",
        display: "flex",
        gap: "12px",
        alignItems: "flex-start",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <div style={{ fontSize: "16px", marginTop: "2px" }}>{s.icon}</div>
      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
        <div style={{ fontSize: "14px", fontWeight: "700", color: isDark ? s.color : s.lightColor }}>
          {concern.headline}
        </div>
        <div style={{ fontSize: "13px", color: isDark ? "#cbd5e1" : "#334155", lineHeight: 1.5 }}>
          {concern.body}
        </div>
      </div>
    </div>
  );
};

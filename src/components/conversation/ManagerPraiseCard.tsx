"use client";

import React from "react";
import { ManagerPraise } from "@/lib/conversation/types";
import { useApp } from "@/context/AppContext";

interface ManagerPraiseCardProps {
  praise: ManagerPraise;
}

export const ManagerPraiseCard: React.FC<ManagerPraiseCardProps> = ({
  praise,
}) => {
  const { theme } = useApp();
  const isDark = theme === "dark";

  return (
    <div
      style={{
        padding: "16px",
        borderRadius: "14px",
        background: isDark
          ? "linear-gradient(135deg, rgba(52,211,153,0.08) 0%, rgba(96,165,250,0.05) 100%)"
          : "#ffffff",
        border: isDark ? "1px solid rgba(52,211,153,0.2)" : "1px solid rgba(16, 185, 129, 0.3)",
        boxShadow: isDark ? "none" : "0 2px 10px rgba(0,0,0,0.04)",
        display: "flex",
        gap: "12px",
        alignItems: "flex-start",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <div style={{ fontSize: "16px", marginTop: "2px" }}>🌟</div>
      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
        <div style={{ fontSize: "14px", fontWeight: "700", color: isDark ? "#34d399" : "#059669" }}>
          {praise.headline}
        </div>
        <div style={{ fontSize: "13px", color: isDark ? "#cbd5e1" : "#334155", lineHeight: 1.5 }}>
          {praise.body}
        </div>
      </div>
    </div>
  );
};

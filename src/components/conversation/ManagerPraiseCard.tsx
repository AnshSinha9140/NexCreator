"use client";

import React from "react";
import { ManagerPraise } from "@/lib/conversation/types";

interface ManagerPraiseCardProps {
  praise: ManagerPraise;
}

export const ManagerPraiseCard: React.FC<ManagerPraiseCardProps> = ({
  praise,
}) => {
  return (
    <div
      style={{
        padding: "16px",
        borderRadius: "14px",
        background: "linear-gradient(135deg, rgba(52,211,153,0.08) 0%, rgba(96,165,250,0.05) 100%)",
        border: "1px solid rgba(52,211,153,0.2)",
        display: "flex",
        gap: "12px",
        alignItems: "flex-start",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <div style={{ fontSize: "16px", marginTop: "2px" }}>🌟</div>
      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
        <div style={{ fontSize: "14px", fontWeight: "700", color: "#34d399" }}>
          {praise.headline}
        </div>
        <div style={{ fontSize: "13px", color: "#cbd5e1", lineHeight: 1.5 }}>
          {praise.body}
        </div>
      </div>
    </div>
  );
};

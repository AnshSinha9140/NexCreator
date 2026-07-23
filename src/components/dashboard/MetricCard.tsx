"use client";

import React from "react";

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: string;
  isPositive?: boolean;
  icon?: React.ReactNode;
  subtitle?: string;
  accentColor?: "purple" | "emerald" | "blue" | "amber" | "rose";
  children?: React.ReactNode;
}

const accentMap = {
  purple:  { text: "#c084fc", bg: "rgba(168,85,247,0.1)",  border: "rgba(168,85,247,0.2)"  },
  emerald: { text: "#34d399", bg: "rgba(16,185,129,0.1)",  border: "rgba(16,185,129,0.2)"  },
  blue:    { text: "#38bdf8", bg: "rgba(6,182,212,0.1)",   border: "rgba(6,182,212,0.2)"   },
  amber:   { text: "#fbbf24", bg: "rgba(245,158,11,0.1)",  border: "rgba(245,158,11,0.2)"  },
  rose:    { text: "#fb7185", bg: "rgba(244,63,94,0.1)",   border: "rgba(244,63,94,0.2)"   },
};

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  change,
  isPositive = true,
  icon,
  subtitle,
  accentColor = "purple",
  children,
}) => {
  const accent = accentMap[accentColor];

  return (
    <div
      style={{
        background: "rgba(13,16,27,0.7)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: "14px",
        padding: "20px",
        display: "flex",
        flexDirection: "column",
        gap: "12px",
        transition: "border-color 0.2s ease, box-shadow 0.2s ease",
        cursor: "default",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(255,255,255,0.13)";
        (e.currentTarget as HTMLDivElement).style.boxShadow = "0 8px 32px rgba(0,0,0,0.4)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(255,255,255,0.07)";
        (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
      }}
    >
      {/* Header row */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span
          style={{
            fontSize: "10px",
            fontWeight: "700",
            color: "#475569",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            fontFamily: "'JetBrains Mono', monospace",
          }}
        >
          {title}
        </span>
        {icon && (
          <div
            style={{
              width: "30px",
              height: "30px",
              borderRadius: "8px",
              background: accent.bg,
              border: `1px solid ${accent.border}`,
              color: accent.text,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {icon}
          </div>
        )}
      </div>

      {/* Value + change */}
      <div style={{ display: "flex", alignItems: "baseline", gap: "8px", flexWrap: "wrap" }}>
        <span
          style={{
            fontSize: "22px",
            fontWeight: "800",
            color: "#f1f5f9",
            letterSpacing: "-0.5px",
            lineHeight: 1,
          }}
        >
          {value}
        </span>
        {change && (
          <span
            style={{
              fontSize: "10px",
              fontWeight: "700",
              padding: "2px 7px",
              borderRadius: "99px",
              background: isPositive ? "rgba(16,185,129,0.1)" : "rgba(244,63,94,0.1)",
              color: isPositive ? "#34d399" : "#fb7185",
              border: `1px solid ${isPositive ? "rgba(16,185,129,0.2)" : "rgba(244,63,94,0.2)"}`,
              fontFamily: "'JetBrains Mono', monospace",
            }}
          >
            {isPositive ? "↑" : "↓"} {change}
          </span>
        )}
      </div>

      {/* Subtitle */}
      {subtitle && (
        <p
          style={{
            fontSize: "11px",
            color: "#475569",
            lineHeight: 1.4,
            marginTop: "-4px",
          }}
        >
          {subtitle}
        </p>
      )}

      {children && <div style={{ marginTop: "4px" }}>{children}</div>}
    </div>
  );
};

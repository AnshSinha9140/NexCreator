"use client";

import React from "react";
import { useApp } from "@/context/AppContext";

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const PRIMARY_NAV = [
  { id: "command_center", name: "Command Center", icon: "🏠" },
  { id: "dna",            name: "Creator DNA",     icon: "🧬" },
  { id: "mission",        name: "Mission",         icon: "🧭" },
  { id: "copilot",        name: "AI Copilot",     icon: "🤖" },
  { id: "reports",        name: "Executive Reports", icon: "📄" },
  { id: "live",           name: "Live",           icon: "📡" },
  { id: "content",        name: "Content",        icon: "🎥" },
  { id: "audience",       name: "Audience",       icon: "👥" },
  { id: "settings",       name: "Settings",       icon: "⚙" },
];

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const { currentUser, logout, theme } = useApp();
  const isDark = theme === "dark";

  const isAdmin = Boolean(
    currentUser?.isAdmin ||
    (currentUser as any)?.role === "admin" ||
    currentUser?.email?.toLowerCase().includes("admin")
  );

  const navList = [
    ...PRIMARY_NAV,
    ...(isAdmin ? [{ id: "admin", name: "Admin Operations Portal", icon: "⚡" }] : []),
  ];

  return (
    <aside
      style={{
        width: "240px",
        flexShrink: 0,
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        background: isDark ? "#0b0d16" : "#ffffff",
        borderRight: isDark ? "1px solid rgba(255,255,255,0.06)" : "1px solid #e2e8f0",
        overflowY: "auto",
        overflowX: "hidden",
        transition: "background 0.2s ease, border-color 0.2s ease",
      }}
    >
      {/* Brand Logo Header */}
      <div style={{ padding: "20px 20px 16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div
            style={{
              width: "34px",
              height: "34px",
              borderRadius: "10px",
              background: "linear-gradient(135deg, #a855f7 0%, #6366f1 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: "800",
              fontSize: "16px",
              color: "#fff",
              flexShrink: 0,
              boxShadow: "0 4px 12px rgba(168,85,247,0.3)",
            }}
          >
            N
          </div>
          <div>
            <div style={{ fontSize: "14px", fontWeight: "700", color: isDark ? "#f1f5f9" : "#0f172a", lineHeight: 1.2 }}>
              NexCreator
            </div>
            <div
              style={{
                fontSize: "9px",
                fontWeight: "700",
                color: isDark ? "#a855f7" : "#9333ea",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                fontFamily: "'JetBrains Mono', monospace",
              }}
            >
              Creator Intelligence
            </div>
          </div>
        </div>
      </div>

      {/* User / Workspace Badge */}
      <div style={{ padding: "0 12px 16px" }}>
        <div
          style={{
            padding: "10px 12px",
            borderRadius: "10px",
            background: isDark ? "rgba(255,255,255,0.03)" : "#f8fafc",
            border: isDark ? "1px solid rgba(255,255,255,0.06)" : "1px solid #e2e8f0",
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}
        >
          <div
            style={{
              width: "28px",
              height: "28px",
              borderRadius: "8px",
              background: isDark ? "rgba(16,185,129,0.15)" : "rgba(16,185,129,0.1)",
              border: isDark ? "1px solid rgba(16,185,129,0.25)" : "1px solid rgba(16,185,129,0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: "10px",
              fontWeight: "700",
              color: isDark ? "#10b981" : "#059669",
              flexShrink: 0,
            }}
          >
            {(currentUser?.email?.[0] ?? "C").toUpperCase()}
          </div>
          <div style={{ minWidth: 0 }}>
            <div
              style={{
                fontSize: "12px",
                fontWeight: "600",
                color: isDark ? "#e2e8f0" : "#1e293b",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {currentUser?.email?.split("@")[0] || "Creator"}
            </div>
            <div
              style={{
                fontSize: "10px",
                color: isDark ? "#64748b" : "#64748b",
                fontFamily: "'JetBrains Mono', monospace",
              }}
            >
              Command Center
            </div>
          </div>
        </div>
      </div>

      {/* Primary Navigation Header */}
      <div
        style={{
          padding: "0 16px 6px",
          fontSize: "9px",
          fontWeight: "700",
          color: isDark ? "#334155" : "#94a3b8",
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          fontFamily: "'JetBrains Mono', monospace",
        }}
      >
        Navigation
      </div>

      <nav style={{ padding: "0 8px", flex: 1 }}>
        {navList.map((item) => {
          const isActive = activeTab === item.id || (activeTab === "overview" && item.id === "command_center");
          return (
            <button
              key={item.id}
              onClick={() => {
                if (item.id === "admin") {
                  window.location.href = "/admin";
                } else {
                  setActiveTab(item.id);
                }
              }}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "9px 12px",
                borderRadius: "9px",
                border: isActive
                  ? isDark
                    ? "1px solid rgba(168,85,247,0.25)"
                    : "1px solid rgba(168,85,247,0.3)"
                  : "1px solid transparent",
                background: isActive
                  ? isDark
                    ? "rgba(168,85,247,0.1)"
                    : "rgba(168,85,247,0.08)"
                  : "transparent",
                cursor: "pointer",
                fontSize: "13px",
                fontWeight: isActive ? "600" : "500",
                color: isActive
                  ? isDark
                    ? "#c084fc"
                    : "#9333ea"
                  : isDark
                  ? "#64748b"
                  : "#475569",
                textAlign: "left",
                marginBottom: "2px",
                transition: "all 0.15s ease",
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  (e.currentTarget as HTMLButtonElement).style.color = isDark ? "#94a3b8" : "#0f172a";
                  (e.currentTarget as HTMLButtonElement).style.background = isDark ? "rgba(255,255,255,0.04)" : "#f1f5f9";
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  (e.currentTarget as HTMLButtonElement).style.color = isDark ? "#64748b" : "#475569";
                  (e.currentTarget as HTMLButtonElement).style.background = "transparent";
                }
              }}
            >
              <span style={{ fontSize: "13px", flexShrink: 0 }}>{item.icon}</span>
              <span>{item.name}</span>
            </button>
          );
        })}
      </nav>

      {/* Footer User Info & Sign Out */}
      <div
        style={{
          padding: "12px",
          borderTop: isDark ? "1px solid rgba(255,255,255,0.05)" : "1px solid #e2e8f0",
          marginTop: "auto",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "0 4px 8px" }}>
          <div
            style={{
              width: "28px",
              height: "28px",
              borderRadius: "50%",
              background: isDark ? "rgba(168,85,247,0.15)" : "rgba(168,85,247,0.1)",
              border: isDark ? "1px solid rgba(168,85,247,0.2)" : "1px solid rgba(168,85,247,0.3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "11px",
              fontWeight: "700",
              color: isDark ? "#c084fc" : "#9333ea",
              flexShrink: 0,
            }}
          >
            {(currentUser?.email?.[0] ?? "C").toUpperCase()}
          </div>
          <div style={{ minWidth: 0 }}>
            <div
              style={{
                fontSize: "11px",
                fontWeight: "600",
                color: isDark ? "#cbd5e1" : "#1e293b",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {currentUser?.email || ""}
            </div>
            <div style={{ fontSize: "9px", color: isDark ? "#10b981" : "#059669", fontFamily: "monospace" }}>● PRO OPERATING SYSTEM</div>
          </div>
        </div>
        <button
          onClick={logout}
          style={{
            width: "100%",
            padding: "8px",
            borderRadius: "8px",
            background: "transparent",
            border: isDark ? "1px solid rgba(255,255,255,0.06)" : "1px solid #cbd5e1",
            color: isDark ? "#475569" : "#64748b",
            fontSize: "12px",
            fontWeight: "500",
            cursor: "pointer",
            transition: "all 0.15s ease",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.color = "#f43f5e";
            (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(244,63,94,0.25)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.color = isDark ? "#475569" : "#64748b";
            (e.currentTarget as HTMLButtonElement).style.borderColor = isDark ? "rgba(255,255,255,0.06)" : "#cbd5e1";
          }}
        >
          Sign Out
        </button>
      </div>
    </aside>
  );
};

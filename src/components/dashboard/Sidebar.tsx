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
  { id: "copilot",        name: "AI Copilot",     icon: "🤖" },
  { id: "reports",        name: "Executive Reports", icon: "📄" },
  { id: "live",           name: "Live",           icon: "📡" },
  { id: "content",        name: "Content",        icon: "🎥" },
  { id: "audience",       name: "Audience",       icon: "👥" },
  { id: "settings",       name: "Settings",       icon: "⚙" },
];

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const { currentUser, logout } = useApp();

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
        background: "#0b0d16",
        borderRight: "1px solid rgba(255,255,255,0.06)",
        overflowY: "auto",
        overflowX: "hidden",
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
            <div style={{ fontSize: "14px", fontWeight: "700", color: "#f1f5f9", lineHeight: 1.2 }}>
              NexCreator
            </div>
            <div
              style={{
                fontSize: "9px",
                fontWeight: "700",
                color: "#a855f7",
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
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.06)",
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
              background: "rgba(16,185,129,0.15)",
              border: "1px solid rgba(16,185,129,0.25)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: "10px",
              fontWeight: "700",
              color: "#10b981",
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
                color: "#e2e8f0",
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
                color: "#64748b",
                fontFamily: "'JetBrains Mono', monospace",
              }}
            >
              Command Center
            </div>
          </div>
        </div>
      </div>

      {/* Primary Navigation */}
      <div
        style={{
          padding: "0 16px 6px",
          fontSize: "9px",
          fontWeight: "700",
          color: "#334155",
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
                border: isActive ? "1px solid rgba(168,85,247,0.25)" : "1px solid transparent",
                background: isActive ? "rgba(168,85,247,0.1)" : "transparent",
                cursor: "pointer",
                fontSize: "13px",
                fontWeight: isActive ? "600" : "500",
                color: isActive ? "#c084fc" : "#64748b",
                textAlign: "left",
                marginBottom: "2px",
                transition: "all 0.15s ease",
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  (e.currentTarget as HTMLButtonElement).style.color = "#94a3b8";
                  (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.04)";
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  (e.currentTarget as HTMLButtonElement).style.color = "#64748b";
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
          borderTop: "1px solid rgba(255,255,255,0.05)",
          marginTop: "auto",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "0 4px 8px" }}>
          <div
            style={{
              width: "28px",
              height: "28px",
              borderRadius: "50%",
              background: "rgba(168,85,247,0.15)",
              border: "1px solid rgba(168,85,247,0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "11px",
              fontWeight: "700",
              color: "#c084fc",
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
                color: "#cbd5e1",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {currentUser?.email || ""}
            </div>
            <div style={{ fontSize: "9px", color: "#10b981", fontFamily: "monospace" }}>● PRO OPERATING SYSTEM</div>
          </div>
        </div>
        <button
          onClick={logout}
          style={{
            width: "100%",
            padding: "8px",
            borderRadius: "8px",
            background: "transparent",
            border: "1px solid rgba(255,255,255,0.06)",
            color: "#475569",
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
            (e.currentTarget as HTMLButtonElement).style.color = "#475569";
            (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(255,255,255,0.06)";
          }}
        >
          Sign Out
        </button>
      </div>
    </aside>
  );
};

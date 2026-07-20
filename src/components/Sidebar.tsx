"use client";

import React from "react";
import { useApp } from "../context/AppContext";

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const { currentUser, logout } = useApp();

  const menuItems = [
    { id: "overview", label: "Dashboard", icon: "📊" },
    { id: "calendar", label: "Content Calendar", icon: "📅" },
    { id: "crm", label: "Brand Deals CRM", icon: "💼" },
    { id: "tasks", label: "Collaborator Tasks", icon: "👥" },
  ];

  if (currentUser?.isAdmin) {
    menuItems.push({ id: "admin", label: "Admin Approval", icon: "🛡️" });
  }

  return (
    <aside className="sidebar">
      {/* Brand logo */}
      <div style={{ marginBottom: "40px", padding: "0 8px" }}>
        <h2 style={{ fontSize: "1.3rem", fontWeight: 800, background: "linear-gradient(135deg, var(--accent-purple) 0%, var(--accent-pink) 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
          🚀 CREATOR HUB
        </h2>
        <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
          Manager Suite
        </span>
      </div>

      {/* Navigation menu */}
      <nav style={{ display: "flex", flexDirection: "column", gap: "8px", flex: 1 }}>
        {menuItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                width: "100%",
                padding: "12px 16px",
                borderRadius: "var(--radius-md)",
                border: "none",
                background: isActive ? "var(--bg-input)" : "transparent",
                color: isActive ? "var(--text-primary)" : "var(--text-secondary)",
                fontWeight: isActive ? 600 : 500,
                fontSize: "0.95rem",
                cursor: "pointer",
                textAlign: "left",
                transition: "var(--transition-fast)",
                borderLeft: isActive ? "3px solid var(--accent-purple)" : "3px solid transparent",
              }}
              onMouseEnter={(e) => {
                if (!isActive) e.currentTarget.style.color = "var(--text-primary)";
              }}
              onMouseLeave={(e) => {
                if (!isActive) e.currentTarget.style.color = "var(--text-secondary)";
              }}
            >
              <span style={{ fontSize: "1.1rem" }}>{item.icon}</span>
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* Profile summary + Logout */}
      <div style={{ borderTop: "1px solid var(--border-color)", paddingTop: "20px", marginTop: "auto" }}>
        <div style={{ marginBottom: "16px", padding: "0 8px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{
              width: "36px",
              height: "36px",
              borderRadius: "50%",
              background: "linear-gradient(135deg, var(--accent-purple) 0%, var(--accent-blue) 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 700,
              fontSize: "0.85rem",
              color: "white"
            }}>
              {currentUser?.email.charAt(0).toUpperCase()}
            </div>
            <div style={{ overflow: "hidden" }}>
              <p style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {currentUser?.email}
              </p>
              <p style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                {currentUser?.isAdmin ? "Administrator" : "Verified Creator"}
              </p>
            </div>
          </div>
        </div>
        <button
          onClick={logout}
          className="btn btn-secondary"
          style={{ width: "100%", padding: "10px", fontSize: "0.85rem" }}
        >
          👋 Log Out
        </button>
      </div>
    </aside>
  );
};

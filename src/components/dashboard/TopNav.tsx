"use client";

import React from "react";
import { useApp } from "@/context/AppContext";
import { Moon, Sun } from "lucide-react";

export const TopNav: React.FC = () => {
  const { activeLiveJob, currentUser, theme, toggleTheme } = useApp();
  const isDark = theme === "dark";

  return (
    <header
      style={{
        height: "56px",
        flexShrink: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 28px",
        background: isDark ? "rgba(6, 8, 16, 0.92)" : "rgba(255, 255, 255, 0.95)",
        borderBottom: isDark ? "1px solid rgba(255,255,255,0.06)" : "1px solid #e2e8f0",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        position: "sticky",
        top: 0,
        zIndex: 50,
        gap: "16px",
        transition: "background 0.2s ease, border-color 0.2s ease",
      }}
    >
      {/* Search */}
      <div style={{ position: "relative", flexShrink: 0 }}>
        <svg
          style={{
            position: "absolute",
            left: "10px",
            top: "50%",
            transform: "translateY(-50%)",
            width: "13px",
            height: "13px",
            color: isDark ? "#475569" : "#94a3b8",
            pointerEvents: "none",
          }}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          placeholder="Search... (⌘K)"
          style={{
            width: "220px",
            padding: "7px 12px 7px 32px",
            background: isDark ? "rgba(255,255,255,0.04)" : "#f1f5f9",
            border: isDark ? "1px solid rgba(255,255,255,0.07)" : "1px solid #cbd5e1",
            borderRadius: "8px",
            color: isDark ? "#94a3b8" : "#334155",
            fontSize: "12px",
            outline: "none",
            fontFamily: "'Inter', sans-serif",
          }}
        />
      </div>

      {/* Right side */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginLeft: "auto" }}>
        {/* Live status */}
        {activeLiveJob ? (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "5px 10px",
              borderRadius: "99px",
              background: isDark ? "rgba(16,185,129,0.08)" : "rgba(16,185,129,0.1)",
              border: isDark ? "1px solid rgba(16,185,129,0.2)" : "1px solid rgba(16,185,129,0.25)",
              color: isDark ? "#10b981" : "#059669",
              fontSize: "10px",
              fontWeight: "700",
              fontFamily: "'JetBrains Mono', monospace",
              letterSpacing: "0.05em",
              textTransform: "uppercase",
            }}
          >
            <span className="live-pulse-dot" />
            Monitoring Active
          </div>
        ) : (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "5px 10px",
              borderRadius: "99px",
              background: isDark ? "rgba(255,255,255,0.03)" : "#f1f5f9",
              border: isDark ? "1px solid rgba(255,255,255,0.07)" : "1px solid #cbd5e1",
              color: isDark ? "#475569" : "#64748b",
              fontSize: "10px",
              fontFamily: "'JetBrains Mono', monospace",
              letterSpacing: "0.05em",
              textTransform: "uppercase",
            }}
          >
            <span
              style={{
                width: "6px",
                height: "6px",
                borderRadius: "50%",
                background: isDark ? "#334155" : "#94a3b8",
                display: "inline-block",
              }}
            />
            Standby
          </div>
        )}

        {/* Theme Switcher Button */}
        <button
          onClick={toggleTheme}
          title={`Switch to ${isDark ? "Light" : "Dark"} Mode`}
          style={{
            width: "32px",
            height: "32px",
            borderRadius: "8px",
            background: isDark ? "rgba(255,255,255,0.04)" : "#f1f5f9",
            border: isDark ? "1px solid rgba(255,255,255,0.07)" : "1px solid #cbd5e1",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            color: isDark ? "#cbd5e1" : "#334155",
            flexShrink: 0,
            transition: "all 0.15s ease",
          }}
        >
          {isDark ? (
            <Sun style={{ width: "14px", height: "14px", color: "#fbbf24" }} />
          ) : (
            <Moon style={{ width: "14px", height: "14px", color: "#9333ea" }} />
          )}
        </button>

        {/* Bell */}
        <button
          style={{
            width: "32px",
            height: "32px",
            borderRadius: "8px",
            background: isDark ? "rgba(255,255,255,0.04)" : "#f1f5f9",
            border: isDark ? "1px solid rgba(255,255,255,0.07)" : "1px solid #cbd5e1",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            color: isDark ? "#64748b" : "#64748b",
            position: "relative",
            flexShrink: 0,
          }}
        >
          <svg style={{ width: "14px", height: "14px" }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          <span
            style={{
              position: "absolute",
              top: "7px",
              right: "7px",
              width: "5px",
              height: "5px",
              borderRadius: "50%",
              background: "#a855f7",
            }}
          />
        </button>

        {/* Admin Ops Button */}
        {Boolean(
          currentUser?.isAdmin ||
          (currentUser as any)?.role === "admin" ||
          currentUser?.email?.toLowerCase().includes("admin")
        ) && (
          <a
            href="/admin"
            style={{
              padding: "7px 14px",
              borderRadius: "8px",
              background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
              border: "none",
              color: "#fff",
              fontSize: "11px",
              fontWeight: "700",
              fontFamily: "'JetBrains Mono', monospace",
              letterSpacing: "0.08em",
              cursor: "pointer",
              boxShadow: "0 4px 12px rgba(16,185,129,0.3)",
              flexShrink: 0,
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
              gap: "4px",
            }}
          >
            ⚡ ADMIN OPS
          </a>
        )}

        {/* Pro button */}
        <button
          style={{
            padding: "7px 14px",
            borderRadius: "8px",
            background: "linear-gradient(135deg, #a855f7 0%, #6366f1 100%)",
            border: "none",
            color: "#fff",
            fontSize: "11px",
            fontWeight: "700",
            fontFamily: "'JetBrains Mono', monospace",
            letterSpacing: "0.08em",
            cursor: "pointer",
            boxShadow: "0 4px 12px rgba(168,85,247,0.3)",
            flexShrink: 0,
          }}
        >
          ⚡ PRO
        </button>
      </div>
    </header>
  );
};

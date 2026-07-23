"use client";

import React from "react";
import { useApp } from "@/context/AppContext";

export const TopNav: React.FC = () => {
  const { activeLiveJob } = useApp();

  return (
    <header
      style={{
        height: "56px",
        flexShrink: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 28px",
        background: "rgba(6, 8, 16, 0.92)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        position: "sticky",
        top: 0,
        zIndex: 50,
        gap: "16px",
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
            color: "#475569",
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
            padding: "7px 12px 7px 30px",
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: "8px",
            color: "#94a3b8",
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
              background: "rgba(16,185,129,0.08)",
              border: "1px solid rgba(16,185,129,0.2)",
              color: "#10b981",
              fontSize: "10px",
              fontWeight: "700",
              fontFamily: "'JetBrains Mono', monospace",
              letterSpacing: "0.05em",
              textTransform: "uppercase" as const,
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
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.07)",
              color: "#475569",
              fontSize: "10px",
              fontFamily: "'JetBrains Mono', monospace",
              letterSpacing: "0.05em",
              textTransform: "uppercase" as const,
            }}
          >
            <span
              style={{
                width: "6px",
                height: "6px",
                borderRadius: "50%",
                background: "#334155",
                display: "inline-block",
              }}
            />
            Standby
          </div>
        )}

        {/* Bell */}
        <button
          style={{
            width: "32px",
            height: "32px",
            borderRadius: "8px",
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.07)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            color: "#64748b",
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

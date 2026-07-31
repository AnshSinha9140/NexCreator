"use client";

import React, { useState, useEffect } from "react";

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (tab: string) => void;
  onStartMonitoring: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onNavigate,
  onStartMonitoring,
}) => {
  const [query, setQuery] = useState("");

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (isOpen) onClose();
        else {
          // Open signal
          const ev = new CustomEvent("toggle-command-palette");
          window.dispatchEvent(ev);
        }
      } else if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const actions = [
    { label: "📡 Start Monitoring Stream", icon: "📡", action: onStartMonitoring },
    { label: "🏠 Go to Home Dashboard", icon: "🏠", action: () => { onNavigate("home"); onClose(); } },
    { label: "📬 Open Creator Inbox", icon: "📬", action: () => { onNavigate("inbox"); onClose(); } },
    { label: "🧠 Go to AI Manager / Intelligence", icon: "🧠", action: () => { onNavigate("intelligence"); onClose(); } },
    { label: "📈 Open Content Strategy", icon: "📈", action: () => { onNavigate("strategy"); onClose(); } },
    { label: "📊 Compare Stream Performance", icon: "📊", action: () => { onNavigate("compare"); onClose(); } },
    { label: "📜 View Stream History Timeline", icon: "📜", action: () => { onNavigate("history"); onClose(); } },
  ];

  const filtered = actions.filter((a) => a.label.toLowerCase().includes(query.toLowerCase()));

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "rgba(0, 0, 0, 0.75)",
        backdropFilter: "blur(10px)",
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        paddingTop: "100px",
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: "600px",
          borderRadius: "16px",
          background: "#0d101b",
          border: "1px solid rgba(255, 255, 255, 0.15)",
          boxShadow: "0 20px 50px rgba(0,0,0,0.8)",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div style={{ padding: "16px", borderBottom: "1px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", gap: "12px" }}>
          <span style={{ fontSize: "18px" }}>🔍</span>
          <input
            type="text"
            autoFocus
            placeholder="Type a command or search workspace (Ctrl + K)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{
              flex: 1,
              background: "transparent",
              border: "none",
              outline: "none",
              color: "#f8fafc",
              fontSize: "15px",
              fontFamily: "'Inter', sans-serif",
            }}
          />
          <span style={{ fontSize: "11px", color: "#64748b", background: "rgba(255,255,255,0.06)", padding: "3px 6px", borderRadius: "4px" }}>ESC to close</span>
        </div>

        {/* Results List */}
        <div style={{ padding: "10px", maxHeight: "360px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "4px" }}>
          {filtered.length === 0 ? (
            <div style={{ padding: "20px", textAlign: "center", color: "#64748b", fontSize: "13px" }}>
              No matching commands found.
            </div>
          ) : (
            filtered.map((item, idx) => (
              <div
                key={idx}
                onClick={item.action}
                style={{
                  padding: "12px 14px",
                  borderRadius: "10px",
                  background: "rgba(255,255,255,0.02)",
                  color: "#f8fafc",
                  fontSize: "13px",
                  fontWeight: "600",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  transition: "all 0.15s ease",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.background = "rgba(52, 211, 153, 0.12)";
                  (e.currentTarget as HTMLElement).style.color = "#34d399";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.02)";
                  (e.currentTarget as HTMLElement).style.color = "#f8fafc";
                }}
              >
                <span>{item.label}</span>
                <span style={{ fontSize: "11px", color: "#64748b" }}>Command</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

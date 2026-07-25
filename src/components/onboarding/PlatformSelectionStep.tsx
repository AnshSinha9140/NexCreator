"use client";

import React from "react";
import { motion } from "framer-motion";
import { useOnboarding } from "@/context/OnboardingContext";

const PLATFORMS = [
  { id: "kick", name: "Kick.com", icon: "K", iconColor: "#53fc18", status: "active", desc: "Live Chat Bridge & Sentiment Engine" },
  { id: "youtube", name: "YouTube", icon: "▶", iconColor: "#ff0000", status: "active", desc: "Live Streams & Video Analytics" },
  { id: "twitch", name: "Twitch", icon: "👾", iconColor: "#9146ff", status: "coming_soon", desc: "Twitch Live Chat Bridge (Coming Soon)" },
  { id: "tiktok", name: "TikTok", icon: "🎵", iconColor: "#00f2fe", status: "coming_soon", desc: "TikTok Live Monitoring (Coming Soon)" },
];

export const PlatformSelectionStep: React.FC = () => {
  const { state, updatePlatformSelection } = useOnboarding();
  const selected = state.platformSelection.selectedPlatforms;

  const togglePlatform = (id: string, isComingSoon: boolean) => {
    if (isComingSoon) return;
    const exists = selected.includes(id);
    const updated = exists
      ? selected.filter((p) => p !== id)
      : [...selected, id];
    updatePlatformSelection({ selectedPlatforms: updated });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      style={{ display: "flex", flexDirection: "column", gap: "16px" }}
    >
      <div style={{ fontSize: "12px", color: "#94a3b8", marginBottom: "4px" }}>
        Select the streaming and content platforms you actively broadcast on:
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
        {PLATFORMS.map((p) => {
          const isComingSoon = p.status === "coming_soon";
          const isSelected = selected.includes(p.id);

          return (
            <div
              key={p.id}
              onClick={() => togglePlatform(p.id, isComingSoon)}
              style={{
                padding: "16px",
                borderRadius: "14px",
                border: isSelected && !isComingSoon
                  ? "1px solid rgba(168, 85, 247, 0.4)"
                  : "1px solid rgba(255, 255, 255, 0.07)",
                background: isSelected && !isComingSoon
                  ? "rgba(168, 85, 247, 0.12)"
                  : "rgba(255, 255, 255, 0.02)",
                cursor: isComingSoon ? "not-allowed" : "pointer",
                opacity: isComingSoon ? 0.6 : 1,
                transition: "all 0.15s ease",
                display: "flex",
                flexDirection: "column",
                gap: "8px",
                position: "relative",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <span style={{ fontSize: "18px", fontWeight: "900", color: p.iconColor }}>{p.icon}</span>
                  <span style={{ fontSize: "14px", fontWeight: "700", color: "#f8fafc" }}>{p.name}</span>
                </div>

                {isComingSoon ? (
                  <span
                    style={{
                      fontSize: "9px",
                      fontWeight: "700",
                      padding: "2px 8px",
                      borderRadius: "99px",
                      background: "rgba(255, 255, 255, 0.06)",
                      border: "1px solid rgba(255, 255, 255, 0.1)",
                      color: "#64748b",
                      fontFamily: "'JetBrains Mono', monospace",
                      textTransform: "uppercase",
                    }}
                  >
                    Coming Soon
                  </span>
                ) : (
                  <div
                    style={{
                      width: "18px",
                      height: "18px",
                      borderRadius: "50%",
                      border: isSelected ? "5px solid #a855f7" : "2px solid rgba(255, 255, 255, 0.2)",
                      transition: "all 0.15s ease",
                    }}
                  />
                )}
              </div>

              <div style={{ fontSize: "11px", color: "#64748b", lineHeight: 1.4 }}>{p.desc}</div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
};

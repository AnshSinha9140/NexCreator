"use client";

import React from "react";
import { motion } from "framer-motion";
import { useOnboarding } from "@/context/OnboardingContext";

export const CreatorProfileStep: React.FC = () => {
  const { state, updateProfile } = useOnboarding();
  const profile = state.creatorProfile;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      style={{ display: "flex", flexDirection: "column", gap: "24px" }}
    >
      <div>
        <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#94a3b8", marginBottom: "8px" }}>
          Display Name <span style={{ color: "#fb7185" }}>*</span>
        </label>
        <input
          type="text"
          placeholder="e.g. Alex Rivera or 8bit_goldy"
          value={profile.displayName}
          onChange={(e) => updateProfile({ displayName: e.target.value })}
          autoFocus
        />
        <span style={{ fontSize: "11px", color: "#64748b", marginTop: "6px", display: "block" }}>
          This is the name displayed across your live stream pulse & AI producer dashboard.
        </span>
      </div>

      <div>
        <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#94a3b8", marginBottom: "8px" }}>
          Profile Picture URL <span style={{ color: "#64748b", fontWeight: "normal" }}>(Optional)</span>
        </label>
        <input
          type="url"
          placeholder="https://example.com/avatar.png"
          value={profile.avatarUrl || ""}
          onChange={(e) => updateProfile({ avatarUrl: e.target.value })}
        />
      </div>
    </motion.div>
  );
};

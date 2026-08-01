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
      style={{ display: "flex", flexDirection: "column", gap: "24px", fontFamily: "'Inter', sans-serif" }}
    >
      <div>
        <label style={{ display: "block", fontSize: "14px", fontWeight: "700", color: "#f8fafc", marginBottom: "8px" }}>
          What should I call you? <span style={{ color: "#fb7185" }}>*</span>
        </label>
        <input
          type="text"
          placeholder="e.g. Alex Rivera or 8bit_goldy"
          value={profile.displayName}
          onChange={(e) => updateProfile({ displayName: e.target.value })}
          autoFocus
        />
        <span style={{ fontSize: "12px", color: "#94a3b8", marginTop: "6px", display: "block" }}>
          This is how I'll address you across your live workspace and manager briefings.
        </span>
      </div>

      <div>
        <label style={{ display: "block", fontSize: "14px", fontWeight: "700", color: "#f8fafc", marginBottom: "8px" }}>
          What do you love creating? <span style={{ color: "#64748b", fontWeight: "normal" }}>(Optional)</span>
        </label>
        <input
          type="text"
          placeholder="e.g. High-stakes FPS games, comedic reactions, chill chat Q&As"
          value={profile.avatarUrl || ""}
          onChange={(e) => updateProfile({ avatarUrl: e.target.value })}
        />
        <span style={{ fontSize: "12px", color: "#94a3b8", marginTop: "6px", display: "block" }}>
          This helps me tailor my focus when reviewing your stream moments.
        </span>
      </div>
    </motion.div>
  );
};

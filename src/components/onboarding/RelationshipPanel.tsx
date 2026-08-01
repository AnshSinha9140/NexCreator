"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useOnboarding } from "@/context/OnboardingContext";

interface RelationshipPanelProps {
  currentStepIndex: number;
}

export const RelationshipPanel: React.FC<RelationshipPanelProps> = ({ currentStepIndex }) => {
  const { state } = useOnboarding();
  const profile = state.creatorProfile;
  const selectedPlatforms = state.platformSelection.selectedPlatforms;
  const goals = state.goals.goals;

  // Dynamic Card Data per Step Index
  const getWhyImAsking = () => {
    switch (currentStepIndex) {
      case 0:
        return "The advice I give later depends on understanding who you are today.";
      case 1:
        return "Knowing your name and content focus allows me to personalize future manager briefings.";
      case 2:
        return "Platform dynamics shape audience behavior. This helps me analyze chat velocity accurately.";
      case 3:
        return "Reviewing existing content helps me establish your broadcast baseline before your next stream.";
      case 4:
        return "Every creator grows differently. Defining your vision helps me tailor strategic advice.";
      case 5:
        return "Our relationship is a long-term partnership focused on continuous improvement.";
      default:
        return "Understanding your vision enables long-term creator growth.";
    }
  };

  const getManagerThought = () => {
    switch (currentStepIndex) {
      case 0:
        return "Right now I'm mostly listening.";
      case 1:
        return "Every creator has a different journey and personal voice.";
      case 2:
        return "Community culture is built around where viewers meet you.";
      case 3:
        return "Analyzing real content is the fastest path to meaningful progress.";
      case 4:
        return "Long-term growth is always more important than short-term spikes.";
      case 5:
        return "The better I understand you today, the better every future recommendation becomes.";
      default:
        return "Every stream is an opportunity to learn and refine.";
    }
  };

  const getCurrentFocus = () => {
    switch (currentStepIndex) {
      case 0:
        return { focus: "Meeting & Introduction", estTime: "50s" };
      case 1:
        return { focus: "Content Style & Identity", estTime: "40s" };
      case 2:
        return { focus: "Platform & Community Culture", estTime: "30s" };
      case 3:
        return { focus: "Content Baseline Review", estTime: "20s" };
      case 4:
        return { focus: "Long-Term Growth Goals", estTime: "10s" };
      case 5:
        return { focus: "Workspace Initialization", estTime: "0s" };
      default:
        return { focus: "Workspace Preparation", estTime: "30s" };
    }
  };

  const focusData = getCurrentFocus();

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4 }}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "18px",
        fontFamily: "'Inter', sans-serif",
        color: "#e2e8f0",
      }}
    >
      {/* Card 1: Creator Snapshot */}
      <div
        style={{
          padding: "20px",
          borderRadius: "20px",
          background: "rgba(18, 22, 40, 0.7)",
          backdropFilter: "blur(16px)",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          display: "flex",
          flexDirection: "column",
          gap: "12px",
          boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
        }}
      >
        <div style={{ fontSize: "11px", fontWeight: "800", color: "#c084fc", textTransform: "uppercase", letterSpacing: "0.08em" }}>
          👤 Creator Snapshot
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "13px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ color: "#94a3b8" }}>Name</span>
            <span style={{ color: "#f8fafc", fontWeight: "700" }}>{profile.displayName || "Meeting You..."}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ color: "#94a3b8" }}>Platforms</span>
            <span style={{ color: "#38bdf8", fontWeight: "600", textTransform: "uppercase" }}>
              {selectedPlatforms.length > 0 ? selectedPlatforms.join(", ") : "Pending"}
            </span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ color: "#94a3b8" }}>Workspace</span>
            <span style={{ color: "#4ade80", fontWeight: "600" }}>Initializing</span>
          </div>
        </div>
      </div>

      {/* Card 2: What I've Learned (Dynamic Checklist) */}
      <div
        style={{
          padding: "20px",
          borderRadius: "20px",
          background: "rgba(18, 22, 40, 0.7)",
          backdropFilter: "blur(16px)",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          display: "flex",
          flexDirection: "column",
          gap: "12px",
          boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
        }}
      >
        <div style={{ fontSize: "11px", fontWeight: "800", color: "#c084fc", textTransform: "uppercase", letterSpacing: "0.08em" }}>
          📝 What I've Learned
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "12px" }}>
          {[
            { label: "Creator Name", completed: currentStepIndex >= 1 && !!profile.displayName },
            { label: "Content Focus", completed: currentStepIndex >= 1 },
            { label: "Platform Selection", completed: currentStepIndex >= 2 },
            { label: "Channel Baseline", completed: currentStepIndex >= 3 },
            { label: "Growth Goals", completed: currentStepIndex >= 4 },
            { label: "Manager Promise", completed: currentStepIndex >= 5 },
          ].map((item, idx) => (
            <div key={idx} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ color: item.completed ? "#4ade80" : "#64748b", fontWeight: "bold" }}>
                {item.completed ? "✓" : "○"}
              </span>
              <span style={{ color: item.completed ? "#f8fafc" : "#64748b", fontWeight: item.completed ? "600" : "normal" }}>
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Card 3: Why I'm Asking */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`why_${currentStepIndex}`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
          style={{
            padding: "18px",
            borderRadius: "18px",
            background: "linear-gradient(135deg, rgba(147, 51, 234, 0.12) 0%, rgba(59, 130, 246, 0.08) 100%)",
            border: "1px solid rgba(147, 51, 234, 0.25)",
            display: "flex",
            flexDirection: "column",
            gap: "6px",
          }}
        >
          <div style={{ fontSize: "11px", fontWeight: "800", color: "#c084fc", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            💡 Why I'm Asking
          </div>
          <div style={{ fontSize: "13px", color: "#cbd5e1", lineHeight: "1.5" }}>
            "{getWhyImAsking()}"
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Card 4: Conversation Memory & Current Focus */}
      <div
        style={{
          padding: "18px",
          borderRadius: "18px",
          background: "rgba(18, 22, 40, 0.7)",
          backdropFilter: "blur(16px)",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          display: "flex",
          flexDirection: "column",
          gap: "10px",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: "11px", fontWeight: "800", color: "#38bdf8", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            ⏱️ Current Focus
          </span>
          <span style={{ fontSize: "11px", color: "#94a3b8", fontFamily: "monospace" }}>
            {focusData.estTime}
          </span>
        </div>
        <div style={{ fontSize: "13px", color: "#f8fafc", fontWeight: "700" }}>
          {focusData.focus}
        </div>
      </div>

      {/* Card 5: Manager Thought */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`thought_${currentStepIndex}`}
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          transition={{ duration: 0.3 }}
          style={{
            padding: "16px",
            borderRadius: "16px",
            background: "rgba(255, 255, 255, 0.02)",
            border: "1px solid rgba(255, 255, 255, 0.06)",
            fontSize: "12px",
            color: "#94a3b8",
            fontStyle: "italic",
            lineHeight: "1.5",
          }}
        >
          💭 "{getManagerThought()}"
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
};

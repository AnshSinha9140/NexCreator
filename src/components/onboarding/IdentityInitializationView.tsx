"use client";

import React from "react";
import { motion } from "framer-motion";
import { InitializationState } from "@/lib/identity/IdentityInitializationService";

export interface AISummaryData {
  whoIThinkYouAre: string;
  currentMission: string;
  missionReason: string;
  confidentAbout: string[];
  needToLearn: string[];
  relationshipLevel: string;
  streamsObserved: number;
}

interface IdentityInitializationViewProps {
  state: InitializationState;
  error?: string;
  summary?: AISummaryData | null;
  onRetry: () => void;
  onExplore: () => void;
}

const containerStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  minHeight: "80vh",
  color: "#f8fafc",
  maxWidth: "650px",
  margin: "0 auto",
  padding: "24px",
  textAlign: "center",
  fontFamily: "'Inter', sans-serif",
};

const cardStyle: React.CSSProperties = {
  background: "rgba(15, 23, 42, 0.65)",
  backdropFilter: "blur(12px)",
  border: "1px solid rgba(255, 255, 255, 0.08)",
  borderRadius: 24,
  padding: "40px",
  width: "100%",
  boxShadow: "0 12px 48px rgba(0, 0, 0, 0.4)",
  textAlign: "left",
};

const stepMapping: Record<InitializationState, { step: number; text: string }> = {
  NOT_STARTED: { step: 1, text: "Initializing identity build..." },
  INITIALIZING: { step: 1, text: "Starting initialization..." },
  BUILDING_KNOWLEDGE_GRAPH: { step: 3, text: "Building Knowledge Graph..." },
  GENERATING_DNA: { step: 1, text: "Generating Creator DNA..." },
  GENERATING_MISSION: { step: 2, text: "Creating your long-term mission..." },
  INITIALIZING_BRAIN: { step: 4, text: "Initializing your AI Creator Manager..." },
  READY: { step: 5, text: "Identity Build Complete" },
  FAILED: { step: 0, text: "Generation Failed" },
};

export const IdentityInitializationView: React.FC<IdentityInitializationViewProps> = ({
  state,
  error,
  summary,
  onRetry,
  onExplore,
}) => {
  const currentStepInfo = stepMapping[state] || { step: 1, text: "Processing..." };

  // Onboarding Completed Checklist
  const checklist = ["Creator Profile", "Goals", "Platforms", "Audience", "Preferences"];

  if (state === "READY") {
    return (
      <div style={containerStyle}>
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          style={cardStyle}
        >
          <div style={{ textAlign: "center", marginBottom: "20px" }}>
            <span style={{ fontSize: "44px" }}>🧠</span>
            <h1 style={{ fontSize: "26px", fontWeight: 800, color: "#f8fafc", margin: "10px 0 4px" }}>
              I&apos;ve Finished Learning About You
            </h1>
            <p style={{ color: "#94a3b8", fontSize: "13px", margin: 0 }}>
              Onboarding data integrated. Baseline identity model constructed successfully.
            </p>
          </div>

          {/* AI Summary sections (Part 8) */}
          <div style={{ display: "flex", flexDirection: "column", gap: "20px", marginBottom: "32px", borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "20px" }}>
            
            {/* Who I think you are */}
            <div>
              <h3 style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "1px", color: "#a855f7", margin: "0 0 6px" }}>
                Who I Think You Are
              </h3>
              <p style={{ fontSize: "14px", color: "#cbd5e1", lineHeight: 1.5, margin: 0 }}>
                {summary?.whoIThinkYouAre}
              </p>
            </div>

            {/* Current mission */}
            <div>
              <h3 style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "1px", color: "#6366f1", margin: "0 0 6px" }}>
                Your Current Mission
              </h3>
              <p style={{ fontSize: "14px", color: "#cbd5e1", lineHeight: 1.5, margin: 0, fontWeight: 600 }}>
                {summary?.currentMission}
              </p>
              {summary?.missionReason && (
                <p style={{ fontSize: "12px", color: "#94a3b8", margin: "4px 0 0" }}>
                  <i>Why: {summary.missionReason}</i>
                </p>
              )}
            </div>

            {/* Confident / Learning fields */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div>
                <h3 style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "1px", color: "#34d399", margin: "0 0 8px" }}>
                  What I&apos;m Already Confident About
                </h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  {summary?.confidentAbout.map((item) => (
                    <span key={item} style={{ background: "rgba(52, 211, 153, 0.1)", color: "#34d399", padding: "4px 10px", borderRadius: "6px", fontSize: "12px", fontWeight: 600 }}>
                      ✓ {item}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <h3 style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "1px", color: "#fbbf24", margin: "0 0 8px" }}>
                  What I Still Need To Learn
                </h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  {summary?.needToLearn.map((item) => (
                    <span key={item} style={{ background: "rgba(251, 191, 36, 0.1)", color: "#fbbf24", padding: "4px 10px", borderRadius: "6px", fontSize: "12px", fontWeight: 600 }}>
                      ⏳ {item}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Learning Phase Stage */}
            <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "12px", padding: "12px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <span style={{ fontSize: "10px", color: "#94a3b8", textTransform: "uppercase" }}>Overall Learning Phase</span>
                <div style={{ fontSize: "14px", fontWeight: 700, color: "#f8fafc", marginTop: "2px" }}>
                  {summary?.relationshipLevel === "NEW_CREATOR" ? "Learning Phase (Baseline)" : summary?.relationshipLevel}
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <span style={{ fontSize: "10px", color: "#94a3b8", textTransform: "uppercase" }}>Streams Observed</span>
                <div style={{ fontSize: "14px", fontWeight: 700, color: "#c084fc", marginTop: "2px" }}>
                  {summary?.streamsObserved} streams
                </div>
              </div>
            </div>

          </div>

          <button
            onClick={onExplore}
            style={{
              background: "linear-gradient(135deg, #a855f7, #6366f1)",
              border: "none",
              borderRadius: "14px",
              color: "#fff",
              cursor: "pointer",
              fontSize: "15px",
              fontWeight: 800,
              padding: "16px 32px",
              width: "100%",
              boxShadow: "0 4px 20px rgba(168, 85, 247, 0.4)",
              textAlign: "center",
            }}
          >
            Explore My Creator Identity →
          </button>
        </motion.div>
      </div>
    );
  }

  if (state === "FAILED") {
    return (
      <div style={containerStyle}>
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          style={{ ...cardStyle, textAlign: "center" }}
        >
          <div style={{ fontSize: "56px", marginBottom: "16px" }}>⚠️</div>
          <h1 style={{ fontSize: "24px", fontWeight: 800, color: "#f8fafc", margin: "0 0 12px" }}>
            We couldn&apos;t finish building your Creator Profile.
          </h1>
          <p style={{ color: "#cbd5e1", fontSize: "14px", lineHeight: 1.6, marginBottom: "32px" }}>
            Something interrupted initialization. Your onboarding information is safe. Retry and I&apos;ll continue where I stopped.
          </p>
          {error && (
            <div style={{ background: "rgba(244, 63, 94, 0.08)", border: "1px solid rgba(244, 63, 94, 0.2)", borderRadius: "10px", padding: "12px", fontSize: "12px", color: "#f87171", marginBottom: "28px", textAlign: "left", fontFamily: "monospace" }}>
              Error: {error}
            </div>
          )}

          <div style={{ display: "flex", gap: "12px" }}>
            <button
              onClick={onRetry}
              style={{
                flex: 1,
                background: "linear-gradient(135deg, #a855f7, #6366f1)",
                border: "none",
                borderRadius: "14px",
                color: "#fff",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: 800,
                padding: "14px",
                boxShadow: "0 4px 12px rgba(168, 85, 247, 0.3)",
              }}
            >
              Retry Initialization
            </button>
            <button
              onClick={() => {
                if (typeof window !== "undefined") window.location.href = "/dashboard";
              }}
              style={{
                flex: 1,
                background: "rgba(255, 255, 255, 0.06)",
                border: "1px solid rgba(255, 255, 255, 0.12)",
                borderRadius: "14px",
                color: "#cbd5e1",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: 700,
                padding: "14px",
              }}
            >
              Return Home
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ ...cardStyle, textAlign: "center" }}
      >
        <div style={{ marginBottom: "24px", display: "flex", justifyContent: "center" }}>
          <div
            style={{
              width: "72px",
              height: "72px",
              borderRadius: "50%",
              background: "linear-gradient(135deg, rgba(168, 85, 247, 0.15), rgba(99, 102, 241, 0.15))",
              border: "1px solid rgba(168, 85, 247, 0.3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "32px",
              boxShadow: "0 0 24px rgba(168, 85, 247, 0.2)",
            }}
          >
            🧬
          </div>
        </div>

        <h1 style={{ fontSize: "24px", fontWeight: 800, color: "#f8fafc", margin: "0 0 8px" }}>
          Building Your Living Creator Profile
        </h1>
        <p style={{ color: "#94a3b8", fontSize: "14px", lineHeight: 1.5, margin: "0 0 24px" }}>
          &ldquo;I&apos;m learning who you are as a creator. Everything you shared during onboarding becomes the foundation for every recommendation I&apos;ll make.&rdquo;
        </p>

        {/* Checklist */}
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "10px", marginBottom: "32px" }}>
          {checklist.map((item) => (
            <span
              key={item}
              style={{
                background: "rgba(52, 211, 153, 0.12)",
                color: "#34d399",
                border: "1px solid rgba(52, 211, 153, 0.2)",
                borderRadius: "99px",
                padding: "4px 12px",
                fontSize: "11px",
                fontWeight: 700,
              }}
            >
              ✓ {item}
            </span>
          ))}
        </div>

        {/* Progress Display */}
        <div style={{ background: "rgba(0, 0, 0, 0.2)", borderRadius: "16px", padding: "20px", border: "1px solid rgba(255, 255, 255, 0.03)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
            <span style={{ fontSize: "11px", fontWeight: 700, color: "#a855f7", textTransform: "uppercase", letterSpacing: "1px" }}>
              Step {currentStepInfo.step} of 5
            </span>
            <span style={{ fontSize: "11px", color: "#64748b" }}>
              Do not close this page
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "12px", justifyContent: "center" }}>
            {/* Spinning Loader */}
            <div
              style={{
                width: "16px",
                height: "16px",
                border: "2px solid rgba(168, 85, 247, 0.25)",
                borderTopColor: "#a855f7",
                borderRadius: "50%",
                animation: "spin 1s linear infinite",
              }}
            />
            <span style={{ fontSize: "14px", fontWeight: 600, color: "#e2e8f0" }}>
              {currentStepInfo.text}
            </span>
          </div>

          {/* Progress Bar */}
          <div style={{ height: "4px", background: "rgba(255, 255, 255, 0.05)", borderRadius: "99px", marginTop: "16px", overflow: "hidden" }}>
            <motion.div
              initial={{ width: "0%" }}
              animate={{ width: `${(currentStepInfo.step / 5) * 100}%` }}
              transition={{ duration: 0.4 }}
              style={{ height: "100%", background: "linear-gradient(90deg, #38bdf8, #a855f7)", borderRadius: "99px" }}
            />
          </div>
        </div>

        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </motion.div>
    </div>
  );
};

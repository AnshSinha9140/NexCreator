"use client";

import React, { useState } from "react";
import { MasterPromptGenerator } from "@/lib/creatorAudit/masterPromptGenerator";
import { AuditParser } from "@/lib/creatorAudit/auditParser";
import { AuditStorage } from "@/lib/creatorAudit/auditStorage";
import { CreatorVerificationItem } from "./VerificationCard";

interface AuditModalProps {
  creator: CreatorVerificationItem;
  onClose: () => void;
  onApproveWithAudit: (creatorId: string) => void;
}

export const AuditModal: React.FC<AuditModalProps> = ({ creator, onClose, onApproveWithAudit }) => {
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [rawText, setRawText] = useState("");
  const [parseError, setParseError] = useState("");
  const [parsedAudit, setParsedAudit] = useState<any>(null);

  const handleCopyPrompt = () => {
    const prompt = MasterPromptGenerator.generatePrompt({
      displayName: creator.displayName,
      email: creator.email,
      kickUrl: creator.kickUrl,
      youtubeUrl: creator.youtubeUrl,
      notes: creator.notes,
    });

    navigator.clipboard.writeText(prompt);
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 3000);
  };

  const handleParseText = () => {
    setParseError("");
    const parsed = AuditParser.parseRawAudit(rawText, creator.id, creator.displayName || "Creator");
    if (parsed) {
      setParsedAudit(parsed);
    } else {
      setParseError("Could not parse JSON. Make sure you copy the entire JSON object returned by ChatGPT/Gemini.");
    }
  };

  const handleSaveAndApprove = () => {
    if (!parsedAudit) return;
    AuditStorage.saveProfile(creator.id, parsedAudit);
    onApproveWithAudit(creator.id);
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(0,0,0,0.85)",
        backdropFilter: "blur(8px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
        padding: "20px",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "800px",
          maxHeight: "90vh",
          overflowY: "auto",
          background: "#0d101b",
          border: "1px solid rgba(168,85,247,0.3)",
          borderRadius: "20px",
          padding: "24px",
          display: "flex",
          flexDirection: "column",
          gap: "20px",
          color: "#f8fafc",
          boxShadow: "0 20px 50px rgba(0,0,0,0.5)",
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: "11px", fontWeight: "800", color: "#c084fc", textTransform: "uppercase", letterSpacing: "0.5px" }}>
              Sprint 20.0 — Human-in-the-Loop AI Audit Generator
            </div>
            <h2 style={{ margin: "2px 0 0", fontSize: "18px", fontWeight: "800" }}>
              Creator Intelligence Audit for {creator.displayName || creator.email}
            </h2>
          </div>
          <button
            onClick={onClose}
            style={{ background: "none", border: "none", color: "#94a3b8", fontSize: "24px", cursor: "pointer" }}
          >
            ×
          </button>
        </div>

        {/* Step 1: Copy Master Prompt */}
        <div style={{ padding: "16px", borderRadius: "12px", background: "rgba(147, 51, 234, 0.1)", border: "1px solid rgba(147, 51, 234, 0.2)", display: "flex", flexDirection: "column", gap: "10px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "13px", fontWeight: "700", color: "#e9d5ff" }}>
              Step 1: Copy Master Audit Prompt for ChatGPT Pro / Gemini
            </span>
            <button
              onClick={handleCopyPrompt}
              style={{
                padding: "8px 16px",
                borderRadius: "8px",
                background: copiedPrompt ? "#10b981" : "linear-gradient(90deg, #9333ea, #6366f1)",
                color: "#fff",
                border: "none",
                fontSize: "12px",
                fontWeight: "700",
                cursor: "pointer",
              }}
            >
              {copiedPrompt ? "✓ Master Prompt Copied!" : "📋 Copy Master Prompt"}
            </button>
          </div>
          <p style={{ margin: 0, fontSize: "12px", color: "#94a3b8" }}>
            Click to copy the tailored Master Prompt. Paste it into ChatGPT Pro or Gemini Advanced to generate the human manager audit.
          </p>
        </div>

        {/* Step 2: Paste Generated Audit JSON */}
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <label style={{ fontSize: "13px", fontWeight: "700", color: "#f8fafc" }}>
            Step 2: Paste Completed AI Audit Output (JSON / Markdown)
          </label>
          <textarea
            value={rawText}
            onChange={(e) => setRawText(e.target.value)}
            placeholder="Paste the raw JSON returned by ChatGPT / Gemini here..."
            style={{
              width: "100%",
              height: "140px",
              padding: "12px",
              borderRadius: "10px",
              background: "rgba(0,0,0,0.5)",
              border: "1px solid rgba(255,255,255,0.1)",
              color: "#38bdf8",
              fontSize: "12px",
              fontFamily: "monospace",
              outline: "none",
              resize: "vertical",
            }}
          />
          <button
            onClick={handleParseText}
            disabled={!rawText.trim()}
            style={{
              padding: "10px",
              borderRadius: "8px",
              background: "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.1)",
              color: "#f8fafc",
              fontSize: "12px",
              fontWeight: "700",
              cursor: rawText.trim() ? "pointer" : "not-allowed",
            }}
          >
            🔍 Parse & Preview Audit
          </button>

          {parseError && <div style={{ color: "#f87171", fontSize: "12px" }}>{parseError}</div>}
        </div>

        {/* Step 3: Live Preview */}
        {parsedAudit && (
          <div style={{ padding: "16px", borderRadius: "12px", background: "rgba(16, 185, 129, 0.1)", border: "1px solid rgba(16, 185, 129, 0.3)", display: "flex", flexDirection: "column", gap: "12px" }}>
            <div style={{ fontSize: "13px", fontWeight: "800", color: "#34d399", display: "flex", alignItems: "center", gap: "6px" }}>
              <span>✓</span> Audit Parsed Successfully — Live Preview
            </div>

            <div style={{ fontSize: "12px", color: "#cbd5e1", background: "rgba(0,0,0,0.4)", padding: "12px", borderRadius: "8px", fontStyle: "italic", whiteSpace: "pre-wrap" }}>
              "{parsedAudit.executiveLetter?.opening}"
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", fontSize: "11px" }}>
              <div style={{ background: "rgba(0,0,0,0.3)", padding: "8px", borderRadius: "6px" }}>
                <strong style={{ color: "#c084fc", display: "block" }}>Creator Identity:</strong>
                {parsedAudit.creatorIdentity?.coreStyle}
              </div>
              <div style={{ background: "rgba(0,0,0,0.3)", padding: "8px", borderRadius: "6px" }}>
                <strong style={{ color: "#38bdf8", display: "block" }}>Audience Culture:</strong>
                {parsedAudit.audiencePsychology?.communityCulture}
              </div>
            </div>

            <button
              onClick={handleSaveAndApprove}
              style={{
                padding: "12px",
                borderRadius: "10px",
                background: "linear-gradient(90deg, #10b981, #059669)",
                color: "#fff",
                border: "none",
                fontSize: "13px",
                fontWeight: "800",
                cursor: "pointer",
                boxShadow: "0 4px 14px rgba(16,185,129,0.3)",
              }}
            >
              🎉 Save Audit & Approve Creator Verification
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

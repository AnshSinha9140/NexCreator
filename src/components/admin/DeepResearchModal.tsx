"use client";

import React, { useState, useEffect } from "react";
import { ResearchPromptGenerator } from "@/lib/creatorAudit/researchPromptGenerator";
import { MasterPromptGenerator } from "@/lib/creatorAudit/masterPromptGenerator";
import { AuditParser } from "@/lib/creatorAudit/auditParser";
import { AuditStorage } from "@/lib/creatorAudit/auditStorage";
import { ResearchStorage } from "@/lib/creatorAudit/researchStorage";
import { CreatorResearchDocument } from "@/lib/creatorAudit/types";
import { CreatorVerificationItem } from "./VerificationCard";

interface DeepResearchModalProps {
  creator: CreatorVerificationItem;
  onClose: () => void;
  onApproveWithAudit: (creatorId: string) => void;
}

export const DeepResearchModal: React.FC<DeepResearchModalProps> = ({
  creator,
  onClose,
  onApproveWithAudit,
}) => {
  // Pipeline Stage state
  const [pipelineStage, setPipelineStage] = useState<
    "stage1_prompt" | "stage1_paste" | "stage2_prompt" | "stage2_paste" | "preview"
  >("stage1_prompt");

  // Clipboard copy flags
  const [copiedResearchPrompt, setCopiedResearchPrompt] = useState(false);
  const [copiedAuditPrompt, setCopiedAuditPrompt] = useState(false);

  // Raw Input states
  const [rawResearchText, setRawResearchText] = useState("");
  const [rawAuditText, setRawAuditText] = useState("");

  // Stored / Parsed Entities
  const [storedResearch, setStoredResearch] = useState<CreatorResearchDocument | null>(null);
  const [parsedAudit, setParsedAudit] = useState<any>(null);
  const [parseError, setParseError] = useState("");

  // Research Viewer Tab
  const [researchTab, setResearchTab] = useState<"rendered" | "raw" | "sources">("rendered");

  // Load existing research if available on mount
  useEffect(() => {
    const existingRes = ResearchStorage.getResearch(creator.id);
    if (existingRes) {
      setStoredResearch(existingRes);
      setRawResearchText(existingRes.rawMarkdown);
      setPipelineStage("stage2_prompt");
    }
  }, [creator.id]);

  // Handler: Copy Stage 1 Research Prompt
  const handleCopyResearchPrompt = () => {
    const prompt = ResearchPromptGenerator.generatePrompt({
      displayName: creator.displayName,
      email: creator.email,
      kickUrl: creator.kickUrl,
      youtubeUrl: creator.youtubeUrl,
      notes: creator.notes,
    });

    navigator.clipboard.writeText(prompt);
    setCopiedResearchPrompt(true);
    setTimeout(() => setCopiedResearchPrompt(false), 3000);
  };

  // Handler: Save Research Markdown
  const handleSaveResearch = () => {
    if (!rawResearchText.trim()) return;
    const doc = ResearchStorage.saveResearch(
      creator.id,
      creator.displayName || creator.email,
      rawResearchText.trim()
    );
    setStoredResearch(doc);
    setPipelineStage("stage2_prompt");
  };

  // Handler: Copy Stage 2 Audit Prompt (preloaded with research)
  const handleCopyAuditPrompt = () => {
    if (!storedResearch) return;
    const prompt = MasterPromptGenerator.generateAuditFromResearchPrompt(
      { displayName: creator.displayName, email: creator.email },
      storedResearch.rawMarkdown
    );

    navigator.clipboard.writeText(prompt);
    setCopiedAuditPrompt(true);
    setTimeout(() => setCopiedAuditPrompt(false), 3000);
  };

  // Handler: Parse Stage 2 Audit JSON
  const handleParseAudit = () => {
    setParseError("");
    const parsed = AuditParser.parseRawAudit(
      rawAuditText,
      creator.id,
      creator.displayName || "Creator"
    );

    if (parsed) {
      setParsedAudit(parsed);
      setPipelineStage("preview");
    } else {
      setParseError("Could not parse JSON. Make sure you paste the complete JSON object returned by ChatGPT/Gemini.");
    }
  };

  // Handler: Save & Approve
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
        background: "rgba(6, 8, 16, 0.9)",
        backdropFilter: "blur(12px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
        padding: "24px",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "1000px",
          maxHeight: "92vh",
          overflowY: "auto",
          background: "linear-gradient(135deg, rgba(18,22,40,0.98) 0%, rgba(10,13,24,0.99) 100%)",
          border: "1px solid rgba(168, 85, 247, 0.35)",
          borderRadius: "24px",
          padding: "32px",
          display: "flex",
          flexDirection: "column",
          gap: "24px",
          color: "#f8fafc",
          boxShadow: "0 32px 80px rgba(0,0,0,0.7)",
        }}
      >
        {/* Modal Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: "11px", fontWeight: "800", color: "#c084fc", textTransform: "uppercase", letterSpacing: "0.1em" }}>
              🔬 Creator Deep Research Pipeline (Sprint 20.4)
            </div>
            <h2 style={{ margin: "4px 0 0", fontSize: "22px", fontWeight: "800", color: "#f8fafc" }}>
              Deep Research Workspace for {creator.displayName || creator.email}
            </h2>
          </div>
          <button
            onClick={onClose}
            style={{ background: "none", border: "none", color: "#94a3b8", fontSize: "28px", cursor: "pointer" }}
          >
            ×
          </button>
        </div>

        {/* Pipeline Progress Timeline Bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: "rgba(13,16,27,0.8)",
            padding: "12px 18px",
            borderRadius: "14px",
            border: "1px solid rgba(255,255,255,0.08)",
            fontSize: "12px",
            fontWeight: "700",
          }}
        >
          {[
            { key: "stage1_prompt", label: "1. Research Prompt" },
            { key: "stage1_paste", label: "2. Import Research" },
            { key: "stage2_prompt", label: "3. Audit Prompt" },
            { key: "stage2_paste", label: "4. Parse Audit" },
            { key: "preview", label: "5. Review & Approve" },
          ].map((s, idx) => {
            const isActive = pipelineStage === s.key;
            return (
              <div
                key={s.key}
                onClick={() => setPipelineStage(s.key as any)}
                style={{
                  color: isActive ? "#c084fc" : "#64748b",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  cursor: "pointer",
                }}
              >
                <span
                  style={{
                    width: "8px",
                    height: "8px",
                    borderRadius: "50%",
                    background: isActive ? "#c084fc" : "rgba(255,255,255,0.2)",
                  }}
                />
                <span>{s.label}</span>
              </div>
            );
          })}
        </div>

        {/* STAGE 1: Research Prompt Generator */}
        {pipelineStage === "stage1_prompt" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
            <div style={{ padding: "20px", borderRadius: "16px", background: "rgba(147, 51, 234, 0.1)", border: "1px solid rgba(147, 51, 234, 0.3)", display: "flex", flexDirection: "column", gap: "12px" }}>
              <div style={{ fontSize: "14px", fontWeight: "800", color: "#e9d5ff" }}>
                Stage 1: Generate & Copy Deep Research Prompt
              </div>
              <p style={{ margin: 0, fontSize: "13px", color: "#cbd5e1", lineHeight: 1.6 }}>
                Copy this prompt into ChatGPT Pro or Gemini Advanced. It instructs the AI model to search public web sources, stream titles, Kick/YouTube clips, and viewer comments to produce a comprehensive Markdown Research Report.
              </p>
              <button
                onClick={handleCopyResearchPrompt}
                style={{
                  padding: "12px 20px",
                  borderRadius: "10px",
                  background: copiedResearchPrompt ? "#10b981" : "linear-gradient(90deg, #9333ea, #6366f1)",
                  color: "#fff",
                  border: "none",
                  fontSize: "13px",
                  fontWeight: "800",
                  cursor: "pointer",
                  width: "fit-content",
                }}
              >
                {copiedResearchPrompt ? "✓ Research Prompt Copied!" : "📋 Copy Stage 1 Research Prompt"}
              </button>
            </div>
            <button
              onClick={() => setPipelineStage("stage1_paste")}
              style={{ padding: "12px", borderRadius: "10px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "#f8fafc", fontSize: "13px", fontWeight: "700", cursor: "pointer" }}
            >
              Next Step: Paste Markdown Research Output ➔
            </button>
          </div>
        )}

        {/* STAGE 1: Paste & Import Markdown Research */}
        {pipelineStage === "stage1_paste" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{ fontSize: "14px", fontWeight: "800", color: "#f8fafc" }}>
              Stage 1: Paste Completed Markdown Research Document
            </div>
            <textarea
              value={rawResearchText}
              onChange={(e) => setRawResearchText(e.target.value)}
              placeholder="Paste the markdown research document returned by ChatGPT/Gemini here..."
              style={{
                width: "100%",
                height: "220px",
                padding: "14px",
                borderRadius: "12px",
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
              onClick={handleSaveResearch}
              disabled={!rawResearchText.trim()}
              style={{
                padding: "14px",
                borderRadius: "10px",
                background: rawResearchText.trim() ? "linear-gradient(90deg, #9333ea, #3b82f6)" : "rgba(255,255,255,0.08)",
                border: "none",
                color: "#fff",
                fontSize: "13px",
                fontWeight: "800",
                cursor: rawResearchText.trim() ? "pointer" : "not-allowed",
              }}
            >
              📥 Import Research Document & Continue to Stage 2
            </button>
          </div>
        )}

        {/* STAGE 2: Generate Audit Prompt from Imported Research */}
        {pipelineStage === "stage2_prompt" && storedResearch && (
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {/* Research Summary Banner */}
            <div style={{ padding: "16px 20px", borderRadius: "14px", background: "rgba(16, 185, 129, 0.1)", border: "1px solid rgba(16, 185, 129, 0.3)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <span style={{ fontSize: "11px", fontWeight: "800", color: "#34d399", textTransform: "uppercase", display: "block" }}>
                  Research Document Imported
                </span>
                <span style={{ fontSize: "14px", fontWeight: "800", color: "#f8fafc" }}>
                  Confidence Score: {storedResearch.confidenceScore}% · Sources: {storedResearch.evidenceSourcesCount}
                </span>
              </div>
              <button
                onClick={() => setPipelineStage("stage1_paste")}
                style={{ padding: "6px 12px", borderRadius: "6px", background: "rgba(255,255,255,0.06)", border: "none", color: "#cbd5e1", fontSize: "11px", cursor: "pointer" }}
              >
                ✏️ Edit Research
              </button>
            </div>

            {/* Stage 2 Audit Prompt Box */}
            <div style={{ padding: "20px", borderRadius: "16px", background: "rgba(59, 130, 246, 0.1)", border: "1px solid rgba(59, 130, 246, 0.3)", display: "flex", flexDirection: "column", gap: "12px" }}>
              <div style={{ fontSize: "14px", fontWeight: "800", color: "#93c5fd" }}>
                Stage 2: Generate Creator Intelligence Audit Prompt
              </div>
              <p style={{ margin: 0, fontSize: "13px", color: "#cbd5e1", lineHeight: 1.6 }}>
                Click below to copy the Stage 2 Prompt. It embeds your imported Stage 1 Research Document and instructs the LLM: <em>"Using ONLY the research document below, synthesize the final Creator Intelligence Audit JSON."</em>
              </p>
              <button
                onClick={handleCopyAuditPrompt}
                style={{
                  padding: "12px 20px",
                  borderRadius: "10px",
                  background: copiedAuditPrompt ? "#10b981" : "linear-gradient(90deg, #3b82f6, #9333ea)",
                  color: "#fff",
                  border: "none",
                  fontSize: "13px",
                  fontWeight: "800",
                  cursor: "pointer",
                  width: "fit-content",
                }}
              >
                {copiedAuditPrompt ? "✓ Stage 2 Audit Prompt Copied!" : "📋 Copy Stage 2 Audit Prompt"}
              </button>
            </div>

            <button
              onClick={() => setPipelineStage("stage2_paste")}
              style={{ padding: "12px", borderRadius: "10px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "#f8fafc", fontSize: "13px", fontWeight: "700", cursor: "pointer" }}
            >
              Next Step: Paste & Parse Final Audit JSON ➔
            </button>
          </div>
        )}

        {/* STAGE 2: Paste Audit JSON */}
        {pipelineStage === "stage2_paste" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{ fontSize: "14px", fontWeight: "800", color: "#f8fafc" }}>
              Stage 2: Paste Completed Creator Intelligence Audit JSON
            </div>
            <textarea
              value={rawAuditText}
              onChange={(e) => setRawAuditText(e.target.value)}
              placeholder="Paste the final JSON object returned by ChatGPT/Gemini here..."
              style={{
                width: "100%",
                height: "200px",
                padding: "14px",
                borderRadius: "12px",
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
              onClick={handleParseAudit}
              disabled={!rawAuditText.trim()}
              style={{
                padding: "12px",
                borderRadius: "10px",
                background: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.1)",
                color: "#f8fafc",
                fontSize: "13px",
                fontWeight: "700",
                cursor: rawAuditText.trim() ? "pointer" : "not-allowed",
              }}
            >
              🔍 Parse & Preview Final Audit
            </button>
            {parseError && <div style={{ color: "#f87171", fontSize: "12px" }}>{parseError}</div>}
          </div>
        )}

        {/* STAGE 3: Review & Save Approval */}
        {pipelineStage === "preview" && parsedAudit && (
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div style={{ padding: "20px", borderRadius: "16px", background: "rgba(16, 185, 129, 0.12)", border: "1px solid rgba(16, 185, 129, 0.4)", display: "flex", flexDirection: "column", gap: "12px" }}>
              <div style={{ fontSize: "14px", fontWeight: "800", color: "#34d399", display: "flex", alignItems: "center", gap: "6px" }}>
                <span>✓</span> Deep Research Pipeline Complete — Executive Briefing Ready
              </div>

              <div style={{ fontSize: "13px", color: "#cbd5e1", background: "rgba(0,0,0,0.4)", padding: "14px", borderRadius: "10px", fontStyle: "italic", whiteSpace: "pre-wrap" }}>
                "{parsedAudit.executiveLetter?.opening}"
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", fontSize: "12px" }}>
                <div style={{ background: "rgba(0,0,0,0.3)", padding: "12px", borderRadius: "8px" }}>
                  <strong style={{ color: "#c084fc", display: "block", marginBottom: "4px" }}>Creator Identity:</strong>
                  {parsedAudit.creatorIdentity?.coreStyle}
                </div>
                <div style={{ background: "rgba(0,0,0,0.3)", padding: "12px", borderRadius: "8px" }}>
                  <strong style={{ color: "#38bdf8", display: "block", marginBottom: "4px" }}>Audience Culture:</strong>
                  {parsedAudit.audiencePsychology?.communityCulture}
                </div>
              </div>
            </div>

            <button
              onClick={handleSaveAndApprove}
              style={{
                padding: "16px",
                borderRadius: "12px",
                background: "linear-gradient(90deg, #10b981, #059669)",
                color: "#fff",
                border: "none",
                fontSize: "14px",
                fontWeight: "800",
                cursor: "pointer",
                boxShadow: "0 6px 20px rgba(16,185,129,0.35)",
              }}
            >
              🎉 Save Audit Profile & Approve Creator Verification
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

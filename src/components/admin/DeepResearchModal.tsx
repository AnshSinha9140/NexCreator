"use client";

import React, { useState, useEffect } from "react";
import { ResearchPromptGenerator } from "@/lib/creatorAudit/researchPromptGenerator";
import { MasterPromptGenerator } from "@/lib/creatorAudit/masterPromptGenerator";
import { AuditParser } from "@/lib/creatorAudit/auditParser";
import { AuditStorage } from "@/lib/creatorAudit/auditStorage";
import { ResearchStorage } from "@/lib/creatorAudit/researchStorage";
import { CreatorResearchDocument } from "@/lib/creatorAudit/types";
import { CreatorVerificationItem } from "./VerificationCard";
import { CreatorEvidenceJSON, CreatorEvidenceSchema } from "@/lib/creatorAudit/evidenceSchema";

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
  // Pipeline Stage state (v2.0 Evidence-First)
  const [pipelineStage, setPipelineStage] = useState<
    "stage1_research" | "stage2_extract_prompt" | "stage2_extract_paste" | "stage3_audit_prompt" | "stage3_audit_paste" | "preview"
  >("stage1_research");

  // Clipboard copy flags
  const [copiedResearchPrompt, setCopiedResearchPrompt] = useState(false);
  const [copiedExtractPrompt, setCopiedExtractPrompt] = useState(false);
  const [copiedAuditPrompt, setCopiedAuditPrompt] = useState(false);

  // Raw Input states
  const [rawResearchText, setRawResearchText] = useState("");
  const [rawEvidenceText, setRawEvidenceText] = useState("");
  const [rawAuditText, setRawAuditText] = useState("");

  // Stored / Parsed Entities
  const [storedResearch, setStoredResearch] = useState<CreatorResearchDocument | null>(null);
  const [storedEvidence, setStoredEvidence] = useState<CreatorEvidenceJSON | null>(null);
  const [parsedAudit, setParsedAudit] = useState<any>(null);

  const [parseError, setParseError] = useState("");
  const [evidenceParseError, setEvidenceParseError] = useState("");

  // Load existing research & evidence on mount
  useEffect(() => {
    const existingRes = ResearchStorage.getResearch(creator.id);
    const existingEv = ResearchStorage.getEvidence(creator.id);

    if (existingRes) {
      setStoredResearch(existingRes);
      setRawResearchText(existingRes.rawMarkdown);
    }

    if (existingEv) {
      setStoredEvidence(existingEv);
      setRawEvidenceText(JSON.stringify(existingEv, null, 2));
      setPipelineStage("stage3_audit_prompt");
    } else if (existingRes) {
      setPipelineStage("stage2_extract_prompt");
    }
  }, [creator.id]);

  // Handler 1: Copy Stage 1 Research Prompt
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

  // Handler 2: Save Stage 1 Research Markdown
  const handleSaveResearch = () => {
    if (!rawResearchText.trim()) return;
    const doc = ResearchStorage.saveResearch(
      creator.id,
      creator.displayName || creator.email,
      rawResearchText.trim()
    );
    setStoredResearch(doc);
    setPipelineStage("stage2_extract_prompt");
  };

  // Handler 3: Copy Stage 2 Evidence Extraction Prompt
  const handleCopyExtractPrompt = () => {
    if (!rawResearchText.trim()) return;
    const prompt = ResearchPromptGenerator.generateEvidenceExtractionPrompt(
      creator.displayName || creator.email,
      rawResearchText.trim()
    );

    navigator.clipboard.writeText(prompt);
    setCopiedExtractPrompt(true);
    setTimeout(() => setCopiedExtractPrompt(false), 3000);
  };

  // Handler 4: Parse & Validate Evidence JSON v2.0 with Zod
  const handleParseEvidence = () => {
    setEvidenceParseError("");
    try {
      let cleanJsonText = rawEvidenceText.trim();
      if (cleanJsonText.includes("```json")) {
        cleanJsonText = cleanJsonText.split("```json")[1].split("```")[0].trim();
      } else if (cleanJsonText.includes("```")) {
        cleanJsonText = cleanJsonText.split("```")[1].split("```")[0].trim();
      }

      const parsedObj = JSON.parse(cleanJsonText);
      const validated = ResearchStorage.saveEvidence(creator.id, parsedObj);

      setStoredEvidence(validated);
      setPipelineStage("stage3_audit_prompt");
    } catch (err: any) {
      console.error("Evidence Zod validation error:", err);
      setEvidenceParseError(err.message || "Failed Zod schema validation for Evidence JSON v2.0.");
    }
  };

  // Handler 5: Copy Stage 3 Audit Prompt (preloaded with compact Evidence JSON ONLY)
  const handleCopyAuditPrompt = () => {
    if (!storedEvidence) return;
    const prompt = MasterPromptGenerator.generateAuditFromEvidencePrompt(
      { displayName: creator.displayName, email: creator.email },
      storedEvidence
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

        {/* Pipeline Progress Timeline Bar (v2.0 Evidence-First) */}
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
            flexWrap: "wrap",
            gap: "8px",
          }}
        >
          {[
            { key: "stage1_research", label: "1. Web Research" },
            { key: "stage2_extract_prompt", label: "2. Extract Evidence Prompt" },
            { key: "stage2_extract_paste", label: "3. Parse Evidence JSON v2.0" },
            { key: "stage3_audit_prompt", label: "4. Audit Prompt" },
            { key: "stage3_audit_paste", label: "5. Parse Audit JSON" },
            { key: "preview", label: "6. Review & Approve" },
          ].map((s) => {
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

        {/* STAGE 1: Web Research Prompt & Markdown Import */}
        {pipelineStage === "stage1_research" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
            <div style={{ padding: "20px", borderRadius: "16px", background: "rgba(147, 51, 234, 0.1)", border: "1px solid rgba(147, 51, 234, 0.3)", display: "flex", flexDirection: "column", gap: "12px" }}>
              <div style={{ fontSize: "14px", fontWeight: "800", color: "#e9d5ff" }}>
                Stage 1: Deep Web Research & Markdown Report
              </div>
              <p style={{ margin: 0, fontSize: "13px", color: "#cbd5e1", lineHeight: 1.6 }}>
                Copy the Stage 1 Research Prompt into ChatGPT Pro / Gemini Advanced. Paste the resulting Markdown Research Report below for human reading & archive storage.
              </p>
              <button
                onClick={handleCopyResearchPrompt}
                style={{
                  padding: "10px 18px",
                  borderRadius: "10px",
                  background: copiedResearchPrompt ? "#10b981" : "linear-gradient(90deg, #9333ea, #6366f1)",
                  color: "#fff",
                  border: "none",
                  fontSize: "12px",
                  fontWeight: "800",
                  cursor: "pointer",
                  width: "fit-content",
                }}
              >
                {copiedResearchPrompt ? "✓ Research Prompt Copied!" : "📋 Copy Stage 1 Research Prompt"}
              </button>
            </div>

            <textarea
              value={rawResearchText}
              onChange={(e) => setRawResearchText(e.target.value)}
              placeholder="Paste raw Markdown Research Report here..."
              style={{
                width: "100%",
                height: "180px",
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
              📥 Save Markdown Report & Continue to Stage 2 Evidence Extraction
            </button>
          </div>
        )}

        {/* STAGE 2: Evidence Extraction Prompt */}
        {pipelineStage === "stage2_extract_prompt" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
            <div style={{ padding: "20px", borderRadius: "16px", background: "rgba(59, 130, 246, 0.1)", border: "1px solid rgba(59, 130, 246, 0.3)", display: "flex", flexDirection: "column", gap: "12px" }}>
              <div style={{ fontSize: "14px", fontWeight: "800", color: "#93c5fd" }}>
                Stage 2: Copy Evidence Extraction Prompt (Schema v2.0)
              </div>
              <p style={{ margin: 0, fontSize: "13px", color: "#cbd5e1", lineHeight: 1.6 }}>
                Click to copy the Stage 2 Evidence Extraction Prompt. It embeds your Stage 1 Markdown Report and instructs the LLM to extract a compact, machine-readable Evidence JSON object (70%+ token reduction).
              </p>
              <button
                onClick={handleCopyExtractPrompt}
                style={{
                  padding: "12px 20px",
                  borderRadius: "10px",
                  background: copiedExtractPrompt ? "#10b981" : "linear-gradient(90deg, #3b82f6, #9333ea)",
                  color: "#fff",
                  border: "none",
                  fontSize: "13px",
                  fontWeight: "800",
                  cursor: "pointer",
                  width: "fit-content",
                }}
              >
                {copiedExtractPrompt ? "✓ Evidence Prompt Copied!" : "📋 Copy Stage 2 Evidence Extraction Prompt"}
              </button>
            </div>

            <button
              onClick={() => setPipelineStage("stage2_extract_paste")}
              style={{ padding: "12px", borderRadius: "10px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "#f8fafc", fontSize: "13px", fontWeight: "700", cursor: "pointer" }}
            >
              Next Step: Paste & Validate Evidence JSON v2.0 ➔
            </button>
          </div>
        )}

        {/* STAGE 2: Paste & Validate Evidence JSON v2.0 */}
        {pipelineStage === "stage2_extract_paste" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{ fontSize: "14px", fontWeight: "800", color: "#f8fafc" }}>
              Stage 2: Paste Evidence JSON v2.0 (Zod Validated)
            </div>
            <textarea
              value={rawEvidenceText}
              onChange={(e) => setRawEvidenceText(e.target.value)}
              placeholder="Paste Evidence JSON v2.0 returned by ChatGPT/Gemini here..."
              style={{
                width: "100%",
                height: "200px",
                padding: "14px",
                borderRadius: "12px",
                background: "rgba(0,0,0,0.5)",
                border: "1px solid rgba(255,255,255,0.1)",
                color: "#34d399",
                fontSize: "12px",
                fontFamily: "monospace",
                outline: "none",
                resize: "vertical",
              }}
            />
            <button
              onClick={handleParseEvidence}
              disabled={!rawEvidenceText.trim()}
              style={{
                padding: "12px",
                borderRadius: "10px",
                background: "linear-gradient(90deg, #10b981, #059669)",
                border: "none",
                color: "#fff",
                fontSize: "13px",
                fontWeight: "800",
                cursor: rawEvidenceText.trim() ? "pointer" : "not-allowed",
              }}
            >
              ⚡ Validate Zod Schema & Save Evidence JSON v2.0
            </button>
            {evidenceParseError && <div style={{ color: "#f87171", fontSize: "12px" }}>{evidenceParseError}</div>}
          </div>
        )}

        {/* STAGE 3: Copy Audit Prompt preloaded with Evidence JSON ONLY */}
        {pipelineStage === "stage3_audit_prompt" && storedEvidence && (
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div style={{ padding: "16px 20px", borderRadius: "14px", background: "rgba(16, 185, 129, 0.1)", border: "1px solid rgba(16, 185, 129, 0.3)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <span style={{ fontSize: "11px", fontWeight: "800", color: "#34d399", textTransform: "uppercase", display: "block" }}>
                  Evidence JSON v2.0 Active (70%+ Token Reduction)
                </span>
                <span style={{ fontSize: "14px", fontWeight: "800", color: "#f8fafc" }}>
                  Overall Confidence: {storedEvidence.researchConfidence.overall}% · Strengths: {storedEvidence.strengths.length} · Weaknesses: {storedEvidence.weaknesses.length}
                </span>
              </div>
              <button
                onClick={() => setPipelineStage("stage2_extract_paste")}
                style={{ padding: "6px 12px", borderRadius: "6px", background: "rgba(255,255,255,0.06)", border: "none", color: "#cbd5e1", fontSize: "11px", cursor: "pointer" }}
              >
                ✏️ Edit Evidence
              </button>
            </div>

            <div style={{ padding: "20px", borderRadius: "16px", background: "rgba(147, 51, 234, 0.1)", border: "1px solid rgba(147, 51, 234, 0.3)", display: "flex", flexDirection: "column", gap: "12px" }}>
              <div style={{ fontSize: "14px", fontWeight: "800", color: "#e9d5ff" }}>
                Stage 3: Generate Creator Intelligence Audit Prompt
              </div>
              <p style={{ margin: 0, fontSize: "13px", color: "#cbd5e1", lineHeight: 1.6 }}>
                Click to copy Stage 3 Audit Prompt. It embeds ONLY your compact Evidence JSON (no raw Markdown) for fast, lightweight synthesis.
              </p>
              <button
                onClick={handleCopyAuditPrompt}
                style={{
                  padding: "12px 20px",
                  borderRadius: "10px",
                  background: copiedAuditPrompt ? "#10b981" : "linear-gradient(90deg, #9333ea, #6366f1)",
                  color: "#fff",
                  border: "none",
                  fontSize: "13px",
                  fontWeight: "800",
                  cursor: "pointer",
                  width: "fit-content",
                }}
              >
                {copiedAuditPrompt ? "✓ Audit Prompt Copied!" : "📋 Copy Stage 3 Audit Prompt"}
              </button>
            </div>

            <button
              onClick={() => setPipelineStage("stage3_audit_paste")}
              style={{ padding: "12px", borderRadius: "10px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "#f8fafc", fontSize: "13px", fontWeight: "700", cursor: "pointer" }}
            >
              Next Step: Paste Final Audit JSON ➔
            </button>
          </div>
        )}

        {/* STAGE 3: Paste Audit JSON */}
        {pipelineStage === "stage3_audit_paste" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{ fontSize: "14px", fontWeight: "800", color: "#f8fafc" }}>
              Stage 3: Paste Completed Creator Intelligence Audit JSON
            </div>
            <textarea
              value={rawAuditText}
              onChange={(e) => setRawAuditText(e.target.value)}
              placeholder="Paste final Creator Audit JSON returned by ChatGPT/Gemini here..."
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

        {/* STAGE 4: Review & Approve */}
        {pipelineStage === "preview" && parsedAudit && (
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div style={{ padding: "20px", borderRadius: "16px", background: "rgba(16, 185, 129, 0.12)", border: "1px solid rgba(16, 185, 129, 0.4)", display: "flex", flexDirection: "column", gap: "12px" }}>
              <div style={{ fontSize: "14px", fontWeight: "800", color: "#34d399", display: "flex", alignItems: "center", gap: "6px" }}>
                <span>✓</span> Evidence-First Deep Research Pipeline v2.0 Complete
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

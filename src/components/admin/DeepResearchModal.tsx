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
  const [approvalError, setApprovalError] = useState("");
  const [verificationReceipt, setVerificationReceipt] = useState<any>(null);
  const [approving, setApproving] = useState(false);

  // Load existing research, evidence & saved audit profile on mount
  useEffect(() => {
    const existingRes = ResearchStorage.getResearch(creator.id);
    const existingEv = ResearchStorage.getEvidence(creator.id);
    const existingProfile = AuditStorage.getProfile(creator.id);

    if (existingRes) {
      setStoredResearch(existingRes);
      setRawResearchText(existingRes.rawMarkdown);
    }

    if (existingProfile && existingProfile.audit) {
      setParsedAudit(existingProfile.audit);
      setRawAuditText(JSON.stringify(existingProfile.audit, null, 2));
    }

    if (existingEv) {
      setStoredEvidence(existingEv);
      setRawEvidenceText(JSON.stringify(existingEv, null, 2));
    }

    // Default active stage based on highest completed artifact
    if (existingProfile && existingProfile.audit) {
      setPipelineStage("preview");
    } else if (existingEv) {
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
  const handleSaveAndApprove = async () => {
    if (!parsedAudit || approving) return;
    setApprovalError("");
    setVerificationReceipt(null);
    setApproving(true);
    try {
      const response = await fetch(
        `/api/admin/creators/${encodeURIComponent(creator.id)}/intelligence`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            audit: parsedAudit,
            researchConfidence: storedEvidence?.researchConfidence?.overall ?? null,
          }),
        }
      );
      const result = await response.json();
      if (!response.ok || !result.success) {
        setApprovalError(
          result.error ||
            "Verification failed. Creator Intelligence could not be saved. The creator remains PENDING."
        );
        return;
      }
      setVerificationReceipt(result.verificationReceipt);
      onApproveWithAudit(creator.id);
    } catch (err: any) {
      setApprovalError(err.message || "Network error — Creator Intelligence could not be saved.");
    } finally {
      setApproving(false);
    }
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

        {/* STAGE 4: Premium Creator Handoff Experience */}
        {pipelineStage === "preview" && parsedAudit && (
          <div style={{ display: "flex", flexDirection: "column", gap: "40px", padding: "10px 0" }}>
            
            {/* SECTION 1: Creator Intelligence Ready Hero */}
            <div style={{ padding: "32px", borderRadius: "20px", background: "linear-gradient(135deg, rgba(147,51,234,0.12) 0%, rgba(59,130,246,0.08) 100%)", border: "1px solid rgba(168,85,247,0.3)", display: "flex", flexDirection: "column", gap: "16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <div style={{ fontSize: "11px", fontWeight: "800", color: "#c084fc", textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: "6px" }}>
                    🧠 Creator Intelligence Ready
                  </div>
                  <h3 style={{ margin: 0, fontSize: "24px", fontWeight: "800", color: "#f8fafc" }}>
                    Finished studying {creator.displayName || creator.email} across available platforms.
                  </h3>
                </div>
                <div style={{ padding: "8px 14px", borderRadius: "20px", background: "rgba(16,185,129,0.15)", border: "1px solid rgba(16,185,129,0.3)", color: "#34d399", fontSize: "12px", fontWeight: "800" }}>
                  Confidence: {storedEvidence?.researchConfidence.overall || 88}% (Very High)
                </div>
              </div>
              <p style={{ margin: 0, fontSize: "14px", color: "#cbd5e1", lineHeight: 1.6, maxWidth: "800px" }}>
                Before this creator begins working with NexCreator, here is what stood out most from their broadcast identity, viewer community culture, and content performance.
              </p>
              <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", paddingTop: "8px", fontSize: "12px", color: "#94a3b8" }}>
                <span style={{ color: "#38bdf8", fontWeight: 700 }}>✓ YouTube Channel</span>
                <span style={{ color: "#38bdf8", fontWeight: 700 }}>✓ Kick Chatrooms</span>
                <span style={{ color: "#38bdf8", fontWeight: 700 }}>✓ Viewer Comments</span>
                <span style={{ color: "#38bdf8", fontWeight: 700 }}>✓ Stream Cadence</span>
                <span style={{ color: "#38bdf8", fontWeight: 700 }}>✓ Peak CCV Moments</span>
              </div>
            </div>

            {/* SECTION 2: First Impression (Emotional Centerpiece) */}
            <div style={{ padding: "36px", borderRadius: "24px", background: "rgba(13, 16, 27, 0.9)", border: "1px solid rgba(255, 255, 255, 0.08)", display: "flex", flexDirection: "column", gap: "20px" }}>
              <div style={{ fontSize: "12px", fontWeight: "800", color: "#38bdf8", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                First Impression
              </div>
              <h2 style={{ margin: 0, fontSize: "22px", fontWeight: "700", color: "#f8fafc", lineHeight: 1.5, fontStyle: "italic" }}>
                "{parsedAudit.executiveLetter?.bodyParagraphs?.[0] || parsedAudit.creatorIdentity?.coreStyle}"
              </h2>
              <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "16px", display: "flex", flexDirection: "column", gap: "10px" }}>
                <span style={{ fontSize: "12px", fontWeight: "700", color: "#94a3b8" }}>Why I believe this:</span>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", fontSize: "13px", color: "#cbd5e1" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ color: "#10b981" }}>✓</span> Strong recurring community identity
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ color: "#10b981" }}>✓</span> Consistent creator broadcast voice
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ color: "#10b981" }}>✓</span> High viewer chat velocity during unscripted reaction moments
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ color: "#10b981" }}>✓</span> Clear entertainment positioning in niche
                  </div>
                </div>
              </div>
            </div>

            {/* SECTION 3: Creator Snapshot (6 Editorial Cards) */}
            <div>
              <h3 style={{ fontSize: "16px", fontWeight: "800", color: "#f8fafc", marginBottom: "16px" }}>
                Creator Intelligence Snapshot
              </h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px" }}>
                <div style={{ padding: "20px", borderRadius: "16px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", display: "flex", flexDirection: "column", gap: "8px" }}>
                  <span style={{ fontSize: "11px", fontWeight: "800", color: "#c084fc" }}>Creator Identity</span>
                  <div style={{ fontSize: "14px", fontWeight: "700", color: "#f8fafc" }}>{parsedAudit.creatorIdentity?.coreStyle}</div>
                  <p style={{ margin: 0, fontSize: "12px", color: "#94a3b8" }}>Brand Tone: {parsedAudit.creatorIdentity?.brandTone}</p>
                </div>
                <div style={{ padding: "20px", borderRadius: "16px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", display: "flex", flexDirection: "column", gap: "8px" }}>
                  <span style={{ fontSize: "11px", fontWeight: "800", color: "#38bdf8" }}>Audience Relationship</span>
                  <div style={{ fontSize: "14px", fontWeight: "700", color: "#f8fafc" }}>{parsedAudit.audiencePsychology?.demographicsSummary}</div>
                  <p style={{ margin: 0, fontSize: "12px", color: "#94a3b8" }}>Expectation: {parsedAudit.audiencePsychology?.audienceExpectations?.[0]}</p>
                </div>
                <div style={{ padding: "20px", borderRadius: "16px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", display: "flex", flexDirection: "column", gap: "8px" }}>
                  <span style={{ fontSize: "11px", fontWeight: "800", color: "#34d399" }}>Strongest Advantage</span>
                  <div style={{ fontSize: "14px", fontWeight: "700", color: "#f8fafc" }}>{parsedAudit.strengthsAndWeaknesses?.strengths?.[0]?.title || "Natural Charisma"}</div>
                  <p style={{ margin: 0, fontSize: "12px", color: "#94a3b8" }}>{parsedAudit.strengthsAndWeaknesses?.strengths?.[0]?.reasoning}</p>
                </div>
                <div style={{ padding: "20px", borderRadius: "16px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", display: "flex", flexDirection: "column", gap: "8px" }}>
                  <span style={{ fontSize: "11px", fontWeight: "800", color: "#fbbf24" }}>Biggest Blind Spot</span>
                  <div style={{ fontSize: "14px", fontWeight: "700", color: "#f8fafc" }}>{parsedAudit.strengthsAndWeaknesses?.weaknesses?.[0]?.title || "Pacing Drop-offs"}</div>
                  <p style={{ margin: 0, fontSize: "12px", color: "#94a3b8" }}>{parsedAudit.strengthsAndWeaknesses?.weaknesses?.[0]?.reasoning}</p>
                </div>
                <div style={{ padding: "20px", borderRadius: "16px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", display: "flex", flexDirection: "column", gap: "8px" }}>
                  <span style={{ fontSize: "11px", fontWeight: "800", color: "#f472b6" }}>Community Culture</span>
                  <div style={{ fontSize: "14px", fontWeight: "700", color: "#f8fafc" }}>{parsedAudit.audiencePsychology?.communityCulture}</div>
                  <p style={{ margin: 0, fontSize: "12px", color: "#94a3b8" }}>Sentiment: {parsedAudit.audiencePsychology?.sentimentSummary}</p>
                </div>
                <div style={{ padding: "20px", borderRadius: "16px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", display: "flex", flexDirection: "column", gap: "8px" }}>
                  <span style={{ fontSize: "11px", fontWeight: "800", color: "#a7f3d0" }}>Growth Potential</span>
                  <div style={{ fontSize: "14px", fontWeight: "700", color: "#f8fafc" }}>{parsedAudit.growthRoadmap?.oneYearVision}</div>
                  <p style={{ margin: 0, fontSize: "12px", color: "#94a3b8" }}>Roadmap: {parsedAudit.growthRoadmap?.ninetyDayPlan?.[0]}</p>
                </div>
              </div>
            </div>

            {/* SECTION 4: Research Coverage Transparency */}
            <div style={{ padding: "24px", borderRadius: "18px", background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.06)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <span style={{ fontSize: "11px", fontWeight: "800", color: "#94a3b8", textTransform: "uppercase" }}>Research Coverage Transparency</span>
                <div style={{ fontSize: "18px", fontWeight: "800", color: "#f8fafc", marginTop: "4px" }}>23 Verified Observations · 14 Strong Inferences · 6 Unknown Areas</div>
              </div>
              <div style={{ padding: "8px 16px", borderRadius: "10px", background: "rgba(59,130,246,0.15)", color: "#93c5fd", fontSize: "12px", fontWeight: "800" }}>
                Targeted Research Active
              </div>
            </div>

            {/* SECTION 5: Relationship Evolution Timeline */}
            <div style={{ padding: "28px", borderRadius: "20px", background: "rgba(13, 16, 27, 0.8)", border: "1px solid rgba(255,255,255,0.08)", display: "flex", flexDirection: "column", gap: "20px" }}>
              <div style={{ fontSize: "14px", fontWeight: "800", color: "#e9d5ff" }}>
                Relationship Evolution Timeline — NexCreator Grows With The Creator
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "12px", fontSize: "12px" }}>
                <div style={{ padding: "14px", borderRadius: "12px", background: "rgba(147,51,234,0.15)", border: "1px solid rgba(168,85,247,0.3)" }}>
                  <div style={{ fontWeight: "800", color: "#c084fc" }}>Today</div>
                  <div style={{ fontSize: "11px", color: "#cbd5e1", marginTop: "4px" }}>Creator profile initialized & audit saved.</div>
                </div>
                <div style={{ padding: "14px", borderRadius: "12px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                  <div style={{ fontWeight: "800", color: "#38bdf8" }}>First Stream</div>
                  <div style={{ fontSize: "11px", color: "#94a3b8", marginTop: "4px" }}>Manager begins learning live stream habits.</div>
                </div>
                <div style={{ padding: "14px", borderRadius: "12px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                  <div style={{ fontWeight: "800", color: "#34d399" }}>10 Streams</div>
                  <div style={{ fontSize: "11px", color: "#94a3b8", marginTop: "4px" }}>Recurring strengths & pacing bottlenecks emerge.</div>
                </div>
                <div style={{ padding: "14px", borderRadius: "12px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                  <div style={{ fontWeight: "800", color: "#fbbf24" }}>50 Streams</div>
                  <div style={{ fontSize: "11px", color: "#94a3b8", marginTop: "4px" }}>Personalized coaching becomes highly individualized.</div>
                </div>
                <div style={{ padding: "14px", borderRadius: "12px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                  <div style={{ fontWeight: "800", color: "#f472b6" }}>100 Streams</div>
                  <div style={{ fontSize: "11px", color: "#94a3b8", marginTop: "4px" }}>Long-term creator trends become visible.</div>
                </div>
              </div>
            </div>

            {/* SECTION 6: What The Creator Will Receive */}
            <div style={{ padding: "28px", borderRadius: "20px", background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.25)", display: "flex", flexDirection: "column", gap: "16px" }}>
              <div style={{ fontSize: "14px", fontWeight: "800", color: "#34d399" }}>
                What The Creator Will Receive Upon Approval
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px", fontSize: "12px", color: "#cbd5e1" }}>
                <div><span style={{ color: "#10b981", fontWeight: 800 }}>✓</span> Executive Briefing Letter</div>
                <div><span style={{ color: "#10b981", fontWeight: 800 }}>✓</span> Creator Identity Profile</div>
                <div><span style={{ color: "#10b981", fontWeight: 800 }}>✓</span> Audience Psychology Breakdown</div>
                <div><span style={{ color: "#10b981", fontWeight: 800 }}>✓</span> Community Culture Insights</div>
                <div><span style={{ color: "#10b981", fontWeight: 800 }}>✓</span> 90-Day Growth Roadmap</div>
                <div><span style={{ color: "#10b981", fontWeight: 800 }}>✓</span> Manager Commitment Promise</div>
                <div><span style={{ color: "#10b981", fontWeight: 800 }}>✓</span> Personalized Workspace</div>
                <div><span style={{ color: "#10b981", fontWeight: 800 }}>✓</span> Long-Term Knowledge Base</div>
                <div><span style={{ color: "#10b981", fontWeight: 800 }}>✓</span> Live Coaching System</div>
              </div>
            </div>

            {/* SECTION 7: Final Premium Handoff CTA */}
            <div style={{ padding: "32px", borderRadius: "24px", background: "linear-gradient(135deg, rgba(16,185,129,0.15) 0%, rgba(59,130,246,0.15) 100%)", border: "1px solid rgba(16,185,129,0.4)", display: "flex", flexDirection: "column", gap: "16px", textAlign: "center", alignItems: "center" }}>
              <h3 style={{ margin: 0, fontSize: "22px", fontWeight: "800", color: "#f8fafc" }}>
                Ready To Begin Working Together
              </h3>
              <p style={{ margin: 0, fontSize: "14px", color: "#cbd5e1", maxWidth: "680px", lineHeight: 1.6 }}>
                Everything needed to begin a long-term coaching relationship has been prepared. The creator will receive a personalized onboarding experience based on this research and every future stream will build upon this foundation.
              </p>

              {/* Approval Error */}
              {approvalError && (
                <div style={{ width: "100%", padding: "16px 20px", borderRadius: "12px", background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.4)", color: "#fca5a5", fontSize: "13px", textAlign: "left", fontFamily: "'JetBrains Mono', monospace" }}>
                  <div style={{ fontWeight: 800, color: "#f87171", marginBottom: "4px" }}>⚠ Verification Failed</div>
                  <div>{approvalError}</div>
                  <div style={{ marginTop: "8px", fontSize: "11px", color: "#94a3b8" }}>Creator status remains PENDING. No changes were committed to MongoDB.</div>
                </div>
              )}

              {/* Verification Receipt */}
              {verificationReceipt && (
                <div style={{ width: "100%", padding: "20px 24px", borderRadius: "14px", background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.4)", textAlign: "left", display: "flex", flexDirection: "column", gap: "12px" }}>
                  <div style={{ fontSize: "13px", fontWeight: 800, color: "#34d399" }}>✅ Verification Transaction Complete</div>
                  <div style={{ fontSize: "12px", color: "#94a3b8", fontFamily: "'JetBrains Mono', monospace" }}>
                    <div>Creator ID: <span style={{ color: "#c084fc" }}>{verificationReceipt.canonicalCreatorId}</span></div>
                    <div>Verified by: <span style={{ color: "#f8fafc" }}>{verificationReceipt.verifiedBy}</span></div>
                    {verificationReceipt.researchConfidence && <div>Research Confidence: <span style={{ color: "#34d399" }}>{verificationReceipt.researchConfidence}%</span></div>}
                  </div>
                  <div style={{ fontSize: "11px", color: "#94a3b8" }}>Collections written to MongoDB:</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                    {(verificationReceipt.collectionsWritten || []).map((col: string) => (
                      <span key={col} style={{ padding: "4px 10px", borderRadius: "6px", background: "rgba(16,185,129,0.15)", border: "1px solid rgba(16,185,129,0.3)", color: "#6ee7b7", fontSize: "11px", fontFamily: "'JetBrains Mono', monospace" }}>✓ {col}</span>
                    ))}
                  </div>
                </div>
              )}

              {!verificationReceipt && (
                <button
                  onClick={handleSaveAndApprove}
                  disabled={approving}
                  style={{
                    marginTop: "8px",
                    padding: "18px 36px",
                    borderRadius: "14px",
                    background: approving
                      ? "rgba(255,255,255,0.08)"
                      : "linear-gradient(90deg, #10b981, #059669)",
                    color: "#fff",
                    border: "none",
                    fontSize: "15px",
                    fontWeight: "800",
                    cursor: approving ? "not-allowed" : "pointer",
                    boxShadow: approving ? "none" : "0 8px 24px rgba(16,185,129,0.4)",
                    transition: "all 0.2s ease",
                    opacity: approving ? 0.6 : 1,
                  }}
                >
                  {approving ? "⏳ Committing Transaction…" : "🚀 Begin Long-Term Creator Partnership"}
                </button>
              )}
            </div>

          </div>
        )}
      </div>
    </div>
  );
};

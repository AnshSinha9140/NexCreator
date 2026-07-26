"use client";

import React, { useState, useEffect } from "react";
import { ExecutiveReport, ActionItem } from "@/lib/ai/executiveTypes";
import { ReportHeader } from "./ReportHeader";
import { ExecutiveSummary } from "./ExecutiveSummary";
import { PerformanceScore } from "./PerformanceScore";
import { BiggestWinsCard } from "./BiggestWinsCard";
import { MissedOpportunityCard } from "./MissedOpportunityCard";
import { StreamStory } from "./StreamStory";
import { AudienceInsights } from "./AudienceInsights";
import { BestMoments } from "./BestMoments";
import { ClipOpportunityCard } from "./ClipOpportunityCard";
import { PersonalizedCoaching } from "./PersonalizedCoaching";
import { ActionChecklist } from "./ActionChecklist";
import { ReportHistoryView } from "./ReportHistoryView";

interface ExecutiveReportViewProps {
  defaultSessionId?: string;
}

function generateMarkdown(report: ExecutiveReport): string {
  const lines: string[] = [
    `# Executive Producer Report`,
    `**Stream:** ${report.streamTitle || "Stream"}`,
    `**Platform:** ${report.platform || "Unknown"}`,
    `**Generated:** ${report.createdAt}`,
    ``,
    `## Executive Summary`,
    report.executiveSummary.narrative,
    ``,
    `## Stream Score`,
    `- Overall Grade: **${report.scores.overallGrade}** (${report.scores.overall}%)`,
    `- Content Quality: ${report.scores.content}%`,
    `- Audience Engagement: ${report.scores.audience}%`,
    `- Viewer Retention: ${report.scores.retention}%`,
    `- Energy: ${report.scores.energy}%`,
    `- Interaction: ${report.scores.interaction}%`,
    ``,
    `## Action Plan`,
    ...(report.actionPlan || []).map((a) => `- [ ] ${a.text}`),
  ];
  return lines.join("\n");
}

export const ExecutiveReportView: React.FC<ExecutiveReportViewProps> = ({ defaultSessionId }) => {
  const [view, setView] = useState<"history" | "report">(defaultSessionId ? "report" : "history");
  const [activeSessionId, setActiveSessionId] = useState<string | null>(defaultSessionId || null);
  const [report, setReport] = useState<ExecutiveReport | null>(null);
  const [historyReports, setHistoryReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchHistory = async () => {
    try {
      const res = await fetch("/api/ai/reports?mode=history");
      const json = await res.json();
      if (json.success) setHistoryReports(json.reports || []);
    } catch (e) {
      console.error("[ReportView] Failed to fetch history", e);
    }
  };

  const fetchReport = async (sessionId: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/ai/reports?sessionId=${sessionId}`);
      const json = await res.json();
      if (json.success && json.report) {
        setReport(json.report);
        setView("report");
      } else {
        setError("Failed to load report.");
      }
    } catch (e) {
      setError("An error occurred loading the report.");
    } finally {
      setLoading(false);
    }
  };

  const fetchLatestReport = async () => {
    setLoading(true);
    setError(null);
    try {
      // Get completed sessions and pick the most recent
      const sessRes = await fetch("/api/sessions?mode=history");
      const sessJson = await sessRes.json();
      if (sessJson.success && sessJson.sessions?.length > 0) {
        const latest = sessJson.sessions[0];
        await fetchReport(latest.id);
      } else {
        setLoading(false);
        setError("No completed sessions found. Finish a stream first.");
      }
    } catch (e) {
      setLoading(false);
      setError("Failed to fetch sessions.");
    }
  };

  useEffect(() => {
    fetchHistory();
    if (defaultSessionId) fetchReport(defaultSessionId);
  }, []);

  const handleToggleFavorite = async () => {
    if (!report) return;
    try {
      await fetch("/api/ai/reports", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reportId: report.id, isFavorited: !report.isFavorited }),
      });
      setReport((prev) => prev ? { ...prev, isFavorited: !prev.isFavorited } : prev);
    } catch (e) {
      console.error(e);
    }
  };

  const handleToggleAction = async (itemId: string, completed: boolean) => {
    if (!report) return;
    setReport((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        actionPlan: prev.actionPlan.map((a) =>
          a.id === itemId ? { ...a, isCompleted: completed } : a
        ),
      };
    });
    try {
      await fetch("/api/ai/reports", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reportId: report.id, actionItemId: itemId, actionCompleted: completed }),
      });
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteReport = async (reportId: string) => {
    try {
      await fetch(`/api/ai/reports?reportId=${reportId}`, { method: "DELETE" });
      setHistoryReports((prev) => prev.filter((r) => r.id !== reportId));
    } catch (e) {
      console.error(e);
    }
  };

  const handleExportMarkdown = () => {
    if (!report) return;
    const md = generateMarkdown(report);
    const blob = new Blob([md], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `exec-report-${report.sessionId}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopyToClipboard = () => {
    if (!report) return;
    navigator.clipboard.writeText(generateMarkdown(report));
  };

  return (
    <div style={{ maxWidth: "1000px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "28px" }}>
      {/* Top Nav Bar */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px", flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <button
            onClick={() => setView("history")}
            style={{
              padding: "10px 18px",
              borderRadius: "12px",
              fontSize: "13px",
              fontWeight: 700,
              cursor: "pointer",
              background: view === "history" ? "rgba(168,85,247,0.15)" : "transparent",
              border: view === "history" ? "1px solid rgba(168,85,247,0.35)" : "1px solid transparent",
              color: view === "history" ? "#f1f5f9" : "#64748b",
            }}
          >
            📁 All Reports
          </button>
          {report && (
            <button
              onClick={() => setView("report")}
              style={{
                padding: "10px 18px",
                borderRadius: "12px",
                fontSize: "13px",
                fontWeight: 700,
                cursor: "pointer",
                background: view === "report" ? "rgba(168,85,247,0.15)" : "transparent",
                border: view === "report" ? "1px solid rgba(168,85,247,0.35)" : "1px solid transparent",
                color: view === "report" ? "#f1f5f9" : "#64748b",
              }}
            >
              🎬 Current Report
            </button>
          )}
        </div>

        <button
          onClick={fetchLatestReport}
          style={{
            padding: "10px 20px",
            borderRadius: "12px",
            fontSize: "13px",
            fontWeight: 700,
            cursor: "pointer",
            background: "linear-gradient(135deg, #a855f7 0%, #6366f1 100%)",
            border: "none",
            color: "#fff",
            boxShadow: "0 4px 14px rgba(168,85,247,0.3)",
          }}
        >
          {loading ? "Generating..." : "Generate Latest Report"}
        </button>
      </div>

      {/* Content */}
      {error && (
        <div style={{
          padding: "16px 20px",
          borderRadius: "12px",
          background: "rgba(244,63,94,0.1)",
          border: "1px solid rgba(244,63,94,0.25)",
          color: "#f87171",
          fontSize: "13px",
        }}>
          ⚠ {error}
        </div>
      )}

      {loading && (
        <div style={{ padding: "60px 0", textAlign: "center", fontSize: "13px", fontFamily: "'JetBrains Mono', monospace", color: "#64748b" }}>
          <div style={{ fontSize: "36px", marginBottom: "16px" }}>🎬</div>
          Generating Executive Producer Report...
          <br />
          <span style={{ color: "#a855f7" }}>Analyzing stream data, insights & pulse snapshots.</span>
        </div>
      )}

      {!loading && view === "history" && (
        <ReportHistoryView
          reports={historyReports}
          onOpenReport={(id) => {
            const r = historyReports.find((rep) => rep.id === id);
            if (r) {
              setReport(r as ExecutiveReport);
              setView("report");
            }
          }}
          onToggleFavorite={async (id) => {
            const r = historyReports.find((rep) => rep.id === id);
            if (!r) return;
            try {
              await fetch("/api/ai/reports", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ reportId: id, isFavorited: !r.isFavorited }),
              });
              setHistoryReports((prev) =>
                prev.map((rep) => rep.id === id ? { ...rep, isFavorited: !rep.isFavorited } : rep)
              );
            } catch (e) {
              console.error(e);
            }
          }}
          onDeleteReport={handleDeleteReport}
        />
      )}

      {!loading && view === "report" && report && (
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <ReportHeader
            report={report}
            onToggleFavorite={handleToggleFavorite}
            onExportMarkdown={handleExportMarkdown}
            onCopyToClipboard={handleCopyToClipboard}
          />
          <ExecutiveSummary data={report.executiveSummary} />
          <PerformanceScore scores={report.scores} />
          <BiggestWinsCard wins={report.biggestWins} />
          <MissedOpportunityCard items={report.missedOpportunities} />
          <StreamStory milestones={report.streamStory} />
          <AudienceInsights data={report.audienceIntelligence} />
          <BestMoments moments={report.bestMoments} />
          <ClipOpportunityCard clips={report.clipOpportunities} />
          <PersonalizedCoaching coaching={report.coaching} />
          <ActionChecklist
            actionPlan={report.actionPlan}
            onToggleItem={handleToggleAction}
          />
        </div>
      )}
    </div>
  );
};

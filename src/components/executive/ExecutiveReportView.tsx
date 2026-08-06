"use client";

import React, { useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import { ExecutiveReport } from "@/lib/ai/executiveTypes";
import { ReportHeader } from "./ReportHeader";
import { ReportHistoryView } from "./ReportHistoryView";
import { SessionSnapshot } from "./SessionSnapshot";
import { ThreeDiscoveries } from "./ThreeDiscoveries";
import { CreatorMemory } from "./CreatorMemory";
import { CreatorEvolution } from "./CreatorEvolution";
import { RecurringPatterns } from "./RecurringPatterns";
import { CreatorDNAChanges } from "./CreatorDNAChanges";
import { MissionProgress } from "./MissionProgress";
import { AIConfidenceEngine } from "./AIConfidenceEngine";
import { ExperimentCard } from "./ExperimentCard";
import { DecisionLog } from "./DecisionLog";
import { ManagerJournal } from "./ManagerJournal";
import { KnowledgeGraphUpdates } from "./KnowledgeGraphUpdates";

interface ExecutiveReportViewProps {
  defaultSessionId?: string;
}

function generateMarkdown(report: ExecutiveReport): string {
  const lines: string[] = [
    `# AI Creator Manager Intelligence Report`,
    `**Stream:** ${report.streamTitle || "Monitored Broadcast"}`,
    `**Platform:** ${report.platform || "Kick"}`,
    `**Generated:** ${report.createdAt}`,
    ``,
    `## Manager Journal`,
    `"${report.managerJournal?.entryText || report.executiveSummary.narrative}"`,
    `— ${report.managerJournal?.signedBy || "Your AI Creator Manager"}`,
    ``,
    `## Three Discoveries`,
    ...(report.threeDiscoveries || []).map((d) => `- [${d.confidence}%] ${d.discovery} (Evidence: ${d.evidence})`),
    ``,
    `## Experiment for Next Stream`,
    `Test: ${report.experiment?.testInstruction || "N/A"}`,
    `Expected: ${report.experiment?.expectedImprovement || "N/A"}`,
  ];
  return lines.join("\n");
}

export const ExecutiveReportView: React.FC<ExecutiveReportViewProps> = ({ defaultSessionId }) => {
  const { theme } = useApp();
  const isDark = theme === "dark";

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
    if (defaultSessionId) {
      fetchReport(defaultSessionId);
    } else {
      fetchLatestReport();
    }
  }, [defaultSessionId]);

  const handleToggleFavorite = async () => {
    if (!report) return;
    try {
      await fetch("/api/ai/reports", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reportId: report.id, isFavorited: !report.isFavorited }),
      });
      setReport({ ...report, isFavorited: !report.isFavorited });
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteReport = async (id: string) => {
    try {
      await fetch(`/api/ai/reports?reportId=${id}`, { method: "DELETE" });
      setHistoryReports((prev) => prev.filter((r) => r.id !== id));
      if (report?.id === id) setView("history");
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
    a.download = `creator-intelligence-${report.sessionId}.md`;
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
              background: view === "history" ? (isDark ? "rgba(168,85,247,0.15)" : "rgba(168,85,247,0.1)") : "transparent",
              border: view === "history" ? "1px solid rgba(168,85,247,0.35)" : "1px solid transparent",
              color: view === "history" ? (isDark ? "#f1f5f9" : "#9333ea") : (isDark ? "#64748b" : "#64748b"),
            }}
          >
            📁 All Intelligence Reports
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
                background: view === "report" ? (isDark ? "rgba(168,85,247,0.15)" : "rgba(168,85,247,0.1)") : "transparent",
                border: view === "report" ? "1px solid rgba(168,85,247,0.35)" : "1px solid transparent",
                color: view === "report" ? (isDark ? "#f1f5f9" : "#9333ea") : (isDark ? "#64748b" : "#64748b"),
              }}
            >
              🧠 Latest Stream Notebook
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
          {loading ? "Analyzing Broadcast..." : "Generate Latest Report"}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div style={{ padding: "16px 20px", borderRadius: "12px", background: "rgba(244,63,94,0.1)", border: "1px solid rgba(244,63,94,0.25)", color: "#f87171", fontSize: "13px" }}>
          ⚠ {error}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div style={{ padding: "60px 0", textAlign: "center", fontSize: "13px", fontFamily: "'JetBrains Mono', monospace", color: isDark ? "#64748b" : "#64748b" }}>
          <div style={{ fontSize: "36px", marginBottom: "16px" }}>🧠</div>
          Formulating AI Creator Manager Notebook...
          <br />
          <span style={{ color: "#a855f7" }}>Synthesizing telemetry, audience reactions, and long-term memory updates.</span>
        </div>
      )}

      {/* History */}
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
                prev.map((rep) => (rep.id === id ? { ...rep, isFavorited: !rep.isFavorited } : rep))
              );
            } catch (e) {
              console.error(e);
            }
          }}
          onDeleteReport={handleDeleteReport}
        />
      )}

      {/* Redesigned Intelligence Report Layout */}
      {!loading && view === "report" && report && (
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <ReportHeader
            report={report}
            onToggleFavorite={handleToggleFavorite}
            onExportMarkdown={handleExportMarkdown}
            onCopyToClipboard={handleCopyToClipboard}
          />
          <SessionSnapshot
            streamTitle={report.streamTitle}
            platform={report.platform}
            durationMinutes={Math.round((report.streamDurationSeconds || 2700) / 60)}
            health={report.sessionHealth}
            peakViewers={report.peakViewers}
            averageViewers={report.averageViewers}
            totalMessages={report.totalMessages}
            highlightsCount={report.highlightsCount}
            reportsCount={report.reportsCount}
            aiConfidence={report.aiConfidenceScore}
          />
          <ThreeDiscoveries discoveries={report.threeDiscoveries} />
          <ManagerJournal journal={report.managerJournal} />
          <CreatorMemory memoryUpdate={report.memoryUpdate} />
          <CreatorEvolution evolution={report.creatorEvolution} />
          <RecurringPatterns patterns={report.recurringPatterns} />
          <CreatorDNAChanges dnaChanges={report.dnaChanges} />
          <MissionProgress data={report.missionProgress} />
          <AIConfidenceEngine confidence={report.aiConfidence} />
          <ExperimentCard experiment={report.experiment} />
          <DecisionLog logs={report.decisionLog} />
          <KnowledgeGraphUpdates updates={report.knowledgeGraphUpdates} />
        </div>
      )}
    </div>
  );
};

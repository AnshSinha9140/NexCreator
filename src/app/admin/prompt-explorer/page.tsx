"use client";

import { useEffect, useState } from "react";
import AdminHeader from "@/components/admin/AdminHeader";
import DataTable, { Column } from "@/components/admin/DataTable";

export default function PromptExplorerPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [selectedPrompt, setSelectedPrompt] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchPromptLogs = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/prompt-explorer");
      const json = await res.json();
      if (json.success) {
        setLogs(json.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPromptLogs();
  }, []);

  const columns: Column<any>[] = [
    {
      header: "Timestamp",
      accessorKey: "timestamp",
      cell: (row) => <span className="font-mono text-slate-400 text-[11px]">{new Date(row.timestamp).toLocaleTimeString()}</span>,
    },
    {
      header: "Creator",
      accessorKey: "creator",
      cell: (row) => <span className="font-bold text-slate-200">{row.creator}</span>,
    },
    {
      header: "Provider / Model",
      accessorKey: "provider",
      cell: (row) => (
        <div className="font-mono text-xs">
          <span className="text-purple-400 font-bold">{row.provider}</span>
          <span className="text-slate-500 block text-[10px]">{row.model}</span>
        </div>
      ),
    },
    {
      header: "Version",
      accessorKey: "promptVersion",
      cell: (row) => <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 border border-slate-700 text-slate-300">{row.promptVersion}</span>,
    },
    {
      header: "Prompt Size",
      accessorKey: "promptSize",
      cell: (row) => <span className="font-mono text-slate-400">{row.promptSize}</span>,
    },
    {
      header: "Tokens",
      accessorKey: "estimatedTokens",
      cell: (row) => <span className="font-mono text-purple-300 font-bold">{row.estimatedTokens}</span>,
    },
    {
      header: "Latency",
      accessorKey: "latencyMs",
      cell: (row) => <span className="font-mono text-emerald-400">{row.latencyMs} ms</span>,
    },
    {
      header: "Status",
      accessorKey: "responseStatus",
      cell: (row) => (
        <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${row.responseStatus === 200 ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30" : "bg-rose-500/10 text-rose-400 border border-rose-500/30"}`}>
          HTTP {row.responseStatus}
        </span>
      ),
    },
  ];

  return (
    <>
      <AdminHeader
        title="AI Prompt Explorer"
        subtitle="Read-only Execution Chain Inspector & Debugging Interface"
        onRefresh={fetchPromptLogs}
      />

      <div className="admin-page">
        <DataTable
          columns={columns}
          data={logs}
          searchPlaceholder="Search prompts by Creator, Model, or ID..."
          actions={(row) => (
            <button
              onClick={() => setSelectedPrompt(row)}
              className="px-3 py-1.5 rounded-xl bg-purple-600/15 border border-purple-500/30 text-purple-300 hover:bg-purple-600 hover:text-white text-[11px] font-mono transition-all"
            >
              Inspect Flow →
            </button>
          )}
        />

        {/* Complete Step Trace Modal */}
        {selectedPrompt && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-6 shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div>
                  <h3 className="text-base font-bold text-white font-mono">
                    Prompt Trace Inspection — ID: {selectedPrompt.id}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Creator: <strong className="text-purple-400">{selectedPrompt.creator}</strong> | Provider: {selectedPrompt.provider} ({selectedPrompt.model})
                  </p>
                </div>
                <button
                  onClick={() => setSelectedPrompt(null)}
                  className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-sm"
                >
                  ✕
                </button>
              </div>

              {/* Step Flow Chain */}
              <div className="space-y-4 font-mono text-xs">
                {/* Step 1 */}
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <span className="text-purple-400 font-bold text-[10px] uppercase block">Step 1 — Original Pulse Snapshot</span>
                  <pre className="text-slate-300 text-[11px] overflow-x-auto whitespace-pre-wrap">
                    {JSON.stringify(selectedPrompt.traceDetails?.originalPulseSnapshot, null, 2)}
                  </pre>
                </div>

                {/* Step 2 */}
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <span className="text-blue-400 font-bold text-[10px] uppercase block">Step 2 — Prompt Builder Output</span>
                  <pre className="text-slate-300 text-[11px] overflow-x-auto whitespace-pre-wrap">
                    {JSON.stringify(selectedPrompt.traceDetails?.promptBuilderOutput, null, 2)}
                  </pre>
                </div>

                {/* Step 3 */}
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <span className="text-amber-400 font-bold text-[10px] uppercase block">Step 3 — Final Prompt Dispatched</span>
                  <pre className="text-amber-200 text-[11px] overflow-x-auto whitespace-pre-wrap bg-slate-900 p-3 rounded-lg">
                    {selectedPrompt.traceDetails?.finalPrompt}
                  </pre>
                </div>

                {/* Step 4 */}
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <span className="text-emerald-400 font-bold text-[10px] uppercase block">Step 4 — Provider Raw Response & Parsed JSON</span>
                  <pre className="text-emerald-300 text-[11px] overflow-x-auto whitespace-pre-wrap bg-slate-900 p-3 rounded-lg">
                    {selectedPrompt.traceDetails?.providerResponse}
                  </pre>
                </div>

                {/* Step 5 */}
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <span className="text-pink-400 font-bold text-[10px] uppercase block">Step 5 — Stored AI Insight</span>
                  <pre className="text-slate-300 text-[11px] overflow-x-auto whitespace-pre-wrap">
                    {JSON.stringify(selectedPrompt.traceDetails?.storedAiInsight, null, 2)}
                  </pre>
                </div>
              </div>

              <div className="text-right">
                <button
                  onClick={() => setSelectedPrompt(null)}
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-medium text-xs shadow-lg shadow-purple-600/20"
                >
                  Close Inspection
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

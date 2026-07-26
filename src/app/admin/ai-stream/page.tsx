"use client";

import { useEffect, useState } from "react";
import AdminHeader from "@/components/admin/AdminHeader";
import DataTable, { Column } from "@/components/admin/DataTable";

export default function AIStreamPage() {
  const [streamEvents, setStreamEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [providerFilter, setProviderFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const fetchStream = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/ai-stream?provider=${providerFilter}&status=${statusFilter}`);
      const json = await res.json();
      if (json.success) setStreamEvents(json.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStream();
  }, [providerFilter, statusFilter]);

  if (loading) {
    return (
      <>
        <AdminHeader
          title="Live AI Request Stream"
          subtitle="Real-time Dispatch Log, Latency Breakdown & Provider Failover Events"
        />
        <div className="admin-page">
          <div style={{ padding: "80px 0", textAlign: "center", fontSize: "12px", fontFamily: "'JetBrains Mono', monospace", color: "#64748b" }}>
            Loading Live AI Request Telemetry Stream...
          </div>
        </div>
      </>
    );
  }

  const columns: Column<any>[] = [
    {
      header: "Timestamp",
      accessorKey: "timestamp",
      cell: (row) => <span className="font-mono text-slate-400 text-[11px]" suppressHydrationWarning>{new Date(row.timestamp).toLocaleTimeString()}</span>,
    },
    {
      header: "Creator",
      accessorKey: "creator",
      cell: (row) => <span className="font-bold text-white">{row.creator}</span>,
    },
    {
      header: "Provider & Model",
      accessorKey: "provider",
      cell: (row) => (
        <div className="font-mono text-xs">
          <span className="text-purple-400 font-bold">{row.provider}</span>
          <span className="text-slate-500 block text-[10px]">{row.model}</span>
        </div>
      ),
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
      accessorKey: "status",
      cell: (row) => {
        const isSuccess = row.status === "SUCCESS";
        const isFallback = row.status === "FALLBACK";
        return (
          <span
            className={`px-2.5 py-1 rounded text-[10px] font-mono font-bold border ${
              isSuccess
                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                : isFallback
                ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                : "bg-rose-500/10 text-rose-400 border-rose-500/30"
            }`}
          >
            {row.status}
          </span>
        );
      },
    },
    {
      header: "Fallback / Switch",
      accessorKey: "fallbackUsed",
      cell: (row) => (
        <span className="font-mono text-[10px]">
          {row.fallbackUsed ? (
            <span className="text-amber-400 font-bold">YES (Failover)</span>
          ) : (
            <span className="text-slate-500">NO</span>
          )}
        </span>
      ),
    },
  ];

  return (
    <>
      <AdminHeader
        title="Live AI Request Stream"
        subtitle="Real-time Dispatch Log, Latency Breakdown & Provider Failover Events"
        onRefresh={fetchStream}
      />

      <div className="admin-page">
        {/* Filter Controls */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          flexWrap: "wrap", gap: "16px", padding: "12px 16px",
          background: "#0e1120", border: "1px solid rgba(255,255,255,0.06)",
          borderRadius: "14px"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            <span style={{ fontSize: "12px", fontFamily: "'JetBrains Mono', monospace", color: "#64748b", marginRight: "4px" }}>Providers:</span>
            {["all", "Gemini", "Groq"].map((p) => (
              <button
                key={p}
                onClick={() => setProviderFilter(p)}
                style={{
                  padding: "8px 16px", borderRadius: "10px",
                  fontSize: "12px", fontFamily: "'JetBrains Mono', monospace",
                  fontWeight: 600, cursor: "pointer",
                  transition: "all 0.15s ease",
                  background: providerFilter === p ? "#9333ea" : "rgba(255,255,255,0.03)",
                  color: providerFilter === p ? "#ffffff" : "#94a3b8",
                  border: providerFilter === p ? "1px solid #a855f7" : "1px solid rgba(255,255,255,0.06)",
                  boxShadow: providerFilter === p ? "0 2px 10px rgba(147,51,234,0.3)" : "none"
                }}
              >
                {p}
              </button>
            ))}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            <span style={{ fontSize: "12px", fontFamily: "'JetBrains Mono', monospace", color: "#64748b", marginRight: "4px" }}>Status:</span>
            {["all", "SUCCESS", "FALLBACK", "TIMEOUT"].map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                style={{
                  padding: "8px 16px", borderRadius: "10px",
                  fontSize: "12px", fontFamily: "'JetBrains Mono', monospace",
                  fontWeight: 600, cursor: "pointer",
                  transition: "all 0.15s ease",
                  background: statusFilter === s ? "#9333ea" : "rgba(255,255,255,0.03)",
                  color: statusFilter === s ? "#ffffff" : "#94a3b8",
                  border: statusFilter === s ? "1px solid #a855f7" : "1px solid rgba(255,255,255,0.06)",
                  boxShadow: statusFilter === s ? "0 2px 10px rgba(147,51,234,0.3)" : "none"
                }}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <DataTable
          columns={columns}
          data={streamEvents}
          searchPlaceholder="Filter AI stream by Creator, Session, or Model..."
        />
      </div>
    </>
  );
}

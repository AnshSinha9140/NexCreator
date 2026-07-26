"use client";

import { useEffect, useState } from "react";
import AdminHeader from "@/components/admin/AdminHeader";
import DataTable, { Column } from "@/components/admin/DataTable";

export default function LogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [subsystemFilter, setSubsystemFilter] = useState("all");

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/logs?subsystem=${subsystemFilter}`);
      const json = await res.json();
      if (json.success) setLogs(json.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [subsystemFilter]);

  const handleExport = (type: "csv" | "json") => {
    const dataStr = type === "json"
      ? JSON.stringify(logs, null, 2)
      : "ID,Timestamp,Level,Subsystem,Message\n" + logs.map((l) => `"${l.id}","${l.timestamp}","${l.level}","${l.subsystem}","${l.message.replace(/"/g, '""')}"`).join("\n");

    const blob = new Blob([dataStr], { type: type === "json" ? "application/json" : "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `nexcreator-admin-logs.${type}`;
    a.click();
  };

  if (loading) {
    return (
      <>
        <AdminHeader
          title="Structured Logs Explorer"
          subtitle="System Audit Trail, Ingestion Events & Operator Logs"
        />
        <div className="admin-page">
          <div style={{ padding: "80px 0", textAlign: "center", fontSize: "12px", fontFamily: "'JetBrains Mono', monospace", color: "#64748b" }}>
            Loading Structured System Logs...
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
      header: "Level",
      accessorKey: "level",
      cell: (row) => (
        <span className={`px-2.5 py-1 rounded text-[10px] font-mono font-bold border ${
          row.level === "WARN" ? "bg-amber-500/10 text-amber-400 border-amber-500/30" : "bg-purple-500/10 text-purple-400 border-purple-500/30"
        }`}>
          {row.level}
        </span>
      ),
    },
    {
      header: "Subsystem",
      accessorKey: "subsystem",
      cell: (row) => <span className="font-mono text-slate-300 font-semibold">{row.subsystem}</span>,
    },
    {
      header: "Message",
      accessorKey: "message",
      cell: (row) => <span className="font-mono text-slate-200">{row.message}</span>,
    },
    {
      header: "Metadata",
      accessorKey: "metadata",
      cell: (row) => <span className="font-mono text-slate-400 text-[10px]">{JSON.stringify(row.metadata)}</span>,
    },
  ];

  return (
    <>
      <AdminHeader
        title="Structured Logs Explorer"
        subtitle="System Audit Trail, Ingestion Events & Operator Logs"
        onRefresh={fetchLogs}
      />

      <div className="admin-page">
        {/* Controls & Export Header */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          flexWrap: "wrap", gap: "16px", padding: "12px 16px",
          background: "#0e1120", border: "1px solid rgba(255,255,255,0.06)",
          borderRadius: "14px"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            {["all", "Authentication", "Monitoring", "Collector", "Snapshots", "AI Operations", "System"].map((sub) => (
              <button
                key={sub}
                onClick={() => setSubsystemFilter(sub)}
                style={{
                  padding: "8px 16px", borderRadius: "10px",
                  fontSize: "12px", fontFamily: "'JetBrains Mono', monospace",
                  fontWeight: 600, cursor: "pointer",
                  transition: "all 0.15s ease",
                  background: subsystemFilter === sub ? "#9333ea" : "rgba(255,255,255,0.03)",
                  color: subsystemFilter === sub ? "#ffffff" : "#94a3b8",
                  border: subsystemFilter === sub ? "1px solid #a855f7" : "1px solid rgba(255,255,255,0.06)",
                  boxShadow: subsystemFilter === sub ? "0 2px 10px rgba(147,51,234,0.3)" : "none"
                }}
              >
                {sub}
              </button>
            ))}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <button
              onClick={() => handleExport("csv")}
              style={{
                padding: "8px 14px", borderRadius: "10px",
                background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
                color: "#cbd5e1", fontSize: "12px", fontFamily: "'JetBrains Mono', monospace",
                cursor: "pointer", transition: "all 0.15s ease"
              }}
            >
              Export CSV
            </button>
            <button
              onClick={() => handleExport("json")}
              style={{
                padding: "8px 14px", borderRadius: "10px",
                background: "#9333ea", border: "1px solid #a855f7",
                color: "#ffffff", fontSize: "12px", fontFamily: "'JetBrains Mono', monospace",
                fontWeight: 600, cursor: "pointer", transition: "all 0.15s ease",
                boxShadow: "0 2px 10px rgba(147,51,234,0.3)"
              }}
            >
              Export JSON
            </button>
          </div>
        </div>

        <DataTable
          columns={columns}
          data={logs}
          searchPlaceholder="Search log messages, levels, or subsystems..."
        />
      </div>
    </>
  );
}

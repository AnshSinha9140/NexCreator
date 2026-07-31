"use client";

import { useEffect, useState, useCallback } from "react";
import AdminHeader from "@/components/admin/AdminHeader";
import DataTable, { Column } from "@/components/admin/DataTable";

export default function AuditLogPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState("all");

  const fetchAuditLog = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/audit-log?action=${actionFilter}`);
      const json = await res.json();
      if (json.success) setLogs(json.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [actionFilter]);

  useEffect(() => {
    fetchAuditLog();
  }, [fetchAuditLog]);

  const handleExport = (type: "csv" | "json") => {
    const dataStr =
      type === "json"
        ? JSON.stringify(logs, null, 2)
        : "ID,Timestamp,Admin,Action,Target,Reason\n" +
          logs.map((l) => `"${l.id}","${l.timestamp}","${l.admin}","${l.action}","${l.target}","${l.reason?.replace(/"/g, '""') || ""}"`).join("\n");

    const blob = new Blob([dataStr], { type: type === "json" ? "application/json" : "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `nexcreator-audit-trail.${type}`;
    a.click();
  };

  if (loading && logs.length === 0) {
    return (
      <>
        <AdminHeader
          title="Immutable Admin Audit Log"
          subtitle="Cryptographically Structured Operator Activity & Governance Audit Trail"
        />
        <div className="admin-page">
          <div style={{ padding: "80px 0", textAlign: "center", fontSize: "12px", fontFamily: "'JetBrains Mono', monospace", color: "#64748b" }}>
            Loading Immutable Admin Audit Trail...
          </div>
        </div>
      </>
    );
  }

  const columns: Column<any>[] = [
    {
      header: "Timestamp",
      accessorKey: "timestamp",
      cell: (row) => <span className="font-mono text-slate-400 text-[11px]" suppressHydrationWarning>{row.timestamp ? new Date(row.timestamp).toLocaleString() : "—"}</span>,
    },
    {
      header: "Admin User",
      accessorKey: "admin",
      cell: (row) => <span className="font-mono text-purple-300 font-bold">{row.admin}</span>,
    },
    {
      header: "Action",
      accessorKey: "action",
      cell: (row) => (
        <span className="px-2.5 py-1 rounded text-[10px] font-mono font-bold bg-slate-800/80 border border-slate-700 text-slate-200">
          {row.action}
        </span>
      ),
    },
    {
      header: "Target",
      accessorKey: "target",
      cell: (row) => <span className="font-mono text-emerald-400">{row.target}</span>,
    },
    {
      header: "Reason / Details",
      accessorKey: "reason",
      cell: (row) => <span className="font-mono text-slate-300">{row.reason}</span>,
    },
  ];

  return (
    <>
      <AdminHeader
        title="Immutable Admin Audit Log"
        subtitle="Cryptographically Structured Operator Activity & Governance Audit Trail"
        onRefresh={fetchAuditLog}
      />

      <div className="admin-page">
        {/* Controls Bar */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          flexWrap: "wrap", gap: "16px", padding: "12px 16px",
          background: "#0e1120", border: "1px solid rgba(255,255,255,0.06)",
          borderRadius: "14px"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            {["all", "Approved Creator", "Rejected Creator", "Feature Flag Updated", "Changed Settings"].map((act) => (
              <button
                key={act}
                onClick={() => setActionFilter(act)}
                style={{
                  padding: "8px 16px", borderRadius: "10px",
                  fontSize: "12px", fontFamily: "'JetBrains Mono', monospace",
                  fontWeight: 600, cursor: "pointer",
                  transition: "all 0.15s ease",
                  background: actionFilter === act ? "#9333ea" : "rgba(255,255,255,0.03)",
                  color: actionFilter === act ? "#ffffff" : "#94a3b8",
                  border: actionFilter === act ? "1px solid #a855f7" : "1px solid rgba(255,255,255,0.06)",
                  boxShadow: actionFilter === act ? "0 2px 10px rgba(147,51,234,0.3)" : "none"
                }}
              >
                {act}
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
              Export Audit CSV
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
          searchPlaceholder="Search audit trail by Admin, Target, Action, or Reason..."
        />
      </div>
    </>
  );
}

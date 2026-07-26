"use client";

import { useEffect, useState } from "react";
import AdminHeader from "@/components/admin/AdminHeader";
import DataTable, { Column } from "@/components/admin/DataTable";
import HealthBadge from "@/components/admin/HealthBadge";

export default function CreatorManagementPage() {
  const [creators, setCreators] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCreators = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/creators?status=all");
      const json = await res.json();
      if (json.success) {
        setCreators(json.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCreators();
  }, []);

  const columns: Column<any>[] = [
    {
      header: "Name / ID",
      accessorKey: "displayName",
      cell: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center font-bold text-purple-300 text-xs">
            {row.displayName.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <div className="font-bold text-slate-100">{row.displayName}</div>
            <div className="text-[10px] text-purple-400 font-mono">{row.id}</div>
          </div>
        </div>
      ),
    },
    {
      header: "Email",
      accessorKey: "email",
      cell: (row) => <span className="text-slate-300 font-mono">{row.email}</span>,
    },
    {
      header: "Platforms",
      accessorKey: "connectedPlatforms",
      cell: (row) => (
        <div className="flex items-center gap-1.5 flex-wrap">
          {(row.connectedPlatforms || ["kick"]).map((p: string, idx: number) => (
            <span key={idx} className="px-2 py-0.5 rounded text-[10px] uppercase font-mono font-semibold bg-slate-800 border border-slate-700 text-slate-300">
              {p}
            </span>
          ))}
        </div>
      ),
    },
    {
      header: "Status",
      accessorKey: "status",
      cell: (row) => (
        <HealthBadge
          status={row.status === "verified" ? "healthy" : row.status === "pending" ? "warning" : "offline"}
          label={row.status.toUpperCase()}
        />
      ),
    },
    {
      header: "Monitoring",
      accessorKey: "monitoringEnabled",
      cell: (row) => (
        <span className={`px-2 py-0.5 rounded text-[10px] font-mono ${row.monitoringEnabled ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30" : "bg-slate-800 text-slate-400"}`}>
          {row.monitoringEnabled ? "ENABLED" : "DISABLED"}
        </span>
      ),
    },
    {
      header: "AI Requests",
      accessorKey: "aiRequests",
      cell: (row) => <span className="font-mono text-purple-400 font-bold">{row.aiRequests?.toLocaleString() || "0"}</span>,
    },
    {
      header: "Storage",
      accessorKey: "storageUsage",
      cell: (row) => <span className="font-mono text-slate-400">{row.storageUsage || "120 MB"}</span>,
    },
    {
      header: "Created",
      accessorKey: "createdAt",
      cell: (row) => <span className="font-mono text-slate-400 text-[11px]">{new Date(row.createdAt).toLocaleDateString()}</span>,
    },
  ];

  return (
    <>
      <AdminHeader
        title="Creator Directory Management"
        subtitle="Search, Filter, and Audit All NexCreator Platform Accounts"
        onRefresh={fetchCreators}
      />

      <div className="admin-page">
        <DataTable
          columns={columns}
          data={creators}
          searchPlaceholder="Search by Name, Email, Platform, or ID..."
          actions={(row) => (
            <button
              onClick={() => alert(`Inspecting Creator ${row.displayName}`)}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-mono transition-colors border border-slate-700"
            >
              Manage
            </button>
          )}
        />
      </div>
    </>
  );
}

"use client";

import { useEffect, useState, useCallback } from "react";
import AdminHeader from "@/components/admin/AdminHeader";
import MetricCard from "@/components/admin/MetricCard";
import HealthBadge from "@/components/admin/HealthBadge";
import { useAdmin } from "@/context/AdminContext";

export default function QueueMonitorPage() {
  const { bundle, refresh } = useAdmin();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string>("");

  const fetchQueues = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/queues");
      const json = await res.json();
      if (json.success) setData(json.data);
      else if (bundle?.queues) setData(bundle.queues);
    } catch {
      if (bundle?.queues) setData(bundle.queues);
    } finally {
      setLoading(false);
    }
  }, [bundle]);

  useEffect(() => {
    fetchQueues();
  }, [fetchQueues]);

  const handleQueueAction = async (action: "retry_failed" | "clear_completed" | "inspect", queueName: string) => {
    try {
      const res = await fetch("/api/admin/operations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          domain: "queue",
          action,
          targetId: queueName,
          reason: `Admin trigger ${action} on queue ${queueName}`,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setMessage(`Success: Queue '${queueName}' ${action} executed.`);
        setTimeout(() => setMessage(""), 4000);
        fetchQueues();
        refresh();
      } else {
        setMessage(`Error: ${json.error || json.message}`);
      }
    } catch (e: any) {
      setMessage(`Error: ${e.message}`);
    }
  };

  if (loading && !data) {
    return (
      <>
        <AdminHeader
          title="Background Worker Queue Monitor"
          subtitle="Worker Dispatch Telemetry, Retry Backoffs & Ingestion Queue Health"
        />
        <div className="admin-page">
          <div style={{ padding: "80px 0", textAlign: "center", fontSize: "12px", fontFamily: "'JetBrains Mono', monospace", color: "#64748b" }}>
            Loading Worker Queue Telemetry...
          </div>
        </div>
      </>
    );
  }

  const m = data?.metrics || {};

  return (
    <>
      <AdminHeader
        title="Background Worker Queue Monitor & Control Plane"
        subtitle="Worker Dispatch Telemetry, Retry Backoffs & Control Plane Commands"
        onRefresh={() => { fetchQueues(); refresh(); }}
      />

      <div className="admin-page">
        {message && (
          <div style={{
            padding: "12px 16px", borderRadius: "10px",
            background: "rgba(168,85,247,0.12)", border: "1px solid rgba(168,85,247,0.3)",
            color: "#e9d5ff", fontSize: "12px", fontFamily: "'JetBrains Mono', monospace",
            display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px"
          }}>
            <span>{message}</span>
            <button onClick={() => setMessage("")} style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer" }}>×</button>
          </div>
        )}

        {/* Key Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" style={{ marginBottom: "24px" }}>
          <MetricCard title="Completed Jobs Today" value={m.completedJobsToday?.toLocaleString() || 0} subtitle="Snapshot & AI Workers" statusColor="emerald" />
          <MetricCard title="Job Success Rate" value={m.jobSuccessPercentage || "100%"} subtitle="Zero Worker Crashes" statusColor="purple" />
          <MetricCard title="Avg Queue Wait Time" value={`${m.avgQueueTimeMs || 0} ms`} subtitle="Low Dispatch Latency" statusColor="blue" />
          <MetricCard title="Retries Today" value={m.retryCountToday || 0} subtitle="Automated Backoff Retries" statusColor="amber" />
        </div>

        {/* Queue Workers Breakdown */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))", gap: "16px" }}>
          {(data?.queues || []).map((q: any, idx: number) => (
            <div key={idx} className="admin-card" style={{ display: "flex", flexDirection: "column", gap: "16px", padding: "20px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px" }}>
                <h4 style={{ margin: 0, fontSize: "15px", fontWeight: 700, color: "#f1f5f9" }}>{q.name}</h4>
                <HealthBadge status={q.status || "healthy"} />
              </div>

              {/* 2x2 grid for sub-tiles */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <div style={{ background: "rgba(6, 8, 16, 0.6)", padding: "10px 14px", borderRadius: "10px", border: "1px solid rgba(255, 255, 255, 0.06)" }}>
                  <span style={{ fontSize: "9px", fontFamily: "'JetBrains Mono', monospace", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.08em", display: "block" }}>PENDING</span>
                  <span style={{ fontSize: "16px", fontWeight: 800, fontFamily: "'JetBrains Mono', monospace", color: "#fbbf24", marginTop: "4px", display: "block" }}>{q.pending || 0}</span>
                </div>

                <div style={{ background: "rgba(6, 8, 16, 0.6)", padding: "10px 14px", borderRadius: "10px", border: "1px solid rgba(255, 255, 255, 0.06)" }}>
                  <span style={{ fontSize: "9px", fontFamily: "'JetBrains Mono', monospace", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.08em", display: "block" }}>ACTIVE</span>
                  <span style={{ fontSize: "16px", fontWeight: 800, fontFamily: "'JetBrains Mono', monospace", color: "#c084fc", marginTop: "4px", display: "block" }}>{q.active || 0}</span>
                </div>

                <div style={{ background: "rgba(6, 8, 16, 0.6)", padding: "10px 14px", borderRadius: "10px", border: "1px solid rgba(255, 255, 255, 0.06)" }}>
                  <span style={{ fontSize: "9px", fontFamily: "'JetBrains Mono', monospace", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.08em", display: "block" }}>COMPLETED</span>
                  <span style={{ fontSize: "16px", fontWeight: 800, fontFamily: "'JetBrains Mono', monospace", color: "#34d399", marginTop: "4px", display: "block" }}>{q.completed?.toLocaleString() || 0}</span>
                </div>

                <div style={{ background: "rgba(6, 8, 16, 0.6)", padding: "10px 14px", borderRadius: "10px", border: "1px solid rgba(255, 255, 255, 0.06)" }}>
                  <span style={{ fontSize: "9px", fontFamily: "'JetBrains Mono', monospace", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.08em", display: "block" }}>FAILED</span>
                  <span style={{ fontSize: "16px", fontWeight: 800, fontFamily: "'JetBrains Mono', monospace", color: "#f87171", marginTop: "4px", display: "block" }}>{q.failed || 0}</span>
                </div>
              </div>

              {/* Control Plane Buttons */}
              <div style={{ display: "flex", gap: "8px", paddingTop: "8px", borderTop: "1px solid rgba(255,255,255,0.04)" }}>
                <button
                  onClick={() => handleQueueAction("retry_failed", q.name)}
                  style={{ flex: 1, padding: "6px 10px", borderRadius: "8px", background: "rgba(251,191,36,0.12)", border: "1px solid rgba(251,191,36,0.3)", color: "#fbbf24", fontSize: "11px", fontWeight: 600, cursor: "pointer" }}
                >
                  Retry Failed
                </button>
                <button
                  onClick={() => handleQueueAction("clear_completed", q.name)}
                  style={{ flex: 1, padding: "6px 10px", borderRadius: "8px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#cbd5e1", fontSize: "11px", fontWeight: 600, cursor: "pointer" }}
                >
                  Clear Completed
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

"use client";

import { useEffect, useState } from "react";
import AdminHeader from "@/components/admin/AdminHeader";
import MetricCard from "@/components/admin/MetricCard";
import HealthBadge from "@/components/admin/HealthBadge";

export default function QueueMonitorPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchQueues = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/queues");
      const json = await res.json();
      if (json.success) setData(json.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueues();
  }, []);

  if (loading) {
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
        title="Background Worker Queue Monitor"
        subtitle="Worker Dispatch Telemetry, Retry Backoffs & Ingestion Queue Health"
        onRefresh={fetchQueues}
      />

      <div className="admin-page">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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

              {/* 2x2 grid for sub-tiles to give each metric ample breathing room */}
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
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

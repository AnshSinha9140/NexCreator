"use client";

import { useEffect, useState } from "react";
import AdminHeader from "@/components/admin/AdminHeader";
import HealthBadge from "@/components/admin/HealthBadge";

export default function MonitoringDashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchMonitoring = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/monitoring");
      const json = await res.json();
      if (json.success) setData(json.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMonitoring();
  }, []);

  if (loading) {
    return (
      <>
        <AdminHeader
          title="Monitoring Engine Dashboard"
          subtitle="Subsystem Metrics, Rolling Buffer Telemetry & Ingestion Pipelines"
        />
        <div className="admin-page">
          <div style={{ padding: "80px 0", textAlign: "center", fontSize: "12px", fontFamily: "'JetBrains Mono', monospace", color: "#64748b" }}>
            Loading Monitoring Engine Telemetry...
          </div>
        </div>
      </>
    );
  }

  const d = data || {};

  return (
    <>
      <AdminHeader
        title="Monitoring Engine Dashboard"
        subtitle="Subsystem Metrics, Rolling Buffer Telemetry & Ingestion Pipelines"
        onRefresh={fetchMonitoring}
      />

      <div className="admin-page">
        {/* Pipeline Subsystems Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px" }}>
          {/* Detection Engine */}
          <div className="admin-card" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", gap: "12px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px" }}>
              <span style={{ fontSize: "10px", fontFamily: "'JetBrains Mono', monospace", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.08em" }}>Detection Engine</span>
              <HealthBadge status={d.detectionEngine?.status || "healthy"} />
            </div>
            <div>
              <div style={{ fontSize: "20px", fontWeight: 800, fontFamily: "'JetBrains Mono', monospace", color: "#f1f5f9" }}>{d.detectionEngine?.throughputMsgsPerSec || 0} msgs/s</div>
              <div style={{ fontSize: "11px", fontFamily: "'JetBrains Mono', monospace", color: "#64748b", marginTop: "4px" }}>Rules: {d.detectionEngine?.activeRulesEvaluated || 0} | {d.detectionEngine?.avgEvaluationTimeMs || 0}ms</div>
            </div>
          </div>

          {/* Collector */}
          <div className="admin-card" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", gap: "12px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px" }}>
              <span style={{ fontSize: "10px", fontFamily: "'JetBrains Mono', monospace", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.08em" }}>Collector</span>
              <HealthBadge status={d.collector?.status || "healthy"} />
            </div>
            <div>
              <div style={{ fontSize: "20px", fontWeight: 800, fontFamily: "'JetBrains Mono', monospace", color: "#34d399" }}>{d.collector?.activeSockets || 0} Sockets</div>
              <div style={{ fontSize: "11px", fontFamily: "'JetBrains Mono', monospace", color: "#64748b", marginTop: "4px" }}>WS: {d.collector?.wsConnections || 0} | Polling: {d.collector?.pollingFallbackConnections || 0}</div>
            </div>
          </div>

          {/* Rolling Buffer */}
          <div className="admin-card" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", gap: "12px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px" }}>
              <span style={{ fontSize: "10px", fontFamily: "'JetBrains Mono', monospace", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.08em" }}>Rolling Buffer</span>
              <HealthBadge status={d.rollingBuffer?.status || "healthy"} />
            </div>
            <div>
              <div style={{ fontSize: "20px", fontWeight: 800, fontFamily: "'JetBrains Mono', monospace", color: "#c084fc" }}>{d.rollingBuffer?.currentUsage || "0 MB"}</div>
              <div style={{ fontSize: "11px", fontFamily: "'JetBrains Mono', monospace", color: "#64748b", marginTop: "4px" }}>Max Cap: {d.rollingBuffer?.bufferCapacity || "0 MB"}</div>
            </div>
          </div>

          {/* Snapshot Engine */}
          <div className="admin-card" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", gap: "12px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px" }}>
              <span style={{ fontSize: "10px", fontFamily: "'JetBrains Mono', monospace", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.08em" }}>Snapshot Engine</span>
              <HealthBadge status={d.snapshotEngine?.status || "healthy"} />
            </div>
            <div>
              <div style={{ fontSize: "20px", fontWeight: 800, fontFamily: "'JetBrains Mono', monospace", color: "#60a5fa" }}>{d.snapshotEngine?.snapshotsGeneratedToday || 0} Today</div>
              <div style={{ fontSize: "11px", fontFamily: "'JetBrains Mono', monospace", color: "#64748b", marginTop: "4px" }}>Interval: {d.snapshotEngine?.intervalSeconds || 0}s</div>
            </div>
          </div>

          {/* AI Producer */}
          <div className="admin-card" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", gap: "12px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px" }}>
              <span style={{ fontSize: "10px", fontFamily: "'JetBrains Mono', monospace", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.08em" }}>AI Producer</span>
              <HealthBadge status={d.aiProducer?.status || "healthy"} />
            </div>
            <div>
              <div style={{ fontSize: "20px", fontWeight: 800, fontFamily: "'JetBrains Mono', monospace", color: "#fbbf24" }}>{d.aiProducer?.activeWorkers || 0} Workers</div>
              <div style={{ fontSize: "11px", fontFamily: "'JetBrains Mono', monospace", color: "#64748b", marginTop: "4px" }}>Queue: {d.aiProducer?.queueSize || 0} jobs</div>
            </div>
          </div>
        </div>

        {/* Live Session Telemetry Panel */}
        <div className="admin-card" style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <h3 style={{ margin: 0, fontSize: "15px", fontWeight: 700, color: "#f1f5f9" }}>Active Session Realtime Telemetry</h3>
            <span style={{ fontSize: "11px", fontFamily: "'JetBrains Mono', monospace", color: "#c084fc" }}>
              ID: {d.telemetry?.currentSession || "N/A"}
            </span>
          </div>

          {/* 4 Metric Tiles with ample padding */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "12px" }}>
            <div style={{ background: "rgba(6, 8, 16, 0.6)", padding: "14px 16px", borderRadius: "12px", border: "1px solid rgba(255, 255, 255, 0.06)" }}>
              <span style={{ fontSize: "10px", fontFamily: "'JetBrains Mono', monospace", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.08em", display: "block" }}>Viewers</span>
              <span style={{ fontSize: "20px", fontWeight: 800, fontFamily: "'JetBrains Mono', monospace", color: "#34d399", marginTop: "6px", display: "block" }}>
                {d.telemetry?.viewerCount?.toLocaleString() || 0}
              </span>
            </div>

            <div style={{ background: "rgba(6, 8, 16, 0.6)", padding: "14px 16px", borderRadius: "12px", border: "1px solid rgba(255, 255, 255, 0.06)" }}>
              <span style={{ fontSize: "10px", fontFamily: "'JetBrains Mono', monospace", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.08em", display: "block" }}>Buffered Messages</span>
              <span style={{ fontSize: "20px", fontWeight: 800, fontFamily: "'JetBrains Mono', monospace", color: "#c084fc", marginTop: "6px", display: "block" }}>
                {d.telemetry?.bufferedMessages || 0}
              </span>
            </div>

            <div style={{ background: "rgba(6, 8, 16, 0.6)", padding: "14px 16px", borderRadius: "12px", border: "1px solid rgba(255, 255, 255, 0.06)" }}>
              <span style={{ fontSize: "10px", fontFamily: "'JetBrains Mono', monospace", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.08em", display: "block" }}>Snapshots</span>
              <span style={{ fontSize: "20px", fontWeight: 800, fontFamily: "'JetBrains Mono', monospace", color: "#60a5fa", marginTop: "6px", display: "block" }}>
                {d.telemetry?.snapshotsCount || 0}
              </span>
            </div>

            <div style={{ background: "rgba(6, 8, 16, 0.6)", padding: "14px 16px", borderRadius: "12px", border: "1px solid rgba(255, 255, 255, 0.06)" }}>
              <span style={{ fontSize: "10px", fontFamily: "'JetBrains Mono', monospace", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.08em", display: "block" }}>Reconnect Count</span>
              <span style={{ fontSize: "20px", fontWeight: 800, fontFamily: "'JetBrains Mono', monospace", color: "#e2e8f0", marginTop: "6px", display: "block" }}>
                {d.telemetry?.reconnectCount || 0}
              </span>
            </div>
          </div>

          {/* Representative Messages */}
          <div style={{ display: "flex", flexDirection: "column", gap: "10px", paddingTop: "8px" }}>
            <span style={{ fontSize: "10px", fontFamily: "'JetBrains Mono', monospace", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.1em" }}>
              Representative Live Messages:
            </span>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {(d.telemetry?.representativeMessages || []).map((m: any, idx: number) => (
                <div key={idx} style={{
                  padding: "10px 14px", borderRadius: "10px",
                  background: "rgba(6, 8, 16, 0.5)", border: "1px solid rgba(255, 255, 255, 0.04)",
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  fontSize: "12px", fontFamily: "'JetBrains Mono', monospace"
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <span style={{ color: "#c084fc", fontWeight: 700 }}>@{m.user}:</span>
                    <span style={{ color: "#e2e8f0" }}>{m.msg}</span>
                  </div>
                  <span style={{ color: "#475569", fontSize: "10px" }}>{m.timestamp}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

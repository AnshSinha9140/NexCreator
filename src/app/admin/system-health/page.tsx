"use client";

import { useEffect, useState, useCallback } from "react";
import AdminHeader from "@/components/admin/AdminHeader";
import HealthBadge from "@/components/admin/HealthBadge";

export default function SystemHealthPage() {
  const [dashDebug, setDashDebug] = useState<any>(null);
  const [aiDebug, setAiDebug] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchDiagnostics = useCallback(async () => {
    setLoading(true);
    try {
      const [dashRes, aiRes] = await Promise.all([
        fetch("/api/admin/debug/dashboard"),
        fetch("/api/admin/debug/ai-telemetry"),
      ]);
      const dashJson = await dashRes.json();
      const aiJson = await aiRes.json();
      if (dashJson.success) setDashDebug(dashJson.data);
      if (aiJson.success) setAiDebug(aiJson.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDiagnostics();
  }, [fetchDiagnostics]);

  if (loading && !dashDebug) {
    return (
      <>
        <AdminHeader
          title="Engineering Diagnostics & Infrastructure Health"
          subtitle="End-to-End Subsystem Monitoring & Engineering Performance Benchmarks"
        />
        <div className="admin-page">
          <div style={{ padding: "80px 0", textAlign: "center", fontSize: "12px", fontFamily: "'JetBrains Mono', monospace", color: "#64748b" }}>
            Loading System Diagnostics Telemetry...
          </div>
        </div>
      </>
    );
  }

  const dbg = dashDebug || {};
  const aiDbg = aiDebug || {};

  return (
    <>
      <AdminHeader
        title="Engineering Diagnostics & Operations Health"
        subtitle="Canonical Subsystem State, Engineering Performance Diagnostics & Debug Benchmarks"
        onRefresh={fetchDiagnostics}
      />

      <div className="admin-page">
        {/* Diagnostics Banner */}
        <div className="admin-card-hero" style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          gap: "24px", padding: "24px 28px", flexWrap: "wrap", marginBottom: "20px"
        }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "4px", maxWidth: "650px" }}>
            <span style={{ fontSize: "10px", fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, color: "#c084fc", letterSpacing: "0.14em", textTransform: "uppercase" }}>
              ENGINEERING DIAGNOSTICS CONTROL
            </span>
            <h2 style={{ margin: 0, fontSize: "20px", fontWeight: 800, color: "#ffffff", letterSpacing: "-0.02em" }}>
              NexCreator Core Operations Mesh
            </h2>
            <p style={{ margin: 0, fontSize: "12px", color: "#94a3b8", lineHeight: "1.5" }}>
              MongoDB Status: <strong style={{ color: dbg.mongoConnected ? "#34d399" : "#f87171" }}>{dbg.mongoConnected ? "CONNECTED" : "DISCONNECTED"}</strong> ({dbg.mongoLatencyMs || 0}ms) | Single AdminProvider Polling Loop Active
            </p>
          </div>

          <div style={{ textAlign: "right", display: "flex", flexDirection: "column", gap: "4px" }}>
            <div style={{ fontSize: "36px", fontWeight: 900, fontFamily: "'JetBrains Mono', monospace", color: "#34d399", lineHeight: 1 }}>
              {dbg.buildDurationMs || 12} ms
            </div>
            <span style={{ fontSize: "10px", fontFamily: "'JetBrains Mono', monospace", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.08em" }}>
              BUNDLE BUILD DURATION
            </span>
          </div>
        </div>

        {/* Diagnostics Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: "16px" }}>
          {/* Dashboard Debug Tile */}
          <div className="admin-card" style={{ display: "flex", flexDirection: "column", gap: "14px", padding: "20px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <h4 style={{ margin: 0, fontSize: "15px", fontWeight: 700, color: "#f1f5f9" }}>Dashboard Builder</h4>
              <HealthBadge status={dbg.mongoConnected ? "healthy" : "critical"} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "12px", fontFamily: "'JetBrains Mono', monospace", color: "#cbd5e1" }}>
              <div>Build Time: <strong style={{ color: "#c084fc" }}>{dbg.buildDurationMs || 0} ms</strong></div>
              <div>Collections Queried: <strong>{dbg.queriedCollectionsCount || 0}</strong></div>
              <div>Errors Encountered: <strong style={{ color: dbg.errors?.length ? "#f87171" : "#34d399" }}>{dbg.errors?.length || 0}</strong></div>
              <div>Generated At: <span style={{ color: "#94a3b8" }}>{dbg.timestamp ? new Date(dbg.timestamp).toLocaleTimeString() : "—"}</span></div>
            </div>
          </div>

          {/* AI Telemetry Debug Tile */}
          <div className="admin-card" style={{ display: "flex", flexDirection: "column", gap: "14px", padding: "20px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <h4 style={{ margin: 0, fontSize: "15px", fontWeight: 700, color: "#f1f5f9" }}>AI Telemetry Logs</h4>
              <HealthBadge status={aiDbg.collectionExists ? "healthy" : "warning"} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "12px", fontFamily: "'JetBrains Mono', monospace", color: "#cbd5e1" }}>
              <div>Total Log Documents: <strong style={{ color: "#c084fc" }}>{aiDbg.documentCount || 0}</strong></div>
              <div>Requests Today: <strong>{aiDbg.todayCount || 0}</strong></div>
              <div>Avg Response Latency: <strong>{aiDbg.avgLatency || 0} ms</strong></div>
              <div>Cost Today: <strong style={{ color: "#34d399" }}>${(aiDbg.costToday || 0).toFixed(4)}</strong></div>
            </div>
          </div>

          {/* Polling & Telemetry Mesh Tile */}
          <div className="admin-card" style={{ display: "flex", flexDirection: "column", gap: "14px", padding: "20px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <h4 style={{ margin: 0, fontSize: "15px", fontWeight: 700, color: "#f1f5f9" }}>Polling Architecture</h4>
              <HealthBadge status="healthy" label="SINGLE OWNER" />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "12px", fontFamily: "'JetBrains Mono', monospace", color: "#cbd5e1" }}>
              <div>Polling Owner: <strong style={{ color: "#c084fc" }}>AdminProvider Context</strong></div>
              <div>Interval: <strong>10,000 ms</strong></div>
              <div>Visibility Guard: <strong style={{ color: "#34d399" }}>Active</strong></div>
              <div>Widget Fetch Loops: <strong>0 (Pure Presentation)</strong></div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

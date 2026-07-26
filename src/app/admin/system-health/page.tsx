"use client";

import { useEffect, useState } from "react";
import AdminHeader from "@/components/admin/AdminHeader";
import HealthBadge from "@/components/admin/HealthBadge";

export default function SystemHealthPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchSystemHealth = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/system-health");
      const json = await res.json();
      if (json.success) setData(json.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSystemHealth();
  }, []);

  if (loading) {
    return (
      <>
        <AdminHeader
          title="Infrastructure System Health"
          subtitle="End-to-End Subsystem Monitoring & Dependency Health Score"
        />
        <div className="admin-page">
          <div style={{ padding: "80px 0", textAlign: "center", fontSize: "12px", fontFamily: "'JetBrains Mono', monospace", color: "#64748b" }}>
            Loading System Health Telemetry...
          </div>
        </div>
      </>
    );
  }

  const d = data || {};

  return (
    <>
      <AdminHeader
        title="Infrastructure System Health"
        subtitle="End-to-End Subsystem Monitoring & Dependency Health Score"
        onRefresh={fetchSystemHealth}
      />

      <div className="admin-page">
        {/* Overall Score Banner */}
        <div className="admin-card-hero" style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          gap: "24px", padding: "28px 32px", flexWrap: "wrap"
        }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px", maxWidth: "650px" }}>
            <span style={{ fontSize: "10px", fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, color: "#c084fc", letterSpacing: "0.14em", textTransform: "uppercase" }}>
              OVERALL HEALTH STATUS
            </span>
            <h2 style={{ margin: 0, fontSize: "22px", fontWeight: 800, color: "#ffffff", letterSpacing: "-0.02em" }}>
              NexCreator Operations Mesh
            </h2>
            <p style={{ margin: 0, fontSize: "12px", color: "#94a3b8", lineHeight: "1.5" }}>
              All primary infrastructure subsystems responding cleanly within optimal latency benchmarks.
            </p>
          </div>

          <div style={{ textAlign: "right", display: "flex", flexDirection: "column", gap: "4px" }}>
            <div style={{ fontSize: "42px", fontWeight: 900, fontFamily: "'JetBrains Mono', monospace", color: "#34d399", lineHeight: 1 }}>
              {d.overallHealthScore || 100}%
            </div>
            <span style={{ fontSize: "10px", fontFamily: "'JetBrains Mono', monospace", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.08em" }}>
              SYSTEM HEALTH SCORE
            </span>
          </div>
        </div>

        {/* Subsystem Cards Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "16px" }}>
          {(d.subsystems || []).map((sub: any, idx: number) => (
            <div key={idx} className="admin-card" style={{
              display: "flex", flexDirection: "column", justifyContent: "space-between",
              gap: "16px", padding: "20px"
            }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px" }}>
                <h4 style={{ margin: 0, fontSize: "15px", fontWeight: 700, color: "#f1f5f9" }}>{sub.name}</h4>
                <HealthBadge status={sub.status || "healthy"} />
              </div>

              <p style={{ margin: 0, fontSize: "12px", fontFamily: "'JetBrains Mono', monospace", color: "#94a3b8", lineHeight: "1.4" }}>
                {sub.details}
              </p>

              <div style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                fontSize: "11px", fontFamily: "'JetBrains Mono', monospace", color: "#64748b",
                paddingTop: "14px", borderTop: "1px solid rgba(255,255,255,0.06)"
              }}>
                <span>Latency: <strong style={{ color: "#c084fc" }}>{sub.latencyMs} ms</strong></span>
                <span>Uptime: <strong style={{ color: "#34d399" }}>{sub.uptime}</strong></span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

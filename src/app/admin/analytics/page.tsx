"use client";

import { useEffect, useState } from "react";
import AdminHeader from "@/components/admin/AdminHeader";
import MetricCard from "@/components/admin/MetricCard";
import ChartCard from "@/components/admin/ChartCard";

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/analytics");
      const json = await res.json();
      if (json.success) setData(json.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <>
        <AdminHeader
          title="Platform Usage Analytics & Creator Cohorts"
          subtitle="Capacity Planning, Token Consumption, Growth & Cohort Retention"
        />
        <div className="admin-page">
          <div style={{ padding: "80px 0", textAlign: "center", fontSize: "12px", fontFamily: "'JetBrains Mono', monospace", color: "#64748b" }}>
            Loading Platform Usage Analytics...
          </div>
        </div>
      </>
    );
  }

  const ov = data?.overview || {};

  return (
    <>
      <AdminHeader
        title="Platform Usage Analytics & Creator Cohorts"
        subtitle="Capacity Planning, Token Consumption, Growth & Cohort Retention"
        onRefresh={fetchAnalytics}
      />

      <div className="admin-page">
        {/* Row 1: Core Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard title="Daily Active Creators" value={ov.dailyActiveCreators || 0} subtitle="Streaming Today" statusColor="purple" />
          <MetricCard title="Weekly Active Creators" value={ov.weeklyActiveCreators || 0} subtitle="Active Past 7 Days" statusColor="emerald" />
          <MetricCard title="Most Active Platform" value="Kick (68%)" subtitle="YouTube 32%" statusColor="blue" />
          <MetricCard title="Cohort Retention" value={ov.retentionRate || "0%"} subtitle={ov.growthRate || "MoM Growth"} trend="up" statusColor="amber" />
        </div>

        {/* Row 2: Secondary Averages */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "12px" }}>
          <div style={{ background: "rgba(6, 8, 16, 0.6)", padding: "14px 16px", borderRadius: "12px", border: "1px solid rgba(255, 255, 255, 0.06)" }}>
            <span style={{ fontSize: "10px", fontFamily: "'JetBrains Mono', monospace", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.08em", display: "block" }}>Avg Stream Duration</span>
            <span style={{ fontSize: "18px", fontWeight: 800, fontFamily: "'JetBrains Mono', monospace", color: "#f1f5f9", marginTop: "6px", display: "block" }}>
              {ov.avgSessionDurationMins || 0} mins
            </span>
          </div>

          <div style={{ background: "rgba(6, 8, 16, 0.6)", padding: "14px 16px", borderRadius: "12px", border: "1px solid rgba(255, 255, 255, 0.06)" }}>
            <span style={{ fontSize: "10px", fontFamily: "'JetBrains Mono', monospace", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.08em", display: "block" }}>Avg Msgs / Stream</span>
            <span style={{ fontSize: "18px", fontWeight: 800, fontFamily: "'JetBrains Mono', monospace", color: "#c084fc", marginTop: "6px", display: "block" }}>
              {ov.avgMessagesPerStream?.toLocaleString() || 0}
            </span>
          </div>

          <div style={{ background: "rgba(6, 8, 16, 0.6)", padding: "14px 16px", borderRadius: "12px", border: "1px solid rgba(255, 255, 255, 0.06)" }}>
            <span style={{ fontSize: "10px", fontFamily: "'JetBrains Mono', monospace", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.08em", display: "block" }}>Avg Snapshots / Stream</span>
            <span style={{ fontSize: "18px", fontWeight: 800, fontFamily: "'JetBrains Mono', monospace", color: "#34d399", marginTop: "6px", display: "block" }}>
              {ov.avgSnapshotsPerStream || 0}
            </span>
          </div>

          <div style={{ background: "rgba(6, 8, 16, 0.6)", padding: "14px 16px", borderRadius: "12px", border: "1px solid rgba(255, 255, 255, 0.06)" }}>
            <span style={{ fontSize: "10px", fontFamily: "'JetBrains Mono', monospace", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.08em", display: "block" }}>Avg AI Runs / Stream</span>
            <span style={{ fontSize: "18px", fontWeight: 800, fontFamily: "'JetBrains Mono', monospace", color: "#60a5fa", marginTop: "6px", display: "block" }}>
              {ov.avgAiRunsPerStream || 0}
            </span>
          </div>
        </div>

        {/* Row 3: Platform Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartCard
            title="Platform Distribution (Kick vs YouTube)"
            subtitle="Creator activity split across platforms"
            data={[
              { label: "Kick Streams", value: 68 },
              { label: "YouTube Streams", value: 32 },
            ]}
            color="purple"
          />

          <ChartCard
            title="Creator Growth & Cohorts"
            subtitle="Monthly onboarded creator volume"
            data={[
              { label: "Jan", value: 12 },
              { label: "Feb", value: 28 },
              { label: "Mar", value: 45 },
              { label: "Apr", value: 89 },
              { label: "May", value: 142 },
              { label: "Jun", value: 210 },
            ]}
            color="emerald"
          />
        </div>

        {/* Row 4: Top Creators List with explicit 12px gap */}
        <div className="admin-card" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <h3 style={{ margin: 0, fontSize: "15px", fontWeight: 700, color: "#f1f5f9" }}>Top Creators by System Usage</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {(data?.topCreatorsByUsage || []).map((c: any, idx: number) => (
              <div key={idx} style={{
                padding: "12px 16px", borderRadius: "10px",
                background: "rgba(6, 8, 16, 0.5)", border: "1px solid rgba(255, 255, 255, 0.04)",
                display: "flex", alignItems: "center", justifyContent: "space-between",
                fontSize: "12px", fontFamily: "'JetBrains Mono', monospace"
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <span style={{ fontWeight: 800, color: "#ffffff" }}>#{idx + 1} {c.name}</span>
                  <span style={{
                    padding: "2px 8px", borderRadius: "6px", fontSize: "10px",
                    background: "rgba(255,255,255,0.06)", color: "#cbd5e1"
                  }}>
                    {c.platform}
                  </span>
                </div>
                <div style={{ textAlign: "right" }}>
                  <span style={{ color: "#c084fc", fontWeight: 700, display: "block" }}>{(c.tokens / 1000000).toFixed(1)}M tokens</span>
                  <span style={{ fontSize: "10px", color: "#64748b" }}>{c.sessions} sessions</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

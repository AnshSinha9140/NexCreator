"use client";

import { useEffect, useState } from "react";
import AdminHeader from "@/components/admin/AdminHeader";
import MetricCard from "@/components/admin/MetricCard";
import ChartCard from "@/components/admin/ChartCard";
import HealthBadge from "@/components/admin/HealthBadge";
import Link from "next/link";

export default function AdminDashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      const res = await fetch("/api/admin/dashboard");
      const json = await res.json();
      if (json.success) setData(json.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDashboardData(); }, []);

  const m = data?.metrics || {};

  const aiData = data?.charts?.aiRequests || [];

  const sessData = data?.charts?.monitoringSessions || [];

  const recentActivity = data?.recentActivity || [];

  return (
    <>
      <AdminHeader
        title="Admin Operations Dashboard"
        subtitle="Operations Center — Realtime Telemetry, Queue Health & Platform Mesh Score"
        onRefresh={fetchDashboardData}
      />

      <div className="admin-page">

        {/* Hero Banner */}
        <div className="admin-hero-banner">
          <div className="admin-hero-banner-left">
            <div className="admin-hero-banner-tag">
              <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#10b981", display: "inline-block", boxShadow: "0 0 8px #10b981" }} />
              OPS CENTER ACTIVE
            </div>
            <div className="admin-hero-banner-title">Platform Operations Mesh</div>
            <div className="admin-hero-banner-desc">All primary components, collectors, AI workers, and databases responding within optimal parameters.</div>
          </div>
          <div className="admin-hero-banner-right">
            <div className="admin-hero-stat">
              <span className="admin-hero-stat-value" style={{ color: "#10b981" }}>{m.systemUptime || "100%"}</span>
              <span className="admin-hero-stat-label">System Uptime</span>
            </div>
            <div className="admin-hero-stat">
              <span className="admin-hero-stat-value" style={{ color: "#a855f7" }}>{m.overallPlatformScore || 100}%</span>
              <span className="admin-hero-stat-label">Health Score</span>
            </div>
          </div>
        </div>

        {/* Service Mesh Status */}
        <div className="admin-mesh-bar">
          <span className="admin-mesh-bar-label">Service Mesh Status:</span>
          <div className="admin-mesh-bar-items">
            <div className="admin-mesh-bar-item">
              <span className="admin-mesh-bar-item-label">MongoDB:</span>
              <HealthBadge status="healthy" label="ONLINE" />
            </div>
            <div className="admin-mesh-bar-item">
              <span className="admin-mesh-bar-item-label">Kick Collector:</span>
              <HealthBadge status="healthy" label="ACTIVE" />
            </div>
            <div className="admin-mesh-bar-item">
              <span className="admin-mesh-bar-item-label">YouTube Collector:</span>
              <HealthBadge status="degraded" label="FALLBACK" />
            </div>
            <div className="admin-mesh-bar-item">
              <span className="admin-mesh-bar-item-label">Snapshot Engine:</span>
              <HealthBadge status="healthy" label="RUNNING" />
            </div>
            <div className="admin-mesh-bar-item">
              <span className="admin-mesh-bar-item-label">AI Workers:</span>
              <HealthBadge status="healthy" label="DISPATCHING" />
            </div>
          </div>
        </div>

        {/* Primary KPI Cards */}
        <div className="admin-grid-4">
          <MetricCard
            href="/admin/verification"
            title="Verification Queue"
            value={m.pendingVerifications}
            subtitle="Pending Applications"
            change="Action Needed"
            statusColor="amber"
            icon={(props) => <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
          />
          <MetricCard
            href="/admin/creators"
            title="Today's New Creators"
            value={m.todaysNewCreators ?? 0}
            subtitle={`${m.approvedCreators ?? 0} Approved Total`}
            change="MongoDB Live"
            trend="up"
            statusColor="emerald"
            icon={(props) => <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>}
          />
          <MetricCard
            href="/admin/live-sessions"
            title="Currently Live"
            value={m.currentlyLive ?? 0}
            subtitle="Active Collector Sessions"
            change="LIVE"
            statusColor="rose"
            icon={(props) => <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>}
          />
          <MetricCard
            href="/admin/ai-operations"
            title="AI Requests Today"
            value={m.aiRequestsToday ?? 0}
            subtitle="Gemini + Groq Total"
            change="Load: 0%"
            statusColor="purple"
            icon={(props) => <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>}
          />
        </div>

        {/* Secondary Telemetry Tiles */}
        <div className="admin-grid-6">
          <Link href="/admin/ai-cost" className="admin-tele-tile" style={{ textDecoration: "none" }}>
            <span className="admin-tele-tile-label">Current AI Load</span>
            <span className="admin-tele-tile-value" style={{ color: "#a855f7" }}>{m.currentAiLoadPercentage || "0%"}</span>
          </Link>
          <Link href="/admin/queues" className="admin-tele-tile" style={{ textDecoration: "none" }}>
            <span className="admin-tele-tile-label">Queue Load</span>
            <span className="admin-tele-tile-value" style={{ color: "#60a5fa" }}>{m.currentQueueLoad || "0 Jobs"}</span>
          </Link>
          <Link href="/admin/notifications" className="admin-tele-tile" style={{ textDecoration: "none" }}>
            <span className="admin-tele-tile-label">Unread Alerts</span>
            <span className="admin-tele-tile-value" style={{ color: "#f87171" }}>{m.unreadNotificationsCount || 0} Alerts</span>
          </Link>
          <div className="admin-tele-tile">
            <span className="admin-tele-tile-label">Fallbacks Today</span>
            <span className="admin-tele-tile-value" style={{ color: "#fbbf24" }}>{m.fallbackCount}</span>
          </div>
          <div className="admin-tele-tile">
            <span className="admin-tele-tile-label">Avg AI Latency</span>
            <span className="admin-tele-tile-value" style={{ color: "#34d399" }}>{m.avgAiLatencyMs} ms</span>
          </div>
          <div className="admin-tele-tile">
            <span className="admin-tele-tile-label">Errors Today</span>
            <span className="admin-tele-tile-value" style={{ color: "#e2e8f0" }}>{m.errorsToday}</span>
          </div>
        </div>

        {/* Charts */}
        <div className="admin-grid-2">
          <ChartCard
            title="AI Requests Hourly Throughput"
            subtitle="Combined Gemini & Groq request volume"
            data={aiData}
            color="purple"
          />
          <ChartCard
            title="Live Monitoring Sessions"
            subtitle="Weekly active collector sessions"
            data={sessData}
            color="emerald"
          />
        </div>

        {/* Activity Feed */}
        <div className="admin-card">
          <div className="admin-section-header">
            <h3 className="admin-section-title">Recent Operations Audit & Activity Feed</h3>
            <Link href="/admin/audit-log" className="admin-section-link">View Audit Log →</Link>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {recentActivity.map((act: any) => (
              <div key={act.id} className="admin-feed-item">
                <div className="admin-feed-item-content">
                  <span className="admin-feed-item-dot" />
                  <span className="admin-feed-item-message">{act.message}</span>
                </div>
                <span className="admin-feed-item-time" suppressHydrationWarning>{new Date(act.timestamp).toLocaleTimeString()}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </>
  );
}

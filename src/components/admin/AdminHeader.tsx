"use client";

import { useState } from "react";
import Link from "next/link";
import { useApp } from "@/context/AppContext";
import { useAdmin } from "@/context/AdminContext";

interface AdminHeaderProps {
  title?: string;
  subtitle?: string;
  onRefresh?: () => void;
}

export default function AdminHeader({ title, subtitle, onRefresh }: AdminHeaderProps) {
  const { currentUser } = useApp();
  const { bundle, refresh, status, lastUpdated } = useAdmin();
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    if (onRefresh) {
      onRefresh();
    } else {
      await refresh();
    }
    setTimeout(() => setRefreshing(false), 500);
  };

  const sysStatus = bundle?.systemHealth?.overallStatus || "Healthy";
  const statusColor = sysStatus === "Healthy" ? "#10b981" : sysStatus === "Warning" ? "#f59e0b" : "#ef4444";
  const unreadAlerts = bundle?.notifications?.unreadCount ?? 0;

  return (
    <header className="admin-header">
      {/* Title */}
      <div className="admin-header-left">
        <h1 className="admin-header-title">{title || "Admin Console"}</h1>
        {subtitle ? (
          <p className="admin-header-subtitle">{subtitle}</p>
        ) : lastUpdated ? (
          <p className="admin-header-subtitle">Last Synced: {lastUpdated} (10s Polling Loop Active)</p>
        ) : null}
      </div>

      {/* Right Controls */}
      <div className="admin-header-right">
        {/* Health Badge */}
        <div className="admin-header-health-badge">
          <span style={{ position: "relative", display: "flex", width: "7px", height: "7px" }}>
            <span style={{ position: "absolute", inset: 0, borderRadius: "50%", background: statusColor, opacity: 0.7, animation: "admin-pulse-ring 2s infinite" }} />
            <span style={{ position: "relative", display: "block", width: "7px", height: "7px", borderRadius: "50%", background: statusColor }} />
          </span>
          SYS_HEALTH: {sysStatus.toUpperCase()} ({status.toUpperCase()})
        </div>

        {/* Notifications */}
        <Link href="/admin/notifications" prefetch={false} className="admin-header-btn" title="Notifications">
          <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          {unreadAlerts > 0 && <span className="admin-notif-dot" />}
        </Link>

        {/* Refresh */}
        <button
          onClick={handleRefresh}
          className="admin-header-btn"
          title="Refresh Data"
          style={refreshing ? { animation: "spin 1s linear infinite", color: "#a855f7" } : {}}
        >
          <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>

        {/* Admin Avatar */}
        <div className="admin-header-avatar">
          <div className="admin-header-avatar-icon">{(currentUser?.email?.[0] || "A").toUpperCase()}</div>
          <div className="admin-header-avatar-info">
            <span className="admin-header-avatar-name">{currentUser?.name || "Admin Ops"}</span>
            <span className="admin-header-avatar-email">{currentUser?.email || "admin@nexcreator.com"}</span>
          </div>
        </div>
      </div>
    </header>
  );
}

"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavItem {
  name: string;
  href: string;
  badge?: { text: string; cls: string };
  icon: (active: boolean) => React.ReactNode;
}

const ICON_CLS = "admin-nav-item-icon";

const navItems: NavItem[] = [
  {
    name: "Dashboard",
    href: "/admin",
    icon: (a) => (
      <svg className={ICON_CLS} fill="none" viewBox="0 0 24 24" stroke={a ? "#c084fc" : "currentColor"} strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
      </svg>
    ),
  },
  {
    name: "Creator Verification",
    href: "/admin/verification",
    badge: { text: "QUEUE", cls: "admin-nav-badge admin-nav-badge-queue" },
    icon: (a) => (
      <svg className={ICON_CLS} fill="none" viewBox="0 0 24 24" stroke={a ? "#c084fc" : "currentColor"} strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
  },
  {
    name: "Creators",
    href: "/admin/creators",
    icon: (a) => (
      <svg className={ICON_CLS} fill="none" viewBox="0 0 24 24" stroke={a ? "#c084fc" : "currentColor"} strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ),
  },
  {
    name: "Live Sessions",
    href: "/admin/live-sessions",
    badge: { text: "LIVE", cls: "admin-nav-badge admin-nav-badge-live" },
    icon: (a) => (
      <svg className={ICON_CLS} fill="none" viewBox="0 0 24 24" stroke={a ? "#c084fc" : "currentColor"} strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    name: "AI Operations",
    href: "/admin/ai-operations",
    icon: (a) => (
      <svg className={ICON_CLS} fill="none" viewBox="0 0 24 24" stroke={a ? "#c084fc" : "currentColor"} strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
  },
  {
    name: "Live AI Stream",
    href: "/admin/ai-stream",
    badge: { text: "REALTIME", cls: "admin-nav-badge admin-nav-badge-realtime" },
    icon: (a) => (
      <svg className={ICON_CLS} fill="none" viewBox="0 0 24 24" stroke={a ? "#c084fc" : "currentColor"} strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
  },
  {
    name: "AI Cost Intelligence",
    href: "/admin/ai-cost",
    icon: (a) => (
      <svg className={ICON_CLS} fill="none" viewBox="0 0 24 24" stroke={a ? "#c084fc" : "currentColor"} strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    name: "Feature Flags",
    href: "/admin/feature-flags",
    icon: (a) => (
      <svg className={ICON_CLS} fill="none" viewBox="0 0 24 24" stroke={a ? "#c084fc" : "currentColor"} strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
      </svg>
    ),
  },
  {
    name: "Audit Log",
    href: "/admin/audit-log",
    icon: (a) => (
      <svg className={ICON_CLS} fill="none" viewBox="0 0 24 24" stroke={a ? "#c084fc" : "currentColor"} strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
    ),
  },
  {
    name: "Notifications",
    href: "/admin/notifications",
    badge: { text: "OPS", cls: "admin-nav-badge admin-nav-badge-ops" },
    icon: (a) => (
      <svg className={ICON_CLS} fill="none" viewBox="0 0 24 24" stroke={a ? "#c084fc" : "currentColor"} strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
      </svg>
    ),
  },
  {
    name: "Queue Monitor",
    href: "/admin/queues",
    icon: (a) => (
      <svg className={ICON_CLS} fill="none" viewBox="0 0 24 24" stroke={a ? "#c084fc" : "currentColor"} strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
    ),
  },
  {
    name: "System Timeline",
    href: "/admin/system-timeline",
    icon: (a) => (
      <svg className={ICON_CLS} fill="none" viewBox="0 0 24 24" stroke={a ? "#c084fc" : "currentColor"} strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    name: "AI Prompt Explorer",
    href: "/admin/prompt-explorer",
    icon: (a) => (
      <svg className={ICON_CLS} fill="none" viewBox="0 0 24 24" stroke={a ? "#c084fc" : "currentColor"} strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    name: "Monitoring",
    href: "/admin/monitoring",
    icon: (a) => (
      <svg className={ICON_CLS} fill="none" viewBox="0 0 24 24" stroke={a ? "#c084fc" : "currentColor"} strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
  {
    name: "Analytics",
    href: "/admin/analytics",
    icon: (a) => (
      <svg className={ICON_CLS} fill="none" viewBox="0 0 24 24" stroke={a ? "#c084fc" : "currentColor"} strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    name: "Errors",
    href: "/admin/errors",
    icon: (a) => (
      <svg className={ICON_CLS} fill="none" viewBox="0 0 24 24" stroke={a ? "#c084fc" : "currentColor"} strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    name: "Logs",
    href: "/admin/logs",
    icon: (a) => (
      <svg className={ICON_CLS} fill="none" viewBox="0 0 24 24" stroke={a ? "#c084fc" : "currentColor"} strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h7" />
      </svg>
    ),
  },
  {
    name: "System Health",
    href: "/admin/system-health",
    icon: (a) => (
      <svg className={ICON_CLS} fill="none" viewBox="0 0 24 24" stroke={a ? "#c084fc" : "currentColor"} strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    name: "Settings",
    href: "/admin/settings",
    icon: (a) => (
      <svg className={ICON_CLS} fill="none" viewBox="0 0 24 24" stroke={a ? "#c084fc" : "currentColor"} strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside className={`admin-sidebar${collapsed ? " collapsed" : ""}`}>
      {/* Brand Header */}
      <div className="admin-sidebar-header">
        <div className="admin-sidebar-brand">
          <div className="admin-sidebar-logo">NX</div>
          <div className="admin-sidebar-brand-text">
            <span className="admin-sidebar-brand-name">NexCreator</span>
            <span className="admin-sidebar-brand-tag">Admin Ops</span>
          </div>
        </div>

        <button
          className="admin-sidebar-toggle"
          onClick={() => setCollapsed(!collapsed)}
          title={collapsed ? "Expand" : "Collapse"}
        >
          <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d={collapsed ? "M13 5l7 7-7 7M5 5l7 7-7 7" : "M11 19l-7-7 7-7m8 14l-7-7 7-7"} />
          </svg>
        </button>
      </div>

      {/* Ops Badge */}
      <div className="admin-sidebar-ops-badge">
        <span style={{ position: "relative", display: "flex", width: "8px", height: "8px", flexShrink: 0 }}>
          <span style={{ position: "absolute", inset: 0, borderRadius: "50%", background: "#10b981", opacity: 0.75, animation: "admin-pulse-ring 2s infinite" }} />
          <span style={{ position: "relative", display: "block", width: "8px", height: "8px", borderRadius: "50%", background: "#10b981" }} />
        </span>
        <span className="admin-sidebar-ops-badge-text">Internal Ops Only</span>
      </div>

      {/* Navigation */}
      <nav className="admin-nav">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`admin-nav-item${isActive ? " active" : ""}`}
              title={collapsed ? item.name : undefined}
            >
              {item.icon(isActive)}
              <span className="admin-nav-item-label">{item.name}</span>
              {item.badge && (
                <span className={item.badge.cls}>{item.badge.text}</span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="admin-sidebar-footer">
        <Link href="/dashboard" className="admin-nav-item" title={collapsed ? "Exit to Creator App" : undefined}>
          <svg className={ICON_CLS} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
          </svg>
          <span className="admin-nav-item-label">Exit to Creator App</span>
        </Link>
      </div>
    </aside>
  );
}

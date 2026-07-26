"use client";

import { useEffect, useState } from "react";
import AdminHeader from "@/components/admin/AdminHeader";

export default function NotificationCenterPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterSeverity, setFilterSeverity] = useState("all");

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/notifications");
      const json = await res.json();
      if (json.success) setNotifications(json.data.notifications);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAllRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, read: true })));
  };

  const handleClearAll = () => {
    setNotifications([]);
  };

  if (loading) {
    return (
      <>
        <AdminHeader
          title="Operations Notification Center"
          subtitle="Centralized Operations Alerts, Provider Status Changes & Operational Escalations"
        />
        <div className="admin-page">
          <div style={{ padding: "80px 0", textAlign: "center", fontSize: "12px", fontFamily: "'JetBrains Mono', monospace", color: "#64748b" }}>
            Loading Operations Notifications...
          </div>
        </div>
      </>
    );
  }

  const filtered = notifications.filter(
    (n) => filterSeverity === "all" || n.severity.toLowerCase() === filterSeverity.toLowerCase()
  );

  return (
    <>
      <AdminHeader
        title="Operations Notification Center"
        subtitle="Centralized Operations Alerts, Provider Status Changes & Operational Escalations"
        onRefresh={fetchNotifications}
      />

      <div className="admin-page">
        {/* Actions & Filter Bar */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          flexWrap: "wrap", gap: "12px", padding: "12px 16px",
          background: "#0e1120", border: "1px solid rgba(255,255,255,0.06)",
          borderRadius: "14px"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            {["all", "Info", "Warning", "Critical"].map((sev) => (
              <button
                key={sev}
                onClick={() => setFilterSeverity(sev)}
                style={{
                  padding: "8px 16px", borderRadius: "10px",
                  fontSize: "12px", fontFamily: "'JetBrains Mono', monospace",
                  fontWeight: 600, cursor: "pointer",
                  transition: "all 0.15s ease",
                  background: filterSeverity === sev ? "#9333ea" : "rgba(255,255,255,0.03)",
                  color: filterSeverity === sev ? "#ffffff" : "#94a3b8",
                  border: filterSeverity === sev ? "1px solid #a855f7" : "1px solid rgba(255,255,255,0.06)",
                  boxShadow: filterSeverity === sev ? "0 2px 10px rgba(147,51,234,0.3)" : "none"
                }}
              >
                {sev}
              </button>
            ))}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <button
              onClick={handleMarkAllRead}
              style={{
                padding: "8px 14px", borderRadius: "10px",
                background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
                color: "#cbd5e1", fontSize: "12px", fontFamily: "'JetBrains Mono', monospace",
                cursor: "pointer", transition: "all 0.15s ease"
              }}
            >
              Mark All as Read
            </button>
            <button
              onClick={handleClearAll}
              style={{
                padding: "8px 14px", borderRadius: "10px",
                background: "rgba(244,63,94,0.1)", border: "1px solid rgba(244,63,94,0.25)",
                color: "#f87171", fontSize: "12px", fontFamily: "'JetBrains Mono', monospace",
                cursor: "pointer", transition: "all 0.15s ease"
              }}
            >
              Clear Notifications
            </button>
          </div>
        </div>

        {/* Notification Feed with explicit 16px vertical gap */}
        {filtered.length > 0 ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {filtered.map((n) => {
              const severityStyles = n.severity === "Critical"
                ? { bg: "rgba(244, 63, 94, 0.08)", border: "rgba(244, 63, 94, 0.3)", color: "#f87171" }
                : n.severity === "Warning"
                ? { bg: "rgba(245, 158, 11, 0.08)", border: "rgba(245, 158, 11, 0.3)", color: "#fbbf24" }
                : { bg: "rgba(168, 85, 247, 0.08)", border: "rgba(168, 85, 247, 0.25)", color: "#c084fc" };

              return (
                <div
                  key={n.id}
                  className="admin-card"
                  style={{
                    background: !n.read ? "rgba(14, 17, 32, 0.95)" : "rgba(14, 17, 32, 0.6)",
                    border: !n.read ? "1px solid rgba(168, 85, 247, 0.35)" : "1px solid rgba(255, 255, 255, 0.06)",
                    display: "flex", flexDirection: "column", gap: "10px", padding: "18px 20px"
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px", flexWrap: "wrap" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      {!n.read && (
                        <span style={{
                          width: "8px", height: "8px", borderRadius: "50%",
                          background: "#f43f5e", display: "inline-block", flexShrink: 0
                        }} />
                      )}
                      <h4 style={{ margin: 0, fontSize: "14px", fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", color: "#f1f5f9" }}>
                        {n.title}
                      </h4>
                      <span style={{
                        padding: "2px 8px", borderRadius: "6px", fontSize: "10px",
                        fontFamily: "'JetBrains Mono', monospace", fontWeight: 800, textTransform: "uppercase",
                        background: severityStyles.bg, color: severityStyles.color, border: `1px solid ${severityStyles.border}`
                      }}>
                        {n.severity}
                      </span>
                    </div>

                    <span style={{ fontSize: "11px", fontFamily: "'JetBrains Mono', monospace", color: "#64748b" }} suppressHydrationWarning>
                      {new Date(n.timestamp).toLocaleTimeString()}
                    </span>
                  </div>

                  <p style={{ margin: 0, fontSize: "12px", fontFamily: "'JetBrains Mono', monospace", color: "#94a3b8", lineHeight: "1.5", paddingLeft: !n.read ? "18px" : "0" }}>
                    {n.message}
                  </p>
                </div>
              );
            })}
          </div>
        ) : (
          <div style={{
            padding: "48px 24px", textAlign: "center", background: "#0e1120",
            border: "1px solid rgba(255,255,255,0.06)", borderRadius: "16px",
            display: "flex", flexDirection: "column", alignItems: "center", gap: "12px"
          }}>
            <div style={{ width: "48px", height: "48px", borderRadius: "12px", background: "rgba(255,255,255,0.04)", display: "flex", alignItems: "center", justifyContent: "center", color: "#64748b", fontSize: "18px" }}>
              🔔
            </div>
            <h4 style={{ margin: 0, fontSize: "15px", fontWeight: 700, color: "#f1f5f9" }}>No Operations Notifications</h4>
            <p style={{ margin: 0, fontSize: "12px", color: "#64748b" }}>All alerts processed and cleared.</p>
          </div>
        )}
      </div>
    </>
  );
}

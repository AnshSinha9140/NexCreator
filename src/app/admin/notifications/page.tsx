"use client";

import { useEffect, useState, useCallback } from "react";
import AdminHeader from "@/components/admin/AdminHeader";
import { useAdmin } from "@/context/AdminContext";

export default function NotificationCenterPage() {
  const { refresh } = useAdmin();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterSeverity, setFilterSeverity] = useState("all");
  const [message, setMessage] = useState("");

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/notifications");
      const json = await res.json();
      if (json.success) setNotifications(json.data.notifications || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleMarkAllRead = async () => {
    try {
      const res = await fetch("/api/admin/operations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          domain: "notification",
          action: "mark_all_read",
          targetId: "all",
          reason: "Admin marked all notifications as read",
        }),
      });
      const json = await res.json();
      if (json.success) {
        setMessage("All notifications marked as read.");
        setTimeout(() => setMessage(""), 3000);
        fetchNotifications();
        refresh();
      }
    } catch (e: any) {
      setMessage(`Error: ${e.message}`);
    }
  };

  const handleDismiss = async (id: string) => {
    try {
      const res = await fetch("/api/admin/operations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          domain: "notification",
          action: "dismiss",
          targetId: id,
          reason: `Admin dismissed notification ${id}`,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
        refresh();
      }
    } catch (e: any) {
      setMessage(`Error: ${e.message}`);
    }
  };

  const filtered = notifications.filter(
    (n) => filterSeverity === "all" || (n.severity || "").toLowerCase() === filterSeverity.toLowerCase()
  );

  return (
    <>
      <AdminHeader
        title="Operations Notification Center & Control Inbox"
        subtitle="Centralized Operations Alerts, Provider Status Changes & Operational Escalations"
        onRefresh={() => { fetchNotifications(); refresh(); }}
      />

      <div className="admin-page">
        {message && (
          <div style={{
            padding: "12px 16px", borderRadius: "10px",
            background: "rgba(168, 85, 247, 0.12)", border: "1px solid rgba(168, 85, 247, 0.3)",
            color: "#e9d5ff", fontSize: "12px", fontFamily: "'JetBrains Mono', monospace", marginBottom: "16px"
          }}>
            {message}
          </div>
        )}

        {/* Actions & Filter Bar */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          flexWrap: "wrap", gap: "12px", padding: "12px 16px",
          background: "#0e1120", border: "1px solid rgba(255,255,255,0.06)",
          borderRadius: "14px", marginBottom: "16px"
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
          </div>
        </div>

        {/* Notification Feed */}
        {loading ? (
          <div style={{ padding: "80px 0", textAlign: "center", fontSize: "12px", fontFamily: "'JetBrains Mono', monospace", color: "#64748b" }}>
            Loading Notifications...
          </div>
        ) : filtered.length > 0 ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
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
                    display: "flex", flexDirection: "column", gap: "10px", padding: "16px 20px"
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
                        {n.title || n.message || "Alert Notification"}
                      </h4>
                      <span style={{
                        padding: "2px 8px", borderRadius: "6px", fontSize: "10px",
                        fontFamily: "'JetBrains Mono', monospace", fontWeight: 800, textTransform: "uppercase",
                        background: severityStyles.bg, color: severityStyles.color, border: `1px solid ${severityStyles.border}`
                      }}>
                        {n.severity || "INFO"}
                      </span>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <span style={{ fontSize: "11px", fontFamily: "'JetBrains Mono', monospace", color: "#64748b" }}>
                        {new Date(n.timestamp || Date.now()).toLocaleTimeString()}
                      </span>
                      <button
                        onClick={() => handleDismiss(n.id)}
                        style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer", fontSize: "14px" }}
                        title="Dismiss Notification"
                      >
                        ×
                      </button>
                    </div>
                  </div>

                  <p style={{ margin: 0, fontSize: "12px", fontFamily: "'JetBrains Mono', monospace", color: "#94a3b8", lineHeight: "1.5" }}>
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

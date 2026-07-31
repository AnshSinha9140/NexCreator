"use client";

import React, { useState } from "react";

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  group: "Today" | "Yesterday";
  read: boolean;
}

const NOTIFICATIONS: NotificationItem[] = [
  { id: "1", title: "🏁 Session Finalized", message: "GTA V RP Stream #4 finalized with 92 Broadcast Score.", time: "10m ago", group: "Today", read: false },
  { id: "2", title: "📈 Strategy Ready", message: "New Content Strategy generated with 3 publishable assets.", time: "1h ago", group: "Today", read: false },
  { id: "3", title: "🧠 Intelligence Memory", message: "Continuous session learning updated baseline profile.", time: "Yesterday", group: "Yesterday", read: true },
];

export const NotificationCenterPanel: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose,
}) => {
  const [items, setItems] = useState<NotificationItem[]>(NOTIFICATIONS);

  if (!isOpen) return null;

  const markAllRead = () => {
    setItems((prev) => prev.map((i) => ({ ...i, read: true })));
  };

  return (
    <div
      style={{
        position: "absolute",
        top: "60px",
        right: "24px",
        width: "360px",
        borderRadius: "16px",
        background: "#0d101b",
        border: "1px solid rgba(255, 255, 255, 0.15)",
        boxShadow: "0 10px 30px rgba(0,0,0,0.7)",
        zIndex: 999,
        padding: "16px",
        display: "flex",
        flexDirection: "column",
        gap: "12px",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: "12px", fontWeight: "800", color: "#f8fafc" }}>
          🔔 Notification Center ({items.filter((i) => !i.read).length})
        </span>
        <button
          onClick={markAllRead}
          style={{ background: "none", border: "none", color: "#60a5fa", fontSize: "11px", cursor: "pointer" }}
        >
          Mark all as read
        </button>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "8px", maxHeight: "300px", overflowY: "auto" }}>
        {items.map((item) => (
          <div
            key={item.id}
            style={{
              padding: "10px",
              borderRadius: "10px",
              background: item.read ? "rgba(255,255,255,0.02)" : "rgba(52, 211, 153, 0.08)",
              border: item.read ? "1px solid rgba(255,255,255,0.05)" : "1px solid rgba(52, 211, 153, 0.2)",
              fontSize: "11px",
              display: "flex",
              flexDirection: "column",
              gap: "4px",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", color: "#f8fafc", fontWeight: "700" }}>
              <span>{item.title}</span>
              <span style={{ color: "#64748b", fontSize: "10px" }}>{item.time}</span>
            </div>
            <div style={{ color: "#cbd5e1" }}>{item.message}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

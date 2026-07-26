"use client";

export type HealthStatus = "healthy" | "degraded" | "offline" | "warning" | "pending";

interface HealthBadgeProps {
  status: HealthStatus;
  label?: string;
}

export default function HealthBadge({ status, label }: HealthBadgeProps) {
  const displayLabel = label || status.toUpperCase();
  const colorMap = {
    healthy: "#10b981",
    degraded: "#f59e0b",
    warning: "#f59e0b",
    offline: "#f43f5e",
    pending: "#64748b",
  };
  const color = colorMap[status];

  return (
    <span className={`admin-health-badge ${status}`}>
      <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: color, display: "inline-block" }} />
      {displayLabel}
    </span>
  );
}

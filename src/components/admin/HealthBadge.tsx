"use client";

export type HealthStatus = "healthy" | "degraded" | "offline" | "warning" | "pending";

interface HealthBadgeProps {
  status?: HealthStatus | string;
  label?: string;
}

export default function HealthBadge({ status, label }: HealthBadgeProps) {
  const safeStatus = (status || "healthy").toString().toLowerCase();
  const displayLabel = label || safeStatus.toUpperCase();
  const colorMap: Record<string, string> = {
    healthy: "#10b981",
    degraded: "#f59e0b",
    warning: "#f59e0b",
    offline: "#f43f5e",
    pending: "#64748b",
  };
  const color = colorMap[safeStatus] || "#10b981";

  return (
    <span className={`admin-health-badge ${safeStatus}`}>
      <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: color, display: "inline-block" }} />
      {displayLabel}
    </span>
  );
}

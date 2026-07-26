"use client";

import Link from "next/link";
import React from "react";

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  change?: string;
  trend?: "up" | "down" | "neutral";
  statusColor?: "emerald" | "amber" | "rose" | "purple" | "blue";
  icon?: (props: React.SVGProps<SVGSVGElement>) => React.ReactNode;
  href?: string;
}

export default function MetricCard({
  title,
  value,
  subtitle,
  change,
  trend,
  statusColor = "purple",
  icon,
  href
}: MetricCardProps) {
  let badgeCls = "";
  if (statusColor === "emerald" || trend === "up") badgeCls = "up";
  else if (statusColor === "rose" || trend === "down") badgeCls = "down";
  else if (statusColor === "amber") badgeCls = "amber";
  else badgeCls = statusColor;

  const inner = (
    <div className={`admin-metric-card${href ? "" : ""}`} style={{ cursor: href ? "pointer" : "default" }}>
      <div className="admin-metric-card-header">
        <span className="admin-metric-card-title">{title}</span>
        {icon && <div className={`admin-metric-card-icon ${statusColor}`}>{icon({ width: 15, height: 15 })}</div>}
      </div>
      <div>
        <div className="admin-metric-card-body">
          <span className="admin-metric-card-value">{value}</span>
          {change && <span className={`admin-metric-card-badge ${badgeCls}`}>{change}</span>}
        </div>
        {subtitle && <div className="admin-metric-card-subtitle">{subtitle}</div>}
      </div>
    </div>
  );

  return href ? (
    <Link href={href} style={{ textDecoration: "none", display: "block", height: "100%" }}>
      {inner}
    </Link>
  ) : inner;
}

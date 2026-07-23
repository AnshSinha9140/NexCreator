"use client";

import React from "react";

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: string;
  isPositive?: boolean;
  icon?: React.ReactNode;
  subtitle?: string;
  accentColor?: "purple" | "emerald" | "blue" | "amber" | "rose";
  children?: React.ReactNode;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  change,
  isPositive = true,
  icon,
  subtitle,
  accentColor = "purple",
  children,
}) => {
  const accentClasses = {
    purple: "text-purple-400 border-purple-500/20 bg-purple-500/10",
    emerald: "text-emerald-400 border-emerald-500/20 bg-emerald-500/10",
    blue: "text-cyan-400 border-cyan-500/20 bg-cyan-500/10",
    amber: "text-amber-400 border-amber-500/20 bg-amber-500/10",
    rose: "text-rose-400 border-rose-500/20 bg-rose-500/10",
  };

  return (
    <div className="glass p-6 flex flex-col justify-between relative overflow-hidden group hover:border-white/20 transition-all duration-300">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest font-mono">
          {title}
        </span>
        {icon && (
          <div className={`p-2 rounded-xl border ${accentClasses[accentColor]} transition-transform group-hover:scale-110`}>
            {icon}
          </div>
        )}
      </div>

      {/* Main Metric & Change Badge */}
      <div className="my-4 flex items-baseline justify-between gap-2">
        <span className="text-2xl font-extrabold text-white tracking-tight font-sans truncate">
          {value}
        </span>
        {change && (
          <span className={`flex-shrink-0 inline-flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
            isPositive ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
          }`}>
            {isPositive ? "▲" : "▼"} {change}
          </span>
        )}
      </div>

      {/* Subtitle / Sparkline Area */}
      {subtitle && (
        <p className="text-[11px] text-slate-400 font-sans truncate">
          {subtitle}
        </p>
      )}

      {children && (
        <div className="mt-3">
          {children}
        </div>
      )}
    </div>
  );
};

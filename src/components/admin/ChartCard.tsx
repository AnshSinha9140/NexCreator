"use client";

interface ChartData {
  label: string;
  value: number;
}

interface ChartCardProps {
  title: string;
  subtitle?: string;
  data: ChartData[];
  color?: "purple" | "emerald" | "blue" | "rose" | "amber";
}

const colorMap = {
  purple: "#9333ea",
  emerald: "#059669",
  blue: "#2563eb",
  rose: "#e11d48",
  amber: "#d97706",
};

export default function ChartCard({ title, subtitle, data, color = "purple" }: ChartCardProps) {
  const max = Math.max(...data.map((d) => d.value), 1);
  const hexColor = colorMap[color];

  return (
    <div className="admin-chart-card">
      <div className="admin-chart-header">
        <div style={{ minWidth: 0 }}>
          <div className="admin-chart-title">{title}</div>
          {subtitle && <div className="admin-chart-subtitle">{subtitle}</div>}
        </div>
        <div className="admin-chart-live-pill" style={{ color: hexColor, background: `${hexColor}15`, borderColor: `${hexColor}30` }}>
          <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: hexColor, display: "inline-block" }} />
          Live Telemetry
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        <div className="admin-chart-bars" style={{ height: "130px", alignItems: "flex-end" }}>
          {data.map((d, i) => {
            const pct = Math.max(6, (d.value / max) * 100);
            return (
              <div key={i} className="admin-chart-bar-col">
                <div
                  className="admin-chart-bar"
                  title={`${d.label}: ${d.value.toLocaleString()}`}
                  style={{ height: `${pct}%`, background: hexColor, borderRadius: "4px 4px 0 0", opacity: 0.85 }}
                />
              </div>
            );
          })}
        </div>
        <div style={{ display: "flex", borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: "6px" }}>
          {data.map((d, i) => (
            <span key={i} className="admin-chart-bar-label" style={{ flex: 1 }}>{d.label}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

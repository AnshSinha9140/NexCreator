"use client";

import React from "react";
import { QuotaDashboardView } from "@/components/admin/QuotaDashboardView";

export default function AdminQuotaPage() {
  return (
    <div style={{ minHeight: "100vh", background: "#060810", color: "#f8fafc" }}>
      <QuotaDashboardView />
    </div>
  );
}

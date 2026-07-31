"use client";

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import { usePathname } from "next/navigation";
import { AdminDashboardBundle } from "@/types/adminDashboard";

interface AdminContextValue {
  bundle: AdminDashboardBundle | null;
  loading: boolean;
  error: string | null;
  status: "healthy" | "degraded" | "unreachable" | "loading";
  lastUpdated: string | null;
  refresh: () => Promise<void>;
}

const AdminContext = createContext<AdminContextValue>({
  bundle: null,
  loading: true,
  error: null,
  status: "loading",
  lastUpdated: null,
  refresh: async () => {},
});

export const AdminProvider = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const [bundle, setBundle] = useState<AdminDashboardBundle | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<"healthy" | "degraded" | "unreachable" | "loading">("loading");
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  const fetchBundle = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/dashboard");
      const json = await res.json();

      if (json.success && json.data) {
        setBundle(json.data);
        setStatus(json.status || "healthy");
        setError(null);
        setLastUpdated(new Date().toLocaleTimeString());
      } else {
        setStatus("degraded");
        if (json.error) setError(json.error);
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      console.error("AdminContext fetch error:", msg);
      setStatus("unreachable");
      setError(msg || "Network error while fetching admin dashboard");
    } finally {
      setLoading(false);
    }
  }, []);

  const isDashboardPage = pathname === "/admin" || pathname === "/admin/";

  useEffect(() => {
    fetchBundle();

    let interval: NodeJS.Timeout | null = null;

    if (isDashboardPage) {
      interval = setInterval(() => {
        if (typeof document !== "undefined" && document.hidden) return;
        fetchBundle();
      }, 10000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [fetchBundle, isDashboardPage]);

  return (
    <AdminContext.Provider
      value={{
        bundle,
        loading,
        error,
        status,
        lastUpdated,
        refresh: fetchBundle,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => useContext(AdminContext);

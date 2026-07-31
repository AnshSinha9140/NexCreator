"use client";

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import { usePathname } from "next/navigation";
import { AIOperationsBundle } from "@/types/aiOperations";

interface AIOperationsContextValue {
  bundle: AIOperationsBundle | null;
  loading: boolean;
  error: string | null;
  lastUpdated: string | null;
  refresh: () => Promise<void>;
}

const AIOperationsContext = createContext<AIOperationsContextValue>({
  bundle: null,
  loading: true,
  error: null,
  lastUpdated: null,
  refresh: async () => {},
});

export const AIOperationsProvider = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const [bundle, setBundle] = useState<AIOperationsBundle | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  const fetchBundle = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/ai-operations");
      const json = await res.json();

      if (json.success && json.data) {
        setBundle(json.data);
        setError(null);
        setLastUpdated(new Date().toLocaleTimeString());
      } else {
        if (json.error) setError(json.error);
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      console.error("[AIOperationsContext] Fetch error:", msg);
      setError(msg || "Failed to fetch AI Operations telemetry");
    } finally {
      setLoading(false);
    }
  }, []);

  const isAIOpsPage = pathname === "/admin/ai-operations" || pathname === "/admin/ai-operations/";

  useEffect(() => {
    fetchBundle();

    let interval: NodeJS.Timeout | null = null;

    if (isAIOpsPage) {
      interval = setInterval(() => {
        if (typeof document !== "undefined" && document.hidden) return;
        fetchBundle();
      }, 10000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [fetchBundle, isAIOpsPage]);

  return (
    <AIOperationsContext.Provider
      value={{
        bundle,
        loading,
        error,
        lastUpdated,
        refresh: fetchBundle,
      }}
    >
      {children}
    </AIOperationsContext.Provider>
  );
};

export const useAIOperations = () => useContext(AIOperationsContext);

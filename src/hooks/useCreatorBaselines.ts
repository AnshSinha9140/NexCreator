import { useState, useEffect } from "react";
import { LiveMonitoringBaselines } from "@/types/intelligence";

export interface UseCreatorBaselinesResult {
  baselines: LiveMonitoringBaselines | null;
  rules: string[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useCreatorBaselines(userId: string): UseCreatorBaselinesResult {
  const [baselines, setBaselines] = useState<LiveMonitoringBaselines | null>(null);
  const [rules, setRules] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBaselines = async () => {
    if (!userId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/intelligence/baselines?userId=${encodeURIComponent(userId)}`);
      const data = await res.json();
      if (data.success) {
        setBaselines(data.baselines || null);
        setRules(data.rules || []);
        setError(null);
      } else {
        setError(data.error || "Failed to load baselines");
      }
    } catch (err: any) {
      setError(err.message || "Network error fetching baselines");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBaselines();
  }, [userId]);

  return {
    baselines,
    rules,
    loading,
    error,
    refetch: fetchBaselines,
  };
}

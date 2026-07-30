"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { LiveSessionState } from "@/lib/session/sessionState";

interface LiveSessionContextType {
  state: LiveSessionState | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

const LiveSessionContext = createContext<LiveSessionContextType>({
  state: null,
  isLoading: true,
  error: null,
  refetch: async () => {},
});

export interface LiveSessionProviderProps {
  sessionId: string | null;
  children: React.ReactNode;
  pollingIntervalMs?: number;
}

export const LiveSessionProvider: React.FC<LiveSessionProviderProps> = ({
  sessionId,
  children,
  pollingIntervalMs = 5000,
}) => {
  const [state, setState] = useState<LiveSessionState | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const pollerTimerRef = useRef<NodeJS.Timeout | null>(null);

  const fetchSessionState = useCallback(async () => {
    if (!sessionId) {
      setState(null);
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch(`/api/session/state?sessionId=${encodeURIComponent(sessionId)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.state) {
          setState(data.state);
          setError(null);
        } else {
          setError(data.error || "Failed to parse session state");
        }
      } else {
        setError(`Server returned status ${res.status}`);
      }
    } catch (err: any) {
      console.warn("[LiveSessionProvider] Sync error:", err);
      setError(err.message || "Network error polling session state");
    } finally {
      setIsLoading(false);
    }
  }, [sessionId]);

  useEffect(() => {
    fetchSessionState();

    // Setup SINGLE polling loop if session is active
    if (sessionId && state?.phase !== "COMPLETED") {
      pollerTimerRef.current = setInterval(fetchSessionState, pollingIntervalMs);
    } else {
      if (pollerTimerRef.current) {
        clearInterval(pollerTimerRef.current);
        pollerTimerRef.current = null;
      }
    }

    return () => {
      if (pollerTimerRef.current) {
        clearInterval(pollerTimerRef.current);
        pollerTimerRef.current = null;
      }
    };
  }, [sessionId, pollingIntervalMs, fetchSessionState, state?.phase]);

  return (
    <LiveSessionContext.Provider
      value={{
        state,
        isLoading,
        error,
        refetch: fetchSessionState,
      }}
    >
      {children}
    </LiveSessionContext.Provider>
  );
};

export const useLiveSession = () => useContext(LiveSessionContext);

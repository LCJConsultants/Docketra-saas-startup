"use client";

import { useState, useEffect, useCallback, useRef } from "react";

interface UseTimerOptions {
  onStop?: (durationMinutes: number) => void;
}

export function useTimer(options?: UseTimerOptions) {
  const [isRunning, setIsRunning] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [caseId, setCaseId] = useState<string | null>(null);
  const [timeEntryId, setTimeEntryId] = useState<string | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning]);

  const start = useCallback((forCaseId: string, entryId?: string) => {
    setCaseId(forCaseId);
    setTimeEntryId(entryId || null);
    setElapsedSeconds(0);
    setIsRunning(true);
  }, []);

  const stop = useCallback(() => {
    setIsRunning(false);
    const durationMinutes = Math.max(1, Math.round(elapsedSeconds / 60));
    options?.onStop?.(durationMinutes);
    return { caseId, timeEntryId, durationMinutes };
  }, [elapsedSeconds, caseId, timeEntryId, options]);

  const pause = useCallback(() => {
    setIsRunning(false);
  }, []);

  const resume = useCallback(() => {
    setIsRunning(true);
  }, []);

  const formatTime = useCallback((totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  }, []);

  return {
    isRunning,
    elapsedSeconds,
    caseId,
    timeEntryId,
    formattedTime: formatTime(elapsedSeconds),
    start,
    stop,
    pause,
    resume,
  };
}

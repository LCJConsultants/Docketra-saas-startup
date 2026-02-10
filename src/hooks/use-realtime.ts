"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

interface UseRealtimeOptions {
  table: string;
  event?: "INSERT" | "UPDATE" | "DELETE" | "*";
  filter?: string;
  onData: (payload: { new: Record<string, unknown>; old: Record<string, unknown>; eventType: string }) => void;
}

export function useRealtime({ table, event = "*", filter, onData }: UseRealtimeOptions) {
  useEffect(() => {
    const supabase = createClient();

    const channelConfig: Record<string, unknown> = {
      event,
      schema: "public",
      table,
    };

    if (filter) {
      channelConfig.filter = filter;
    }

    const channel = supabase
      .channel(`realtime-${table}`)
      .on(
        "postgres_changes" as never,
        channelConfig as never,
        (payload: { new: Record<string, unknown>; old: Record<string, unknown>; eventType: string }) => {
          onData(payload);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [table, event, filter, onData]);
}

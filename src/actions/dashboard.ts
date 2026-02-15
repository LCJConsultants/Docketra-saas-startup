"use server";

import { createClient } from "@/lib/supabase/server";
import { startOfDay, endOfDay, startOfWeek } from "date-fns";

export async function getDashboardStats() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const now = new Date();
  const todayStart = startOfDay(now).toISOString();
  const todayEnd = endOfDay(now).toISOString();
  const weekStart = startOfWeek(now, { weekStartsOn: 1 }).toISOString();

  const [casesRes, eventsRes, timeRes, docsRes] = await Promise.all([
    supabase
      .from("cases")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("status", "open"),
    supabase
      .from("calendar_events")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .gte("start_time", todayStart)
      .lte("start_time", todayEnd),
    supabase
      .from("time_entries")
      .select("duration_minutes")
      .eq("user_id", user.id)
      .gte("date", weekStart),
    supabase
      .from("documents")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id),
  ]);

  const hoursThisWeek = (timeRes.data || []).reduce(
    (sum, entry) => sum + (entry.duration_minutes || 0),
    0
  ) / 60;

  return {
    activeCases: casesRes.count ?? 0,
    eventsToday: eventsRes.count ?? 0,
    hoursThisWeek: Math.round(hoursThisWeek * 10) / 10,
    documentsCount: docsRes.count ?? 0,
  };
}

export async function getUpcomingDeadlines(limit = 5) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("calendar_events")
    .select("id, title, event_type, start_time, case_id, case:cases(id, title)")
    .eq("user_id", user.id)
    .in("event_type", ["deadline", "filing", "sol"])
    .gte("start_time", new Date().toISOString())
    .order("start_time", { ascending: true })
    .limit(limit);

  if (error) throw error;
  return data ?? [];
}

export async function getRecentActivity(limit = 5) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const [casesRes, docsRes, timeRes] = await Promise.all([
    supabase
      .from("cases")
      .select("id, title, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(limit),
    supabase
      .from("documents")
      .select("id, title, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(limit),
    supabase
      .from("time_entries")
      .select("id, description, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(limit),
  ]);

  const items = [
    ...(casesRes.data || []).map((c) => ({
      type: "case" as const,
      title: c.title,
      timestamp: c.created_at,
    })),
    ...(docsRes.data || []).map((d) => ({
      type: "document" as const,
      title: d.title,
      timestamp: d.created_at,
    })),
    ...(timeRes.data || []).map((t) => ({
      type: "time_entry" as const,
      title: t.description,
      timestamp: t.created_at,
    })),
  ];

  items.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  return items.slice(0, limit);
}

export async function getUnbilledSummary() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("time_entries")
    .select("duration_minutes, total_amount, case:cases(id, title)")
    .eq("user_id", user.id)
    .eq("is_billable", true)
    .is("invoice_id", null);

  if (error) throw error;

  const grouped = new Map<string, { case_title: string; total_minutes: number; total_amount: number }>();

  for (const entry of data || []) {
    const caseData = entry.case as unknown as { id: string; title: string } | null;
    const caseId = caseData?.id ?? "unknown";
    const caseTitle = caseData?.title ?? "No Case";
    const existing = grouped.get(caseId);

    if (existing) {
      existing.total_minutes += entry.duration_minutes || 0;
      existing.total_amount += entry.total_amount || 0;
    } else {
      grouped.set(caseId, {
        case_title: caseTitle,
        total_minutes: entry.duration_minutes || 0,
        total_amount: entry.total_amount || 0,
      });
    }
  }

  return Array.from(grouped.values()).map((g) => ({
    case_title: g.case_title,
    total_hours: Math.round((g.total_minutes / 60) * 10) / 10,
    total_amount: g.total_amount,
  }));
}

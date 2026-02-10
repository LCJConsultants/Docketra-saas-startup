"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const timeEntrySchema = z.object({
  case_id: z.string().uuid("Case is required"),
  description: z.string().min(1, "Description is required"),
  duration_minutes: z.coerce.number().min(1, "Duration must be at least 1 minute"),
  hourly_rate: z.coerce.number().optional(),
  date: z.string().min(1, "Date is required"),
  is_billable: z.string().optional(),
});

export async function getTimeEntries(filters?: { case_id?: string; unbilled?: boolean }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  let query = supabase
    .from("time_entries")
    .select("*, case:cases(id, title)")
    .eq("user_id", user.id)
    .order("date", { ascending: false });

  if (filters?.case_id) {
    query = query.eq("case_id", filters.case_id);
  }
  if (filters?.unbilled) {
    query = query.is("invoice_id", null);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function createTimeEntryAction(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const raw = Object.fromEntries(formData);
  const parsed = timeEntrySchema.parse(raw);

  const { data, error } = await supabase
    .from("time_entries")
    .insert({
      user_id: user.id,
      case_id: parsed.case_id,
      description: parsed.description,
      duration_minutes: parsed.duration_minutes,
      hourly_rate: parsed.hourly_rate || null,
      date: parsed.date,
      is_billable: parsed.is_billable === "true",
    })
    .select()
    .single();

  if (error) throw error;

  revalidatePath("/time-tracking");
  revalidatePath(`/cases/${parsed.case_id}`);
  return data;
}

export async function updateTimeEntryAction(id: string, formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const raw = Object.fromEntries(formData);
  const parsed = timeEntrySchema.parse(raw);

  const { error } = await supabase
    .from("time_entries")
    .update({
      case_id: parsed.case_id,
      description: parsed.description,
      duration_minutes: parsed.duration_minutes,
      hourly_rate: parsed.hourly_rate || null,
      date: parsed.date,
      is_billable: parsed.is_billable === "true",
    })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) throw error;

  revalidatePath("/time-tracking");
}

export async function deleteTimeEntryAction(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { error } = await supabase
    .from("time_entries")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) throw error;

  revalidatePath("/time-tracking");
}

export async function startTimerAction(caseId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("time_entries")
    .insert({
      user_id: user.id,
      case_id: caseId,
      description: "Timer in progress...",
      duration_minutes: 0,
      date: new Date().toISOString().split("T")[0],
      is_billable: true,
      timer_started_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function stopTimerAction(id: string, description: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  // Get the time entry to calculate duration
  const { data: entry } = await supabase
    .from("time_entries")
    .select("timer_started_at")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!entry?.timer_started_at) throw new Error("Timer not started");

  const startedAt = new Date(entry.timer_started_at);
  const durationMinutes = Math.round((Date.now() - startedAt.getTime()) / 60000);

  const { error } = await supabase
    .from("time_entries")
    .update({
      description,
      duration_minutes: Math.max(1, durationMinutes),
      timer_started_at: null,
    })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) throw error;

  revalidatePath("/time-tracking");
}

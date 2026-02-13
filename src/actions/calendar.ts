"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const eventSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  event_type: z.enum(["court_date", "deadline", "filing", "meeting", "reminder", "sol"]),
  start_time: z.string().min(1, "Start time is required"),
  end_time: z.string().optional(),
  all_day: z.string().optional(),
  location: z.string().optional(),
  case_id: z.string().optional(),
  reminder_minutes: z.string().optional(), // comma-separated
  is_recurring: z.string().optional(),
  recurrence_rule: z.string().optional(),
});

export async function getCalendarEvents(start?: string, end?: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  let query = supabase
    .from("calendar_events")
    .select("*, case:cases(id, title)")
    .eq("user_id", user.id)
    .order("start_time", { ascending: true });

  if (start) query = query.gte("start_time", start);
  if (end) query = query.lte("start_time", end);

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function getUpcomingEvents(limit = 5) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("calendar_events")
    .select("*, case:cases(id, title)")
    .eq("user_id", user.id)
    .gte("start_time", new Date().toISOString())
    .order("start_time", { ascending: true })
    .limit(limit);

  if (error) throw error;
  return data;
}

export async function createEventAction(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const raw = Object.fromEntries(formData);
  const parsed = eventSchema.parse(raw);

  const reminderMinutes = parsed.reminder_minutes
    ? parsed.reminder_minutes.split(",").map((m) => parseInt(m.trim())).filter(Boolean)
    : null;

  const { data, error } = await supabase
    .from("calendar_events")
    .insert({
      user_id: user.id,
      title: parsed.title,
      description: parsed.description || null,
      event_type: parsed.event_type,
      start_time: parsed.start_time,
      end_time: parsed.end_time || null,
      all_day: parsed.all_day === "true",
      location: parsed.location || null,
      case_id: parsed.case_id && parsed.case_id !== "none" ? parsed.case_id : null,
      reminder_minutes: reminderMinutes,
      is_recurring: parsed.is_recurring === "true",
      recurrence_rule: parsed.recurrence_rule || null,
    })
    .select()
    .single();

  if (error) throw error;

  revalidatePath("/calendar");
  revalidatePath("/dashboard");
  return data;
}

export async function updateEventAction(id: string, formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const raw = Object.fromEntries(formData);
  const parsed = eventSchema.parse(raw);

  const reminderMinutes = parsed.reminder_minutes
    ? parsed.reminder_minutes.split(",").map((m) => parseInt(m.trim())).filter(Boolean)
    : null;

  const { error } = await supabase
    .from("calendar_events")
    .update({
      title: parsed.title,
      description: parsed.description || null,
      event_type: parsed.event_type,
      start_time: parsed.start_time,
      end_time: parsed.end_time || null,
      all_day: parsed.all_day === "true",
      location: parsed.location || null,
      case_id: parsed.case_id && parsed.case_id !== "none" ? parsed.case_id : null,
      reminder_minutes: reminderMinutes,
      is_recurring: parsed.is_recurring === "true",
      recurrence_rule: parsed.recurrence_rule || null,
    })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) throw error;

  revalidatePath("/calendar");
  revalidatePath("/dashboard");
}

export async function deleteEventAction(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { error } = await supabase
    .from("calendar_events")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) throw error;

  revalidatePath("/calendar");
  revalidatePath("/dashboard");
}

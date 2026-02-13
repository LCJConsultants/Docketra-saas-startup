"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const profileUpdateSchema = z.object({
  full_name: z.string().min(1, "Name is required"),
  firm_name: z.string().optional(),
  phone: z.string().optional(),
  bar_number: z.string().optional(),
  practice_areas: z.string().optional(), // comma-separated
});

export async function updateProfileAction(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const raw = Object.fromEntries(formData);
  const parsed = profileUpdateSchema.parse(raw);

  const practiceAreas = parsed.practice_areas
    ? parsed.practice_areas.split(",").map((a) => a.trim()).filter(Boolean)
    : null;

  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: parsed.full_name,
      firm_name: parsed.firm_name || null,
      phone: parsed.phone || null,
      bar_number: parsed.bar_number || null,
      practice_areas: practiceAreas,
    })
    .eq("id", user.id);

  if (error) throw error;

  revalidatePath("/settings");
  revalidatePath("/settings/profile");
}

export async function updateNotificationPrefsAction(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const prefs = {
    email: formData.get("email_notifications") === "true",
    in_app: formData.get("in_app_notifications") === "true",
    digest: formData.get("digest_notifications") === "true",
  };

  const { error } = await supabase
    .from("profiles")
    .update({ notification_preferences: prefs })
    .eq("id", user.id);

  if (error) throw error;

  revalidatePath("/settings/notifications");
}

export async function disconnectIntegration(
  provider: "google" | "outlook" | "dropbox"
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const updates: Record<string, null> = {};
  if (provider === "google") {
    updates.google_refresh_token = null;
    updates.gmail_refresh_token = null;
  } else if (provider === "outlook") {
    updates.outlook_refresh_token = null;
  } else if (provider === "dropbox") {
    updates.dropbox_refresh_token = null;
  }

  const { error } = await supabase
    .from("profiles")
    .update(updates)
    .eq("id", user.id);

  if (error) throw error;

  revalidatePath("/settings/integrations");
}

export async function getProfile() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (error) throw error;
  return data;
}

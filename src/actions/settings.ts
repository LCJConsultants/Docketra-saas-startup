"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
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
    notify_deadlines: formData.get("notify_deadlines") !== "false",
    notify_court_dates: formData.get("notify_court_dates") !== "false",
    notify_filings: formData.get("notify_filings") !== "false",
    notify_meetings: formData.get("notify_meetings") !== "false",
    notify_sol: formData.get("notify_sol") !== "false",
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

export async function deleteAccountAction() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  // Delete user data from all tables (cascade from profile)
  const admin = createAdminClient();

  // Delete in order to respect foreign keys
  await admin.from("notifications").delete().eq("user_id", user.id);
  await admin.from("time_entries").delete().eq("user_id", user.id);
  await admin.from("calendar_events").delete().eq("user_id", user.id);
  await admin.from("documents").delete().eq("user_id", user.id);
  await admin.from("invoices").delete().eq("user_id", user.id);
  await admin.from("cases").delete().eq("user_id", user.id);
  await admin.from("clients").delete().eq("user_id", user.id);
  await admin.from("emails").delete().eq("user_id", user.id);
  await admin.from("profiles").delete().eq("id", user.id);

  // Delete the auth user
  const { error } = await admin.auth.admin.deleteUser(user.id);
  if (error) throw error;

  // Sign out and redirect
  await supabase.auth.signOut();
  redirect("/login");
}

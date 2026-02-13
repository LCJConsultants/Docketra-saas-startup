"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function getEmails(filters?: {
  case_id?: string;
  client_id?: string;
  direction?: string;
  is_read?: boolean;
  search?: string;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  let query = supabase
    .from("emails")
    .select("*")
    .eq("user_id", user.id)
    .order("received_at", { ascending: false })
    .limit(100);

  if (filters?.case_id) query = query.eq("case_id", filters.case_id);
  if (filters?.client_id) query = query.eq("client_id", filters.client_id);
  if (filters?.direction) query = query.eq("direction", filters.direction);
  if (filters?.is_read !== undefined)
    query = query.eq("is_read", filters.is_read);
  if (filters?.search) query = query.ilike("subject", `%${filters.search}%`);

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function linkEmailToCase(emailId: string, caseId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  await supabase
    .from("emails")
    .update({ case_id: caseId })
    .eq("id", emailId)
    .eq("user_id", user.id);

  revalidatePath("/emails");
}

export async function markEmailRead(emailId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  await supabase
    .from("emails")
    .update({ is_read: true })
    .eq("id", emailId)
    .eq("user_id", user.id);

  revalidatePath("/emails");
}

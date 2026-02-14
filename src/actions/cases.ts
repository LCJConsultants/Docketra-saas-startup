"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const caseSchema = z.object({
  client_id: z.string().uuid("Client is required"),
  title: z.string().min(1, "Title is required"),
  case_number: z.string().optional(),
  case_type: z.enum(["criminal", "civil", "divorce", "custody", "mediation", "other"]),
  status: z.enum(["open", "pending", "closed", "archived"]).optional(),
  description: z.string().optional(),
  court_name: z.string().optional(),
  judge_name: z.string().optional(),
  opposing_party: z.string().optional(),
  opposing_counsel: z.string().optional(),
  statute_of_limitations: z.string().optional(),
  tags: z.string().optional(), // comma-separated
});

export async function getCases(filters?: { status?: string; case_type?: string; page?: number; limit?: number }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const page = filters?.page || 1;
  const limit = filters?.limit || 50;
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabase
    .from("cases")
    .select("*, client:clients(id, first_name, last_name)", { count: "exact" })
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .range(from, to);

  if (filters?.status) {
    query = query.eq("status", filters.status);
  }
  if (filters?.case_type) {
    query = query.eq("case_type", filters.case_type);
  }

  const { data, error, count } = await query;
  if (error) throw error;
  return { data: data || [], total: count || 0, page, limit };
}

export async function getCase(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("cases")
    .select("*, client:clients(id, first_name, last_name, email, phone)")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (error) throw error;
  return data;
}

export async function getCasesByClient(clientId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("cases")
    .select("*")
    .eq("user_id", user.id)
    .eq("client_id", clientId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}

export async function createCaseAction(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const raw = Object.fromEntries(formData);
  const parsed = caseSchema.parse(raw);

  const tags = parsed.tags
    ? parsed.tags.split(",").map((t) => t.trim()).filter(Boolean)
    : null;

  const { data, error } = await supabase
    .from("cases")
    .insert({
      user_id: user.id,
      client_id: parsed.client_id,
      title: parsed.title,
      case_number: parsed.case_number || null,
      case_type: parsed.case_type,
      status: parsed.status || "open",
      description: parsed.description || null,
      court_name: parsed.court_name || null,
      judge_name: parsed.judge_name || null,
      opposing_party: parsed.opposing_party || null,
      opposing_counsel: parsed.opposing_counsel || null,
      statute_of_limitations: parsed.statute_of_limitations || null,
      tags,
    })
    .select()
    .single();

  if (error) throw error;

  revalidatePath("/cases");
  return data;
}

export async function updateCaseAction(id: string, formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const raw = Object.fromEntries(formData);
  const parsed = caseSchema.parse(raw);

  const tags = parsed.tags
    ? parsed.tags.split(",").map((t) => t.trim()).filter(Boolean)
    : null;

  const { error } = await supabase
    .from("cases")
    .update({
      client_id: parsed.client_id,
      title: parsed.title,
      case_number: parsed.case_number || null,
      case_type: parsed.case_type,
      status: parsed.status || "open",
      description: parsed.description || null,
      court_name: parsed.court_name || null,
      judge_name: parsed.judge_name || null,
      opposing_party: parsed.opposing_party || null,
      opposing_counsel: parsed.opposing_counsel || null,
      statute_of_limitations: parsed.statute_of_limitations || null,
      tags,
    })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) throw error;

  revalidatePath("/cases");
  revalidatePath(`/cases/${id}`);
}

export async function deleteCaseAction(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { error } = await supabase
    .from("cases")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) throw error;

  revalidatePath("/cases");
}

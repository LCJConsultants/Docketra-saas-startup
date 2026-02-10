"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const templateSchema = z.object({
  title: z.string().min(1, "Title is required"),
  category: z.enum(["motion", "pleading", "letter", "contract", "agreement", "other"]),
  practice_area: z.string().optional(),
  content: z.string().min(1, "Content is required"),
});

export async function getTemplates(filters?: { category?: string; practice_area?: string }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  let query = supabase
    .from("document_templates")
    .select("*")
    .or(`user_id.eq.${user.id},is_system.eq.true`)
    .order("created_at", { ascending: false });

  if (filters?.category) {
    query = query.eq("category", filters.category);
  }
  if (filters?.practice_area) {
    query = query.eq("practice_area", filters.practice_area);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function getTemplate(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("document_templates")
    .select("*")
    .eq("id", id)
    .or(`user_id.eq.${user.id},is_system.eq.true`)
    .single();

  if (error) throw error;
  return data;
}

export async function createTemplateAction(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const raw = Object.fromEntries(formData);
  const parsed = templateSchema.parse(raw);

  const { data, error } = await supabase
    .from("document_templates")
    .insert({
      user_id: user.id,
      title: parsed.title,
      category: parsed.category,
      practice_area: parsed.practice_area || null,
      content: parsed.content,
      is_system: false,
    })
    .select()
    .single();

  if (error) throw error;

  revalidatePath("/templates");
  return data;
}

export async function updateTemplateAction(id: string, formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const raw = Object.fromEntries(formData);
  const parsed = templateSchema.parse(raw);

  const { error } = await supabase
    .from("document_templates")
    .update({
      title: parsed.title,
      category: parsed.category,
      practice_area: parsed.practice_area || null,
      content: parsed.content,
    })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) throw error;

  revalidatePath("/templates");
  revalidatePath(`/templates/${id}`);
}

export async function deleteTemplateAction(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { error } = await supabase
    .from("document_templates")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) throw error;

  revalidatePath("/templates");
}

"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const documentSchema = z.object({
  title: z.string().min(1, "Title is required"),
  file_name: z.string().min(1, "File name is required"),
  file_type: z.string().optional(),
  file_size: z.coerce.number().optional(),
  storage_path: z.string().optional(),
  case_id: z.string().uuid().optional().or(z.literal("")),
  client_id: z.string().uuid().optional().or(z.literal("")),
  category: z
    .enum(["motion", "pleading", "correspondence", "contract", "evidence", "other"])
    .optional(),
  is_template: z.coerce.boolean().optional(),
  source: z.string().optional(),
});

export async function getDocuments(filters?: {
  case_id?: string;
  category?: string;
  search?: string;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  let query = supabase
    .from("documents")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (filters?.case_id) {
    query = query.eq("case_id", filters.case_id);
  }
  if (filters?.category) {
    query = query.eq("category", filters.category);
  }
  if (filters?.search) {
    query = query.ilike("title", `%${filters.search}%`);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function getDocument(id: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("documents")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (error) throw error;
  return data;
}

export async function createDocumentAction(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const raw = Object.fromEntries(formData);
  const parsed = documentSchema.parse(raw);

  const { data, error } = await supabase
    .from("documents")
    .insert({
      user_id: user.id,
      title: parsed.title,
      file_name: parsed.file_name,
      file_type: parsed.file_type || null,
      file_size: parsed.file_size || null,
      storage_path: parsed.storage_path || null,
      case_id: parsed.case_id || null,
      client_id: parsed.client_id || null,
      category: parsed.category || "other",
      is_template: parsed.is_template || false,
      source: parsed.source || "upload",
    })
    .select()
    .single();

  if (error) throw error;

  revalidatePath("/documents");
  return data;
}

export async function updateDocumentAction(id: string, formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const raw = Object.fromEntries(formData);
  const parsed = documentSchema.parse(raw);

  const { error } = await supabase
    .from("documents")
    .update({
      title: parsed.title,
      file_name: parsed.file_name,
      file_type: parsed.file_type || null,
      file_size: parsed.file_size || null,
      storage_path: parsed.storage_path || null,
      case_id: parsed.case_id || null,
      client_id: parsed.client_id || null,
      category: parsed.category || "other",
      is_template: parsed.is_template || false,
      source: parsed.source || "upload",
    })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) throw error;

  revalidatePath("/documents");
  revalidatePath(`/documents/${id}`);
}

export async function deleteDocumentAction(id: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  // Optionally remove the file from storage
  const { data: doc } = await supabase
    .from("documents")
    .select("storage_path")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (doc?.storage_path) {
    await supabase.storage.from("documents").remove([doc.storage_path]);
  }

  const { error } = await supabase
    .from("documents")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) throw error;

  revalidatePath("/documents");
}

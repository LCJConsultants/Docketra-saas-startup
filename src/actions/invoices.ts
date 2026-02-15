"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";
import { generateInvoiceNumber } from "@/lib/utils";

const invoiceSchema = z.object({
  client_id: z.string().uuid("Client is required"),
  case_id: z.string().uuid().optional().or(z.literal("")),
  notes: z.string().optional(),
  due_date: z.string().optional(),
  tax_rate: z.coerce.number().min(0).max(100).optional(),
});

export async function getInvoices(filters?: { status?: string; client_id?: string; page?: number; limit?: number }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const page = filters?.page || 1;
  const limit = filters?.limit || 50;
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabase
    .from("invoices")
    .select("*, client:clients(id, first_name, last_name), case:cases(id, title)", { count: "exact" })
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .range(from, to);

  if (filters?.status) query = query.eq("status", filters.status);
  if (filters?.client_id) query = query.eq("client_id", filters.client_id);

  const { data, error, count } = await query;
  if (error) throw error;
  return { data: data || [], total: count || 0, page, limit };
}

export async function getInvoice(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data: invoice, error } = await supabase
    .from("invoices")
    .select("*, client:clients(id, first_name, last_name, email, address), case:cases(id, title)")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (error) throw error;

  // Get line items
  const { data: lineItems } = await supabase
    .from("invoice_line_items")
    .select("*")
    .eq("invoice_id", id)
    .order("created_at", { ascending: true });

  return { ...invoice, line_items: lineItems || [] };
}

export async function createInvoiceAction(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const raw = Object.fromEntries(formData);
  const parsed = invoiceSchema.parse(raw);

  const { data, error } = await supabase
    .from("invoices")
    .insert({
      user_id: user.id,
      client_id: parsed.client_id,
      case_id: parsed.case_id || null,
      invoice_number: generateInvoiceNumber(),
      status: "draft",
      notes: parsed.notes || null,
      due_date: parsed.due_date || null,
      tax_rate: parsed.tax_rate || 0,
    })
    .select()
    .single();

  if (error) throw error;

  revalidatePath("/invoices");
  return data;
}

export async function addLineItemAction(invoiceId: string, data: {
  description: string;
  quantity: number;
  unit_price: number;
  time_entry_id?: string;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  // Verify the invoice belongs to this user
  const { data: invoice, error: invoiceError } = await supabase
    .from("invoices")
    .select("id")
    .eq("id", invoiceId)
    .eq("user_id", user.id)
    .single();

  if (invoiceError || !invoice) throw new Error("Invoice not found");

  const { error } = await supabase
    .from("invoice_line_items")
    .insert({
      invoice_id: invoiceId,
      description: data.description,
      quantity: data.quantity,
      unit_price: data.unit_price,
      time_entry_id: data.time_entry_id || null,
    });

  if (error) throw error;

  // Recalculate totals
  await recalculateInvoiceTotals(invoiceId, user.id);
  revalidatePath(`/invoices/${invoiceId}`);
}

export async function removeLineItemAction(lineItemId: string, invoiceId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  // Verify the invoice belongs to this user
  const { data: invoice, error: invoiceError } = await supabase
    .from("invoices")
    .select("id")
    .eq("id", invoiceId)
    .eq("user_id", user.id)
    .single();

  if (invoiceError || !invoice) throw new Error("Invoice not found");

  const { error } = await supabase
    .from("invoice_line_items")
    .delete()
    .eq("id", lineItemId);

  if (error) throw error;

  await recalculateInvoiceTotals(invoiceId, user.id);
  revalidatePath(`/invoices/${invoiceId}`);
}

async function recalculateInvoiceTotals(invoiceId: string, userId: string) {
  const supabase = await createClient();

  const { data: items } = await supabase
    .from("invoice_line_items")
    .select("quantity, unit_price")
    .eq("invoice_id", invoiceId);

  const subtotal = (items || []).reduce((sum, item) => sum + item.quantity * item.unit_price, 0);

  const { data: invoice } = await supabase
    .from("invoices")
    .select("tax_rate")
    .eq("id", invoiceId)
    .eq("user_id", userId)
    .single();

  const taxRate = invoice?.tax_rate || 0;
  const taxAmount = subtotal * (taxRate / 100);
  const total = subtotal + taxAmount;

  await supabase
    .from("invoices")
    .update({ subtotal, tax_amount: taxAmount, total })
    .eq("id", invoiceId)
    .eq("user_id", userId);
}

export async function updateInvoiceStatusAction(id: string, status: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const updates: Record<string, unknown> = { status };
  if (status === "sent") updates.sent_at = new Date().toISOString();
  if (status === "paid") updates.paid_at = new Date().toISOString();

  const { error } = await supabase
    .from("invoices")
    .update(updates)
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) throw error;

  revalidatePath("/invoices");
  revalidatePath(`/invoices/${id}`);
}

export async function deleteInvoiceAction(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { error } = await supabase
    .from("invoices")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) throw error;

  revalidatePath("/invoices");
}

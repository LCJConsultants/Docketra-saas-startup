import { notFound } from "next/navigation";
import { getInvoice, updateInvoiceStatusAction } from "@/actions/invoices";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/shared/page-header";
import { InvoicePreview } from "@/components/invoices/invoice-preview";
import { Button } from "@/components/ui/button";
import { Send, CheckCircle, Ban, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default async function InvoiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  let invoice;
  try {
    invoice = await getInvoice(id);
  } catch {
    notFound();
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  let profile = null;
  if (user) {
    const { data } = await supabase.from("profiles").select("full_name, firm_name, email").eq("id", user.id).single();
    profile = data;
  }

  async function markSent() {
    "use server";
    await updateInvoiceStatusAction(id, "sent");
  }
  async function markPaid() {
    "use server";
    await updateInvoiceStatusAction(id, "paid");
  }
  async function markVoid() {
    "use server";
    await updateInvoiceStatusAction(id, "void");
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Invoice ${invoice.invoice_number}`}
        action={
          <div className="flex items-center gap-2">
            <Link href="/invoices">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </Link>
            {invoice.status === "draft" && (
              <form action={markSent}>
                <Button size="sm" type="submit">
                  <Send className="h-4 w-4 mr-2" />
                  Mark as Sent
                </Button>
              </form>
            )}
            {(invoice.status === "sent" || invoice.status === "overdue") && (
              <form action={markPaid}>
                <Button size="sm" variant="accent" type="submit">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Mark as Paid
                </Button>
              </form>
            )}
            {invoice.status !== "void" && invoice.status !== "paid" && (
              <form action={markVoid}>
                <Button size="sm" variant="outline" type="submit">
                  <Ban className="h-4 w-4 mr-2" />
                  Void
                </Button>
              </form>
            )}
          </div>
        }
      />

      <InvoicePreview
        invoice={invoice}
        profile={profile || undefined}
      />
    </div>
  );
}

import { PageHeader } from "@/components/shared/page-header";
import { InvoiceBuilder } from "@/components/invoices/invoice-builder";
import { getClients } from "@/actions/clients";
import { getCases } from "@/actions/cases";
import { getTimeEntries } from "@/actions/time-entries";

export default async function NewInvoicePage() {
  const [clientsResult, casesResult, entriesResult] = await Promise.all([
    getClients(),
    getCases(),
    getTimeEntries({ unbilled: true }),
  ]);
  const clients = clientsResult.data;
  const cases = casesResult.data;
  const entries = entriesResult.data;

  return (
    <div className="space-y-6 max-w-3xl">
      <PageHeader title="New Invoice" description="Create an invoice for your client" />
      <InvoiceBuilder
        clients={clients.map((c) => ({ id: c.id, first_name: c.first_name, last_name: c.last_name }))}
        cases={cases.map((c) => ({ id: c.id, title: c.title, client_id: c.client_id }))}
        unbilledEntries={entries
          .filter((e) => !e.invoice_id)
          .map((e) => ({
            id: e.id,
            description: e.description,
            duration_minutes: e.duration_minutes,
            total_amount: e.total_amount,
            case_id: e.case_id,
          }))}
      />
    </div>
  );
}

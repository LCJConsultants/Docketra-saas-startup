import { CaseForm } from "@/components/cases/case-form";
import { PageHeader } from "@/components/shared/page-header";
import { getClients } from "@/actions/clients";

export default async function NewCasePage() {
  const clients = await getClients();

  return (
    <div className="space-y-6 max-w-2xl">
      <PageHeader title="New Case" description="Create a new legal case" />
      <CaseForm clients={clients.map((c) => ({ id: c.id, first_name: c.first_name, last_name: c.last_name }))} />
    </div>
  );
}

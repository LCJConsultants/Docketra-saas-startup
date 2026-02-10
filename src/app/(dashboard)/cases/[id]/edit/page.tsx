import { notFound } from "next/navigation";
import { getCase } from "@/actions/cases";
import { getClients } from "@/actions/clients";
import { CaseForm } from "@/components/cases/case-form";
import { PageHeader } from "@/components/shared/page-header";

export default async function EditCasePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  let caseData;
  try {
    caseData = await getCase(id);
  } catch {
    notFound();
  }

  const clients = await getClients();

  return (
    <div className="space-y-6 max-w-2xl">
      <PageHeader title="Edit Case" description={caseData.title} />
      <CaseForm
        caseData={caseData}
        clients={clients.map((c) => ({ id: c.id, first_name: c.first_name, last_name: c.last_name }))}
      />
    </div>
  );
}

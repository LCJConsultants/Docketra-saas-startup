import { notFound } from "next/navigation";
import { getClient } from "@/actions/clients";
import { ClientForm } from "@/components/clients/client-form";
import { PageHeader } from "@/components/shared/page-header";

export default async function EditClientPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  let client;
  try {
    client = await getClient(id);
  } catch {
    notFound();
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <PageHeader
        title="Edit Client"
        description={`${client.first_name} ${client.last_name}`}
      />
      <ClientForm client={client} />
    </div>
  );
}

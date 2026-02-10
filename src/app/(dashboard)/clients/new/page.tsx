import { ClientForm } from "@/components/clients/client-form";
import { PageHeader } from "@/components/shared/page-header";

export default function NewClientPage() {
  return (
    <div className="space-y-6 max-w-2xl">
      <PageHeader title="Add Client" description="Create a new client record" />
      <ClientForm />
    </div>
  );
}

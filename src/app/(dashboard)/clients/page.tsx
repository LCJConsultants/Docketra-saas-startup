import Link from "next/link";
import { Plus, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { ClientTable } from "@/components/clients/client-table";
import { getClients } from "@/actions/clients";

export default async function ClientsPage() {
  const { data: clients } = await getClients();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Clients"
        description="Manage your client directory"
        action={
          <Link href="/clients/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Client
            </Button>
          </Link>
        }
      />

      {clients.length === 0 ? (
        <EmptyState
          icon={<Users className="h-8 w-8 text-muted-foreground" />}
          title="No clients yet"
          description="Add your first client to get started with case management."
          action={
            <Link href="/clients/new">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Client
              </Button>
            </Link>
          }
        />
      ) : (
        <ClientTable clients={clients} />
      )}
    </div>
  );
}

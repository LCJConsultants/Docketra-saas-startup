import Link from "next/link";
import { notFound } from "next/navigation";
import { getClient } from "@/actions/clients";
import { getCasesByClient } from "@/actions/cases";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Pencil, Mail, Phone, MapPin, Calendar, Briefcase, Plus } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default async function ClientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  let client;
  try {
    client = await getClient(id);
  } catch {
    notFound();
  }

  const cases = await getCasesByClient(id);
  const fullName = `${client.first_name} ${client.last_name}`;

  const statusVariant: Record<string, "success" | "secondary" | "outline"> = {
    active: "success",
    inactive: "secondary",
    archived: "outline",
  };

  const caseStatusVariant: Record<string, "success" | "warning" | "secondary" | "outline"> = {
    open: "success",
    pending: "warning",
    closed: "secondary",
    archived: "outline",
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={fullName}
        description={`Client since ${formatDate(client.created_at)}`}
        action={
          <div className="flex items-center gap-2">
            <Link href={`/cases/new?client_id=${client.id}`}>
              <Button variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                New Case
              </Button>
            </Link>
            <Link href={`/clients/${client.id}/edit`}>
              <Button variant="outline">
                <Pencil className="h-4 w-4 mr-2" />
                Edit
              </Button>
            </Link>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Client Info */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Contact Info</CardTitle>
              <Badge variant={statusVariant[client.status] || "secondary"}>
                {client.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {client.email && (
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{client.email}</span>
              </div>
            )}
            {client.phone && (
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{client.phone}</span>
              </div>
            )}
            {client.address && (
              <div className="flex items-center gap-3">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{client.address}</span>
              </div>
            )}
            {client.date_of_birth && (
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">DOB: {formatDate(client.date_of_birth)}</span>
              </div>
            )}
            {client.notes && (
              <div className="pt-2 border-t">
                <p className="text-sm font-medium mb-1">Notes</p>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{client.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Cases */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Briefcase className="h-4 w-4" />
                Cases ({cases.length})
              </CardTitle>
              <Link href={`/cases/new?client_id=${client.id}`}>
                <Button variant="outline" size="sm">
                  <Plus className="h-3 w-3 mr-1" />
                  New Case
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {cases.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No cases yet for this client.
              </p>
            ) : (
              <div className="space-y-3">
                {cases.map((c) => (
                  <Link
                    key={c.id}
                    href={`/cases/${c.id}`}
                    className="block rounded-lg border p-4 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-medium text-sm">{c.title}</h4>
                      <Badge variant={caseStatusVariant[c.status] || "secondary"}>
                        {c.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      {c.case_number && <span>#{c.case_number}</span>}
                      <span className="capitalize">{c.case_type}</span>
                      <span>Opened {formatDate(c.date_opened)}</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

import Link from "next/link";
import { Plus, Receipt } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { getInvoices } from "@/actions/invoices";
import { formatDate, formatCurrency } from "@/lib/utils";

const statusColors: Record<string, "success" | "warning" | "secondary" | "destructive" | "outline"> = {
  draft: "secondary",
  sent: "warning",
  paid: "success",
  overdue: "destructive",
  void: "outline",
};

export default async function InvoicesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const params = await searchParams;
  const { data: invoices } = await getInvoices({ status: params.status });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Invoices"
        description="Create and manage client invoices"
        action={
          <Link href="/invoices/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Invoice
            </Button>
          </Link>
        }
      />

      {/* Filters */}
      <div className="flex items-center gap-2 flex-wrap">
        <Link href="/invoices">
          <Button variant={!params.status ? "default" : "outline"} size="sm">All</Button>
        </Link>
        {["draft", "sent", "paid", "overdue"].map((status) => (
          <Link key={status} href={`/invoices?status=${status}`}>
            <Button variant={params.status === status ? "default" : "outline"} size="sm" className="capitalize">
              {status}
            </Button>
          </Link>
        ))}
      </div>

      {invoices.length === 0 ? (
        <EmptyState
          icon={<Receipt className="h-8 w-8 text-muted-foreground" />}
          title="No invoices yet"
          description="Create your first invoice to start billing clients."
          action={
            <Link href="/invoices/new">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Invoice
              </Button>
            </Link>
          }
        />
      ) : (
        <div className="space-y-3">
          {invoices.map((inv) => (
            <Link key={inv.id} href={`/invoices/${inv.id}`}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div>
                        <p className="font-mono text-sm font-medium">{inv.invoice_number}</p>
                        <p className="text-sm text-muted-foreground">
                          {inv.client
                            ? `${inv.client.first_name} ${inv.client.last_name}`
                            : "Unknown client"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-lg font-semibold">{formatCurrency(inv.total)}</p>
                        {inv.due_date && (
                          <p className="text-xs text-muted-foreground">
                            Due {formatDate(inv.due_date)}
                          </p>
                        )}
                      </div>
                      <Badge variant={statusColors[inv.status] || "secondary"} className="capitalize">
                        {inv.status}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

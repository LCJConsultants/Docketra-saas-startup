"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate, formatCurrency } from "@/lib/utils";

interface InvoicePreviewProps {
  invoice: {
    invoice_number: string;
    status: string;
    subtotal: number;
    tax_rate: number;
    tax_amount: number;
    total: number;
    notes: string | null;
    due_date: string | null;
    created_at: string;
    client: { first_name: string; last_name: string; email: string | null; address: string | null } | null;
    case: { title: string } | null;
    line_items: Array<{
      id: string;
      description: string;
      quantity: number;
      unit_price: number;
      amount: number;
    }>;
  };
  profile?: { full_name: string; firm_name: string | null; email: string };
}

const statusColors: Record<string, "success" | "warning" | "secondary" | "destructive" | "outline"> = {
  draft: "secondary",
  sent: "warning",
  paid: "success",
  overdue: "destructive",
  void: "outline",
};

export function InvoicePreview({ invoice, profile }: InvoicePreviewProps) {
  return (
    <Card className="max-w-3xl">
      <CardContent className="p-8">
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-primary">INVOICE</h1>
            <p className="text-sm text-muted-foreground font-mono mt-1">
              {invoice.invoice_number}
            </p>
          </div>
          <Badge variant={statusColors[invoice.status] || "secondary"} className="text-xs uppercase">
            {invoice.status}
          </Badge>
        </div>

        {/* From / To */}
        <div className="grid grid-cols-2 gap-8 mb-8">
          <div>
            <p className="text-xs text-muted-foreground uppercase font-medium mb-2">From</p>
            <p className="font-medium">{profile?.firm_name || profile?.full_name}</p>
            <p className="text-sm text-muted-foreground">{profile?.email}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase font-medium mb-2">Bill To</p>
            {invoice.client && (
              <>
                <p className="font-medium">
                  {invoice.client.first_name} {invoice.client.last_name}
                </p>
                {invoice.client.email && (
                  <p className="text-sm text-muted-foreground">{invoice.client.email}</p>
                )}
                {invoice.client.address && (
                  <p className="text-sm text-muted-foreground">{invoice.client.address}</p>
                )}
              </>
            )}
          </div>
        </div>

        {/* Details */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div>
            <p className="text-xs text-muted-foreground">Date</p>
            <p className="text-sm font-medium">{formatDate(invoice.created_at)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Due Date</p>
            <p className="text-sm font-medium">
              {invoice.due_date ? formatDate(invoice.due_date) : "On receipt"}
            </p>
          </div>
          {invoice.case && (
            <div>
              <p className="text-xs text-muted-foreground">Case</p>
              <p className="text-sm font-medium">{invoice.case.title}</p>
            </div>
          )}
        </div>

        {/* Line Items */}
        <table className="w-full mb-6">
          <thead>
            <tr className="border-b">
              <th className="text-left py-2 text-xs text-muted-foreground font-medium">Description</th>
              <th className="text-right py-2 text-xs text-muted-foreground font-medium w-20">Qty</th>
              <th className="text-right py-2 text-xs text-muted-foreground font-medium w-24">Rate</th>
              <th className="text-right py-2 text-xs text-muted-foreground font-medium w-24">Amount</th>
            </tr>
          </thead>
          <tbody>
            {invoice.line_items.map((item) => (
              <tr key={item.id} className="border-b last:border-0">
                <td className="py-3 text-sm">{item.description}</td>
                <td className="py-3 text-sm text-right">{item.quantity}</td>
                <td className="py-3 text-sm text-right">{formatCurrency(item.unit_price)}</td>
                <td className="py-3 text-sm text-right font-medium">{formatCurrency(item.amount)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div className="border-t pt-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Subtotal</span>
            <span>{formatCurrency(invoice.subtotal)}</span>
          </div>
          {invoice.tax_rate > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Tax ({invoice.tax_rate}%)</span>
              <span>{formatCurrency(invoice.tax_amount)}</span>
            </div>
          )}
          <div className="flex justify-between text-lg font-semibold pt-2 border-t">
            <span>Total</span>
            <span>{formatCurrency(invoice.total)}</span>
          </div>
        </div>

        {/* Notes */}
        {invoice.notes && (
          <div className="mt-6 pt-4 border-t">
            <p className="text-xs text-muted-foreground font-medium mb-1">Notes</p>
            <p className="text-sm text-muted-foreground">{invoice.notes}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

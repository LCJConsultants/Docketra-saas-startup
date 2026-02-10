"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { createInvoiceAction, addLineItemAction } from "@/actions/invoices";
import { toast } from "sonner";
import type { Client, Case } from "@/types";

interface InvoiceBuilderProps {
  clients: Pick<Client, "id" | "first_name" | "last_name">[];
  cases: Pick<Case, "id" | "title" | "client_id">[];
  unbilledEntries?: Array<{
    id: string;
    description: string;
    duration_minutes: number;
    amount: number | null;
    case_id: string;
  }>;
}

interface LineItem {
  description: string;
  quantity: number;
  unit_price: number;
  time_entry_id?: string;
}

export function InvoiceBuilder({ clients, cases, unbilledEntries = [] }: InvoiceBuilderProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState("");
  const [selectedCaseId, setSelectedCaseId] = useState("");
  const [lineItems, setLineItems] = useState<LineItem[]>([]);
  const [notes, setNotes] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [taxRate, setTaxRate] = useState("0");

  const filteredCases = selectedClientId
    ? cases.filter((c) => c.client_id === selectedClientId)
    : cases;

  const addLineItem = () => {
    setLineItems([...lineItems, { description: "", quantity: 1, unit_price: 0 }]);
  };

  const updateLineItem = (index: number, field: keyof LineItem, value: string | number) => {
    const updated = [...lineItems];
    (updated[index] as unknown as Record<string, unknown>)[field] = value;
    setLineItems(updated);
  };

  const removeLineItem = (index: number) => {
    setLineItems(lineItems.filter((_, i) => i !== index));
  };

  const importTimeEntries = () => {
    const items = unbilledEntries
      .filter((e) => !selectedCaseId || e.case_id === selectedCaseId)
      .map((e) => ({
        description: e.description,
        quantity: 1,
        unit_price: e.amount || 0,
        time_entry_id: e.id,
      }));
    setLineItems([...lineItems, ...items]);
  };

  const subtotal = lineItems.reduce((sum, item) => sum + item.quantity * item.unit_price, 0);
  const tax = subtotal * (parseFloat(taxRate) / 100);
  const total = subtotal + tax;

  const handleSubmit = async () => {
    if (!selectedClientId) {
      toast.error("Select a client");
      return;
    }
    if (lineItems.length === 0) {
      toast.error("Add at least one line item");
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.set("client_id", selectedClientId);
      formData.set("case_id", selectedCaseId);
      formData.set("notes", notes);
      formData.set("due_date", dueDate);
      formData.set("tax_rate", taxRate);

      const invoice = await createInvoiceAction(formData);

      // Add line items
      for (const item of lineItems) {
        await addLineItemAction(invoice.id, {
          description: item.description,
          quantity: item.quantity,
          unit_price: item.unit_price,
          time_entry_id: item.time_entry_id,
        });
      }

      toast.success("Invoice created");
      router.push(`/invoices/${invoice.id}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>New Invoice</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Client *</Label>
              <Select value={selectedClientId} onValueChange={setSelectedClientId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select client" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.first_name} {c.last_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Case (optional)</Label>
              <Select value={selectedCaseId} onValueChange={setSelectedCaseId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select case" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">No case</SelectItem>
                  {filteredCases.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Due Date</Label>
              <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Tax Rate (%)</Label>
              <Input type="number" step="0.01" min="0" max="100" value={taxRate} onChange={(e) => setTaxRate(e.target.value)} />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Notes</Label>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Line Items</CardTitle>
          <div className="flex gap-2">
            {unbilledEntries.length > 0 && (
              <Button variant="outline" size="sm" onClick={importTimeEntries}>
                Import Time Entries
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={addLineItem}>
              <Plus className="h-3 w-3 mr-1" />
              Add Item
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {lineItems.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No line items. Click &quot;Add Item&quot; or &quot;Import Time Entries&quot;.
            </p>
          ) : (
            <div className="space-y-3">
              {lineItems.map((item, index) => (
                <div key={index} className="grid grid-cols-12 gap-2 items-end">
                  <div className="col-span-5">
                    {index === 0 && <Label className="text-xs">Description</Label>}
                    <Input
                      value={item.description}
                      onChange={(e) => updateLineItem(index, "description", e.target.value)}
                      placeholder="Description"
                    />
                  </div>
                  <div className="col-span-2">
                    {index === 0 && <Label className="text-xs">Qty</Label>}
                    <Input
                      type="number"
                      min="0.01"
                      step="0.01"
                      value={item.quantity}
                      onChange={(e) => updateLineItem(index, "quantity", parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <div className="col-span-2">
                    {index === 0 && <Label className="text-xs">Price</Label>}
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={item.unit_price}
                      onChange={(e) => updateLineItem(index, "unit_price", parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <div className="col-span-2 text-right">
                    {index === 0 && <Label className="text-xs">Amount</Label>}
                    <p className="h-10 flex items-center justify-end text-sm font-medium">
                      ${(item.quantity * item.unit_price).toFixed(2)}
                    </p>
                  </div>
                  <div className="col-span-1">
                    <Button variant="ghost" size="icon" className="h-10 w-10" onClick={() => removeLineItem(index)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}

              <div className="border-t pt-3 space-y-1 text-right">
                <p className="text-sm">Subtotal: <span className="font-medium">${subtotal.toFixed(2)}</span></p>
                {parseFloat(taxRate) > 0 && (
                  <p className="text-sm">Tax ({taxRate}%): <span className="font-medium">${tax.toFixed(2)}</span></p>
                )}
                <p className="text-lg font-semibold">Total: ${total.toFixed(2)}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Button onClick={handleSubmit} disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Create Invoice
        </Button>
        <Button variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </div>
  );
}

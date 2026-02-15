"use client";

import { useState } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertTriangle, Loader2, Download } from "lucide-react";
import { deleteAccountAction } from "@/actions/settings";
import { toast } from "sonner";

function ExportDataButton() {
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    setExporting(true);
    try {
      const response = await fetch("/api/data-export");
      if (!response.ok) throw new Error("Export failed");
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `docketra-export-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("Data exported successfully");
    } catch {
      toast.error("Failed to export data");
    } finally {
      setExporting(false);
    }
  };

  return (
    <Button variant="outline" onClick={handleExport} disabled={exporting}>
      {exporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
      Download My Data
    </Button>
  );
}

export default function AccountSettingsPage() {
  const [confirmation, setConfirmation] = useState("");
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (confirmation !== "DELETE") return;
    setLoading(true);
    try {
      await deleteAccountAction();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete account");
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <PageHeader title="Account" description="Manage your account settings" />

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Download className="h-5 w-5" />
            Export Data
          </CardTitle>
          <CardDescription>
            Download a copy of all your data including cases, clients, documents, and more.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ExportDataButton />
        </CardContent>
      </Card>

      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Delete Account
          </CardTitle>
          <CardDescription>
            Permanently delete your account and all associated data. This action cannot be undone.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg bg-destructive/10 p-4 text-sm space-y-2">
            <p className="font-medium text-destructive">This will permanently delete:</p>
            <ul className="list-disc list-inside text-muted-foreground space-y-1">
              <li>All your cases, clients, and documents</li>
              <li>All calendar events and time entries</li>
              <li>All invoices and billing records</li>
              <li>All email history and templates</li>
              <li>Your profile and notification preferences</li>
            </ul>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmation">
              Type <span className="font-mono font-bold">DELETE</span> to confirm
            </Label>
            <Input
              id="confirmation"
              value={confirmation}
              onChange={(e) => setConfirmation(e.target.value)}
              placeholder="Type DELETE to confirm"
              className={confirmation === "DELETE" ? "border-destructive" : ""}
            />
          </div>

          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={confirmation !== "DELETE" || loading}
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Permanently Delete Account
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

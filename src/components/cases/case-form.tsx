"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FieldError } from "@/components/shared/field-error";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { createCaseAction, updateCaseAction } from "@/actions/cases";
import { toast } from "sonner";
import type { Case, Client } from "@/types";

interface CaseFormProps {
  caseData?: Case;
  clients: Pick<Client, "id" | "first_name" | "last_name">[];
}

interface FormErrors {
  client_id?: string;
  title?: string;
}

export function CaseForm({ caseData, clients }: CaseFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const isEditing = !!caseData;
  const defaultClientId = searchParams.get("client_id") || caseData?.client_id || "";

  const validate = (formData: FormData): FormErrors => {
    const errs: FormErrors = {};
    const clientId = (formData.get("client_id") as string)?.trim();
    const title = (formData.get("title") as string)?.trim();

    if (!clientId) errs.client_id = "Please select a client";
    if (!title) errs.title = "Case title is required";
    return errs;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const errs = validate(formData);
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setLoading(true);
    try {
      if (isEditing) {
        await updateCaseAction(caseData.id, formData);
        toast.success("Case updated successfully");
        router.push(`/cases/${caseData.id}`);
      } else {
        const newCase = await createCaseAction(formData);
        toast.success("Case created successfully");
        router.push(`/cases/${newCase.id}`);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      <Card>
        <CardHeader>
          <CardTitle>{isEditing ? "Edit Case" : "New Case"}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="client_id">Client *</Label>
              <Select name="client_id" defaultValue={defaultClientId}>
                <SelectTrigger className={errors.client_id ? "border-destructive" : ""}>
                  <SelectValue placeholder="Select a client" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.first_name} {client.last_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FieldError message={errors.client_id} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="case_type">Case Type *</Label>
              <Select name="case_type" defaultValue={caseData?.case_type || "civil"}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="criminal">Criminal</SelectItem>
                  <SelectItem value="civil">Civil</SelectItem>
                  <SelectItem value="divorce">Divorce</SelectItem>
                  <SelectItem value="custody">Custody</SelectItem>
                  <SelectItem value="mediation">Mediation</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Case Title *</Label>
              <Input
                id="title"
                name="title"
                placeholder="Smith v. Jones"
                defaultValue={caseData?.title}
                aria-invalid={!!errors.title}
                className={errors.title ? "border-destructive" : ""}
                onChange={() => errors.title && setErrors((e) => ({ ...e, title: undefined }))}
              />
              <FieldError message={errors.title} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="case_number">Case Number</Label>
              <Input
                id="case_number"
                name="case_number"
                placeholder="2024-CV-001234"
                defaultValue={caseData?.case_number || ""}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select name="status" defaultValue={caseData?.status || "open"}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="statute_of_limitations">Statute of Limitations</Label>
              <Input
                id="statute_of_limitations"
                name="statute_of_limitations"
                type="date"
                defaultValue={caseData?.statute_of_limitations || ""}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="court_name">Court</Label>
              <Input
                id="court_name"
                name="court_name"
                defaultValue={caseData?.court_name || ""}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="judge_name">Judge</Label>
              <Input
                id="judge_name"
                name="judge_name"
                defaultValue={caseData?.judge_name || ""}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="opposing_party">Opposing Party</Label>
              <Input
                id="opposing_party"
                name="opposing_party"
                defaultValue={caseData?.opposing_party || ""}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="opposing_counsel">Opposing Counsel</Label>
              <Input
                id="opposing_counsel"
                name="opposing_counsel"
                defaultValue={caseData?.opposing_counsel || ""}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tags">Tags (comma-separated)</Label>
            <Input
              id="tags"
              name="tags"
              placeholder="personal injury, auto accident"
              defaultValue={caseData?.tags?.join(", ") || ""}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              defaultValue={caseData?.description || ""}
              rows={4}
            />
          </div>

          <div className="flex items-center gap-3 pt-4">
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditing ? "Save Changes" : "Create Case"}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}

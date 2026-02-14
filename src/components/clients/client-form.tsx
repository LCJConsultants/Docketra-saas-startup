"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FieldError } from "@/components/shared/field-error";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { createClientAction, updateClientAction } from "@/actions/clients";
import { toast } from "sonner";
import type { Client } from "@/types";

interface ClientFormProps {
  client?: Client;
}

interface FormErrors {
  first_name?: string;
  last_name?: string;
  email?: string;
}

export function ClientForm({ client }: ClientFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const isEditing = !!client;

  const validate = (formData: FormData): FormErrors => {
    const errs: FormErrors = {};
    const firstName = (formData.get("first_name") as string)?.trim();
    const lastName = (formData.get("last_name") as string)?.trim();
    const email = (formData.get("email") as string)?.trim();

    if (!firstName) errs.first_name = "First name is required";
    if (!lastName) errs.last_name = "Last name is required";
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errs.email = "Please enter a valid email address";
    }
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
        await updateClientAction(client.id, formData);
        toast.success("Client updated successfully");
        router.push(`/clients/${client.id}`);
      } else {
        const newClient = await createClientAction(formData);
        toast.success("Client created successfully");
        router.push(`/clients/${newClient.id}`);
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
          <CardTitle>{isEditing ? "Edit Client" : "New Client"}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="first_name">First Name *</Label>
              <Input
                id="first_name"
                name="first_name"
                defaultValue={client?.first_name}
                aria-invalid={!!errors.first_name}
                className={errors.first_name ? "border-destructive" : ""}
                onChange={() => errors.first_name && setErrors((e) => ({ ...e, first_name: undefined }))}
              />
              <FieldError message={errors.first_name} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="last_name">Last Name *</Label>
              <Input
                id="last_name"
                name="last_name"
                defaultValue={client?.last_name}
                aria-invalid={!!errors.last_name}
                className={errors.last_name ? "border-destructive" : ""}
                onChange={() => errors.last_name && setErrors((e) => ({ ...e, last_name: undefined }))}
              />
              <FieldError message={errors.last_name} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                defaultValue={client?.email || ""}
                aria-invalid={!!errors.email}
                className={errors.email ? "border-destructive" : ""}
                onChange={() => errors.email && setErrors((e) => ({ ...e, email: undefined }))}
              />
              <FieldError message={errors.email} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                name="phone"
                defaultValue={client?.phone || ""}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date_of_birth">Date of Birth</Label>
              <Input
                id="date_of_birth"
                name="date_of_birth"
                type="date"
                defaultValue={client?.date_of_birth || ""}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select name="status" defaultValue={client?.status || "active"}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              name="address"
              defaultValue={client?.address || ""}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              name="notes"
              defaultValue={client?.notes || ""}
              rows={4}
            />
          </div>

          <div className="flex items-center gap-3 pt-4">
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditing ? "Save Changes" : "Create Client"}
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

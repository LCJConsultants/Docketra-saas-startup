"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/page-header";
import { FieldError } from "@/components/shared/field-error";
import { createTemplateAction } from "@/actions/templates";
import { toast } from "sonner";

const practiceAreas = [
  "criminal",
  "civil",
  "family",
  "corporate",
  "immigration",
  "real_estate",
  "personal_injury",
  "bankruptcy",
  "employment",
  "intellectual_property",
  "tax",
  "other",
];

interface FormErrors {
  title?: string;
  content?: string;
}

export default function NewTemplatePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  const validate = (formData: FormData): FormErrors => {
    const errs: FormErrors = {};
    const title = (formData.get("title") as string)?.trim();
    const content = (formData.get("content") as string)?.trim();

    if (!title) errs.title = "Template title is required";
    if (!content) errs.content = "Template content is required";
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
      await createTemplateAction(formData);
      toast.success("Template created successfully");
      router.push(`/templates`);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <PageHeader
        title="New Template"
        description="Create a reusable document template"
      />

      <form onSubmit={handleSubmit} noValidate>
        <Card>
          <CardHeader>
            <CardTitle>Template Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                name="title"
                placeholder="Motion to Dismiss"
                aria-invalid={!!errors.title}
                className={errors.title ? "border-destructive" : ""}
                onChange={() => errors.title && setErrors((e) => ({ ...e, title: undefined }))}
              />
              <FieldError message={errors.title} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select name="category" defaultValue="motion" required>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="motion">Motion</SelectItem>
                    <SelectItem value="pleading">Pleading</SelectItem>
                    <SelectItem value="letter">Letter</SelectItem>
                    <SelectItem value="contract">Contract</SelectItem>
                    <SelectItem value="agreement">Agreement</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="practice_area">Practice Area</Label>
                <Select name="practice_area">
                  <SelectTrigger>
                    <SelectValue placeholder="Select practice area" />
                  </SelectTrigger>
                  <SelectContent>
                    {practiceAreas.map((area) => (
                      <SelectItem key={area} value={area}>
                        <span className="capitalize">
                          {area.replace(/_/g, " ")}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">Content *</Label>
              <Textarea
                id="content"
                name="content"
                placeholder="Enter your template content here. Use [PLACEHOLDER] for variable fields..."
                rows={16}
                aria-invalid={!!errors.content}
                className={errors.content ? "border-destructive" : ""}
                onChange={() => errors.content && setErrors((e) => ({ ...e, content: undefined }))}
              />
              <FieldError message={errors.content} />
              <p className="text-xs text-muted-foreground">
                Use [BRACKETS] to mark placeholder fields that will be filled in
                when using the template.
              </p>
            </div>

            <div className="flex items-center gap-3 pt-4">
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Template
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}

"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Trash2, FileUp, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/shared/page-header";
import { getTemplate, deleteTemplateAction } from "@/actions/templates";
import { toast } from "sonner";
import { formatDate } from "@/lib/utils";
import type { DocumentTemplate } from "@/types";

const categoryVariant: Record<string, "default" | "secondary" | "info" | "success" | "warning" | "outline"> = {
  motion: "default",
  pleading: "info",
  letter: "secondary",
  contract: "success",
  agreement: "warning",
  other: "outline",
};

export default function TemplateDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [template, setTemplate] = useState<DocumentTemplate | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    params.then(({ id }) => {
      getTemplate(id)
        .then(setTemplate)
        .catch(() => router.replace("/templates"))
        .finally(() => setLoading(false));
    });
  }, [params, router]);

  const handleDelete = async () => {
    if (!template || template.is_system) return;
    if (!confirm("Delete this template? This action cannot be undone.")) return;

    setDeleting(true);
    try {
      await deleteTemplateAction(template.id);
      toast.success("Template deleted");
      router.push("/templates");
    } catch {
      toast.error("Failed to delete template");
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!template) return null;

  const fileName = template.file_path
    ?.split("/")
    .pop()
    ?.replace(/^\d+-/, "");

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-2">
        <Link
          href="/templates"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Templates
        </Link>
      </div>

      <PageHeader
        title={template.title}
        description={`Created ${formatDate(template.created_at)}`}
        action={
          !template.is_system ? (
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4 mr-2" />
              )}
              Delete
            </Button>
          ) : undefined
        }
      />

      {/* Metadata */}
      <div className="flex items-center gap-2 flex-wrap">
        <Badge variant={categoryVariant[template.category] ?? "outline"} className="capitalize">
          {template.category}
        </Badge>
        {template.practice_area && (
          <Badge variant="outline" className="capitalize">
            {template.practice_area.replace(/_/g, " ")}
          </Badge>
        )}
        {template.is_system && (
          <Badge variant="secondary">System Template</Badge>
        )}
        {fileName && (
          <Badge variant="outline" className="gap-1">
            <FileUp className="h-3 w-3" />
            {fileName}
          </Badge>
        )}
      </div>

      {/* Content */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Template Content</CardTitle>
        </CardHeader>
        <CardContent>
          {template.content ? (
            <pre className="text-sm text-muted-foreground whitespace-pre-wrap font-sans leading-relaxed max-h-[600px] overflow-y-auto">
              {template.content}
            </pre>
          ) : (
            <p className="text-sm text-muted-foreground italic">
              No text content available.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { MoreVertical, Eye, Download, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FileIcon } from "@/components/shared/file-icon";
import { formatDate } from "@/lib/utils";
import { deleteDocumentAction } from "@/actions/documents";
import type { Document, DocumentCategory } from "@/types";

interface DocumentListProps {
  documents: Document[];
}

const categoryBadgeVariant: Record<
  DocumentCategory,
  "default" | "secondary" | "info" | "success" | "warning" | "destructive" | "outline"
> = {
  motion: "default",
  pleading: "info",
  correspondence: "secondary",
  contract: "success",
  evidence: "warning",
  other: "outline",
};

function formatFileSize(bytes: number | null): string {
  if (!bytes) return "";
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export function DocumentList({ documents }: DocumentListProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this document?")) return;
    setDeletingId(id);
    try {
      startTransition(async () => {
        await deleteDocumentAction(id);
        router.refresh();
      });
    } catch (err) {
      console.error("Failed to delete document:", err);
    } finally {
      setDeletingId(null);
    }
  };

  const handleView = (doc: Document) => {
    if (doc.storage_path) {
      // Open the Supabase storage URL in a new tab
      const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/documents/${doc.storage_path}`;
      window.open(url, "_blank");
    }
  };

  const handleDownload = (doc: Document) => {
    if (doc.storage_path) {
      const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/documents/${doc.storage_path}`;
      const a = document.createElement("a");
      a.href = url;
      a.download = doc.file_name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {documents.map((doc) => (
        <Card
          key={doc.id}
          className={`transition-opacity ${
            deletingId === doc.id && isPending ? "opacity-50" : ""
          }`}
        >
          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-start gap-3 min-w-0">
                <div className="flex-shrink-0 mt-0.5">
                  <FileIcon
                    fileType={doc.file_type || doc.file_name}
                    className="h-8 w-8"
                  />
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-medium leading-tight truncate">
                    {doc.title}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5 truncate">
                    {doc.file_name}
                  </p>
                </div>
              </div>

              {/* Actions dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleView(doc)}>
                    <Eye className="h-4 w-4 mr-2" />
                    View
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleDownload(doc)}>
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive"
                    onClick={() => handleDelete(doc.id)}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Metadata row */}
            <div className="flex items-center gap-2 mt-3 flex-wrap">
              {doc.category && (
                <Badge
                  variant={categoryBadgeVariant[doc.category] ?? "outline"}
                  className="capitalize text-[10px]"
                >
                  {doc.category}
                </Badge>
              )}
              {doc.file_size && (
                <span className="text-[10px] text-muted-foreground">
                  {formatFileSize(doc.file_size)}
                </span>
              )}
            </div>

            <p className="text-[10px] text-muted-foreground mt-2">
              {formatDate(doc.created_at)}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

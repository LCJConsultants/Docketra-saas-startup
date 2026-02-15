"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { MoreVertical, Eye, Trash2, FileText, FileDown } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmDeleteDialog } from "@/components/shared/confirm-delete-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
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
  const [viewingDoc, setViewingDoc] = useState<Document | null>(null);

  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!confirmDeleteId) return;
    setDeletingId(confirmDeleteId);
    try {
      startTransition(async () => {
        await deleteDocumentAction(confirmDeleteId);
        router.refresh();
      });
    } catch (err) {
      console.error("Failed to delete document:", err);
    } finally {
      setDeletingId(null);
    }
  };

  const handleView = async (doc: Document) => {
    if (doc.source === "ai_draft" && doc.ocr_text) {
      setViewingDoc(doc);
    } else if (doc.storage_path) {
      try {
        const res = await fetch("/api/documents/signed-url", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ storagePath: doc.storage_path }),
        });
        if (!res.ok) throw new Error("Failed to get download URL");
        const { url } = await res.json();
        window.open(url, "_blank");
      } catch {
        toast.error("Failed to open document");
      }
    }
  };

  const handleExport = async (doc: Document, format: "word" | "pdf") => {
    const endpoint = format === "word" ? "/api/documents/export" : "/api/documents/export-pdf";
    const ext = format === "word" ? ".docx" : ".pdf";

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ documentId: doc.id }),
      });

      if (!response.ok) throw new Error("Export failed");

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = doc.title.replace(/[^a-zA-Z0-9\s]/g, "").replace(/\s+/g, "_") + ext;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      toast.error(`Failed to export as ${format === "word" ? "Word" : "PDF"}`);
    }
  };

  return (
    <>
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
                      {doc.source === "ai_draft" ? "AI Draft" : doc.file_name}
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
                    <DropdownMenuItem onClick={() => handleExport(doc, "word")}>
                      <FileText className="h-4 w-4 mr-2" />
                      Download as Word
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleExport(doc, "pdf")}>
                      <FileDown className="h-4 w-4 mr-2" />
                      Download as PDF
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-destructive focus:text-destructive"
                      onClick={() => setConfirmDeleteId(doc.id)}
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
                {doc.source === "ai_draft" && (
                  <Badge variant="secondary" className="text-[10px]">
                    AI Draft
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

      <ConfirmDeleteDialog
        open={!!confirmDeleteId}
        onOpenChange={(open) => !open && setConfirmDeleteId(null)}
        title="Delete document?"
        description="This will permanently delete this document. This action cannot be undone."
        onConfirm={handleDelete}
      />

      {/* Document Viewer Dialog for AI Drafts */}
      <Dialog open={!!viewingDoc} onOpenChange={() => setViewingDoc(null)}>
        <DialogContent className="max-w-3xl max-h-[85vh]">
          <DialogHeader>
            <DialogTitle>{viewingDoc?.title}</DialogTitle>
            <DialogDescription>
              AI-generated document. Review carefully before filing or sending.
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh]">
            <div className="prose prose-sm max-w-none whitespace-pre-wrap text-sm p-2">
              {viewingDoc?.ocr_text}
            </div>
          </ScrollArea>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setViewingDoc(null)}>
              Close
            </Button>
            {viewingDoc && (
              <>
                <Button variant="outline" onClick={() => handleExport(viewingDoc, "pdf")}>
                  <FileDown className="h-4 w-4 mr-2" />
                  Download as PDF
                </Button>
                <Button onClick={() => handleExport(viewingDoc, "word")}>
                  <FileText className="h-4 w-4 mr-2" />
                  Download as Word
                </Button>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

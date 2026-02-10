"use client";

import { useState, useRef, useCallback } from "react";
import { Upload, File, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FileIcon } from "@/components/shared/file-icon";
import type { DocumentCategory } from "@/types";

interface SelectedFile {
  file: File;
  id: string;
  title: string;
  category: DocumentCategory;
}

interface DocumentUploaderProps {
  caseId?: string;
  clientId?: string;
  onUploadComplete?: () => void;
}

const CATEGORIES: { value: DocumentCategory; label: string }[] = [
  { value: "motion", label: "Motion" },
  { value: "pleading", label: "Pleading" },
  { value: "correspondence", label: "Correspondence" },
  { value: "contract", label: "Contract" },
  { value: "evidence", label: "Evidence" },
  { value: "other", label: "Other" },
];

function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export function DocumentUploader({
  caseId,
  clientId,
  onUploadComplete,
}: DocumentUploaderProps) {
  const [files, setFiles] = useState<SelectedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const addFiles = useCallback((newFiles: FileList | File[]) => {
    const fileArray = Array.from(newFiles);
    const selected: SelectedFile[] = fileArray.map((file) => ({
      file,
      id: `${file.name}-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      title: file.name.replace(/\.[^/.]+$/, ""),
      category: "other" as DocumentCategory,
    }));
    setFiles((prev) => [...prev, ...selected]);
  }, []);

  const removeFile = useCallback((id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  }, []);

  const updateFile = useCallback(
    (id: string, updates: Partial<Pick<SelectedFile, "title" | "category">>) => {
      setFiles((prev) =>
        prev.map((f) => (f.id === id ? { ...f, ...updates } : f))
      );
    },
    []
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      if (e.dataTransfer.files.length > 0) {
        addFiles(e.dataTransfer.files);
      }
    },
    [addFiles]
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        addFiles(e.target.files);
        // Reset input so the same file(s) can be selected again
        e.target.value = "";
      }
    },
    [addFiles]
  );

  const handleSubmit = async () => {
    if (files.length === 0) return;
    setIsUploading(true);

    try {
      for (const selectedFile of files) {
        const formData = new FormData();
        formData.append("file", selectedFile.file);
        formData.append("title", selectedFile.title);
        formData.append("category", selectedFile.category);
        if (caseId) formData.append("case_id", caseId);
        if (clientId) formData.append("client_id", clientId);

        const res = await fetch("/api/documents/upload", {
          method: "POST",
          body: formData,
        });

        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          throw new Error(errorData.error || "Upload failed");
        }
      }

      setFiles([]);
      onUploadComplete?.();
    } catch (err) {
      console.error("Upload error:", err);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Drop zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`
          relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed
          px-6 py-10 cursor-pointer transition-colors
          ${
            isDragging
              ? "border-primary bg-primary/5"
              : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50"
          }
        `}
      >
        <Upload className="h-10 w-10 text-muted-foreground mb-3" />
        <p className="text-sm font-medium">
          Drag and drop files here, or click to browse
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          PDF, DOCX, images, and more
        </p>
        <input
          ref={inputRef}
          type="file"
          multiple
          className="hidden"
          onChange={handleFileSelect}
          accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.ppt,.pptx,.txt,.jpg,.jpeg,.png,.gif,.webp,.svg,.mp4,.mov,.mp3,.wav,.zip,.rar"
        />
      </div>

      {/* File preview list */}
      {files.length > 0 && (
        <div className="space-y-3">
          {files.map((selectedFile) => (
            <Card key={selectedFile.id}>
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  {/* File icon */}
                  <div className="flex-shrink-0 mt-1">
                    <FileIcon
                      fileType={selectedFile.file.type || selectedFile.file.name}
                      className="h-8 w-8"
                    />
                  </div>

                  {/* File info + editable fields */}
                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex items-center gap-2">
                      <File className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                      <span className="text-xs text-muted-foreground truncate">
                        {selectedFile.file.name}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        ({formatFileSize(selectedFile.file.size)})
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div>
                        <Label htmlFor={`title-${selectedFile.id}`} className="text-xs">
                          Title
                        </Label>
                        <Input
                          id={`title-${selectedFile.id}`}
                          value={selectedFile.title}
                          onChange={(e) =>
                            updateFile(selectedFile.id, { title: e.target.value })
                          }
                          className="h-8 text-sm"
                        />
                      </div>
                      <div>
                        <Label
                          htmlFor={`category-${selectedFile.id}`}
                          className="text-xs"
                        >
                          Category
                        </Label>
                        <Select
                          value={selectedFile.category}
                          onValueChange={(value) =>
                            updateFile(selectedFile.id, {
                              category: value as DocumentCategory,
                            })
                          }
                        >
                          <SelectTrigger className="h-8 text-sm">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {CATEGORIES.map((cat) => (
                              <SelectItem key={cat.value} value={cat.value}>
                                {cat.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  {/* Remove button */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="flex-shrink-0 h-8 w-8"
                    onClick={() => removeFile(selectedFile.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}

          <div className="flex justify-end">
            <Button onClick={handleSubmit} disabled={isUploading}>
              {isUploading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload {files.length} {files.length === 1 ? "file" : "files"}
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

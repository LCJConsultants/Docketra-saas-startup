"use client";

import { useRouter } from "next/navigation";
import { useState, useRef, useCallback } from "react";
import { Loader2, Upload, X, FileText, File as FileIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

const ACCEPTED_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/msword",
  "text/plain",
];

const ACCEPTED_EXTENSIONS = ".pdf,.docx,.doc,.txt";
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

interface FormErrors {
  title?: string;
  file?: string;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getFileIcon(fileName: string) {
  const ext = fileName.split(".").pop()?.toLowerCase();
  if (ext === "pdf") return <FileText className="h-8 w-8 text-red-500" />;
  if (ext === "docx" || ext === "doc") return <FileText className="h-8 w-8 text-blue-500" />;
  return <FileIcon className="h-8 w-8 text-muted-foreground" />;
}

export default function NewTemplatePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    if (file.size > MAX_FILE_SIZE) return "File size exceeds 10MB limit";
    if (!ACCEPTED_TYPES.includes(file.type) && !file.name.match(/\.(pdf|docx?|txt)$/i)) {
      return "Unsupported file type. Please upload PDF, DOCX, DOC, or TXT files.";
    }
    return null;
  };

  const handleFileSelect = useCallback((file: File) => {
    const error = validateFile(file);
    if (error) {
      setErrors((e) => ({ ...e, file: error }));
      return;
    }
    setSelectedFile(file);
    setErrors((e) => ({ ...e, file: undefined }));
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFileSelect(file);
    },
    [handleFileSelect]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    const title = (formData.get("title") as string)?.trim();

    const errs: FormErrors = {};
    if (!title) errs.title = "Template title is required";
    if (!selectedFile) errs.file = "Please upload a document file";
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setLoading(true);
    try {
      const uploadData = new FormData();
      uploadData.append("file", selectedFile!);
      uploadData.append("title", title);
      uploadData.append("category", formData.get("category") as string);
      const practiceArea = formData.get("practice_area") as string;
      if (practiceArea) uploadData.append("practice_area", practiceArea);

      const response = await fetch("/api/templates/upload", {
        method: "POST",
        body: uploadData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to upload template");
      }

      toast.success("Template uploaded successfully");
      router.push("/templates");
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
        title="Upload Template"
        description="Upload a document to use as a template for AI-assisted drafting"
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
                onChange={() =>
                  errors.title &&
                  setErrors((e) => ({ ...e, title: undefined }))
                }
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
              <Label>Document File *</Label>
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => fileInputRef.current?.click()}
                className={`
                  relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
                  transition-colors
                  ${dragOver ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-primary/50"}
                  ${errors.file ? "border-destructive" : ""}
                `}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept={ACCEPTED_EXTENSIONS}
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileSelect(file);
                  }}
                />

                {selectedFile ? (
                  <div className="flex items-center justify-center gap-4">
                    {getFileIcon(selectedFile.name)}
                    <div className="text-left">
                      <p className="text-sm font-medium">{selectedFile.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatFileSize(selectedFile.size)}
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 shrink-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedFile(null);
                        if (fileInputRef.current) fileInputRef.current.value = "";
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      <span className="font-medium text-foreground">
                        Click to upload
                      </span>{" "}
                      or drag and drop
                    </p>
                    <p className="text-xs text-muted-foreground">
                      PDF, DOCX, DOC, or TXT (max 10MB)
                    </p>
                  </div>
                )}
              </div>
              <FieldError message={errors.file} />
              <p className="text-xs text-muted-foreground">
                Text will be extracted from the uploaded document and used by
                the AI assistant when drafting similar documents.
              </p>
            </div>

            <div className="flex items-center gap-3 pt-4">
              <Button type="submit" disabled={loading}>
                {loading && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Upload Template
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

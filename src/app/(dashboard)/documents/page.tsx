import Link from "next/link";
import { FileText, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { DocumentList } from "@/components/documents/document-list";
import { DocumentUploader } from "@/components/documents/document-uploader";
import { getDocuments } from "@/actions/documents";
import type { DocumentCategory } from "@/types";

const CATEGORIES: { value: DocumentCategory | ""; label: string }[] = [
  { value: "", label: "All" },
  { value: "motion", label: "Motions" },
  { value: "pleading", label: "Pleadings" },
  { value: "correspondence", label: "Correspondence" },
  { value: "contract", label: "Contracts" },
  { value: "evidence", label: "Evidence" },
  { value: "other", label: "Other" },
];

export default async function DocumentsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; case_id?: string; search?: string }>;
}) {
  const params = await searchParams;
  const documents = await getDocuments({
    category: params.category,
    case_id: params.case_id,
    search: params.search,
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Documents"
        description="Upload, organize, and manage your legal documents"
        action={
          <Link href="#upload">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Upload Document
            </Button>
          </Link>
        }
      />

      {/* Upload section */}
      <div id="upload">
        <DocumentUploader />
      </div>

      {/* Category filters */}
      <div className="flex items-center gap-2 flex-wrap">
        {CATEGORIES.map((cat) => (
          <Link
            key={cat.value}
            href={
              cat.value
                ? `/documents?category=${cat.value}`
                : "/documents"
            }
          >
            <Button
              variant={
                (params.category || "") === cat.value ? "default" : "outline"
              }
              size="sm"
            >
              {cat.label}
            </Button>
          </Link>
        ))}
      </div>

      {/* Document grid or empty state */}
      {documents.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No documents found"
          description="Upload your first document to get started with document management."
          action={
            <Link href="#upload">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Upload Document
              </Button>
            </Link>
          }
        />
      ) : (
        <DocumentList documents={documents} />
      )}
    </div>
  );
}

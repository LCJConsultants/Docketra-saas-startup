import Link from "next/link";
import { Plus, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { CaseTable } from "@/components/cases/case-table";
import { getCases } from "@/actions/cases";

export default async function CasesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; case_type?: string }>;
}) {
  const params = await searchParams;
  const cases = await getCases({
    status: params.status,
    case_type: params.case_type,
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Cases"
        description="Manage all your legal cases"
        action={
          <Link href="/cases/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Case
            </Button>
          </Link>
        }
      />

      {/* Filters */}
      <div className="flex items-center gap-2 flex-wrap">
        <Link href="/cases">
          <Button variant={!params.status ? "default" : "outline"} size="sm">
            All
          </Button>
        </Link>
        {["open", "pending", "closed"].map((status) => (
          <Link key={status} href={`/cases?status=${status}`}>
            <Button
              variant={params.status === status ? "default" : "outline"}
              size="sm"
              className="capitalize"
            >
              {status}
            </Button>
          </Link>
        ))}
      </div>

      {cases.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title="No cases found"
          description="Create your first case to start managing your legal work."
          action={
            <Link href="/cases/new">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Case
              </Button>
            </Link>
          }
        />
      ) : (
        <CaseTable cases={cases} />
      )}
    </div>
  );
}

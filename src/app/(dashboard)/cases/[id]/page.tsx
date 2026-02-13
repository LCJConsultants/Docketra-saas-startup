import Link from "next/link";
import { notFound } from "next/navigation";
import { getCase } from "@/actions/cases";
import { PageHeader } from "@/components/shared/page-header";
import { CaseTabs } from "@/components/cases/case-tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Pencil, User, Scale, Gavel, Users } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { QuickActions } from "@/components/ai/quick-actions";

export default async function CaseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  let caseData;
  try {
    caseData = await getCase(id);
  } catch {
    notFound();
  }

  const statusVariant: Record<string, "success" | "warning" | "secondary" | "outline"> = {
    open: "success",
    pending: "warning",
    closed: "secondary",
    archived: "outline",
  };

  const typeColors: Record<string, string> = {
    criminal: "bg-red-100 text-red-800",
    civil: "bg-blue-100 text-blue-800",
    divorce: "bg-purple-100 text-purple-800",
    custody: "bg-pink-100 text-pink-800",
    mediation: "bg-green-100 text-green-800",
    other: "bg-gray-100 text-gray-800",
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={caseData.title}
        description={
          caseData.case_number
            ? `Case #${caseData.case_number}`
            : `Opened ${formatDate(caseData.date_opened)}`
        }
        action={
          <Link href={`/cases/${caseData.id}/edit`}>
            <Button variant="outline">
              <Pencil className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </Link>
        }
      />

      {/* AI Quick Actions */}
      <QuickActions caseId={caseData.id} caseTitle={caseData.title} />

      {/* Case Info Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-primary/10 p-2">
                <User className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Client</p>
                {caseData.client ? (
                  <Link
                    href={`/clients/${caseData.client.id}`}
                    className="text-sm font-medium hover:text-primary"
                  >
                    {caseData.client.first_name} {caseData.client.last_name}
                  </Link>
                ) : (
                  <p className="text-sm font-medium">Unknown</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-primary/10 p-2">
                <Scale className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Type & Status</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium capitalize ${
                      typeColors[caseData.case_type] || typeColors.other
                    }`}
                  >
                    {caseData.case_type}
                  </span>
                  <Badge variant={statusVariant[caseData.status] || "secondary"}>
                    {caseData.status}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-primary/10 p-2">
                <Gavel className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Court</p>
                <p className="text-sm font-medium">
                  {caseData.court_name || "Not set"}
                </p>
                {caseData.judge_name && (
                  <p className="text-xs text-muted-foreground">
                    Judge {caseData.judge_name}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-primary/10 p-2">
                <Users className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Opposing</p>
                <p className="text-sm font-medium">
                  {caseData.opposing_party || "Not set"}
                </p>
                {caseData.opposing_counsel && (
                  <p className="text-xs text-muted-foreground">
                    Counsel: {caseData.opposing_counsel}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Description */}
      {caseData.description && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Description</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
              {caseData.description}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Tags */}
      {caseData.tags && caseData.tags.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          {caseData.tags.map((tag: string) => (
            <Badge key={tag} variant="outline">
              {tag}
            </Badge>
          ))}
        </div>
      )}

      {/* Tabs: Documents, Timeline, Billing */}
      <CaseTabs caseId={caseData.id} />
    </div>
  );
}

import Link from "next/link";
import { Plus, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { getTemplates } from "@/actions/templates";

export default async function TemplatesPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; practice_area?: string }>;
}) {
  const params = await searchParams;
  const templates = await getTemplates({
    category: params.category,
    practice_area: params.practice_area,
  });

  const categories = ["motion", "pleading", "letter", "contract", "agreement", "other"];

  const categoryVariant = (category: string) => {
    const map: Record<string, "default" | "secondary" | "info" | "success" | "warning" | "outline"> = {
      motion: "default",
      pleading: "info",
      letter: "secondary",
      contract: "success",
      agreement: "warning",
      other: "outline",
    };
    return map[category] || "outline";
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Templates"
        description="Manage your document templates"
        action={
          <Link href="/templates/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Template
            </Button>
          </Link>
        }
      />

      {/* Category filters */}
      <div className="flex items-center gap-2 flex-wrap">
        <Link href="/templates">
          <Button variant={!params.category ? "default" : "outline"} size="sm">
            All
          </Button>
        </Link>
        {categories.map((category) => (
          <Link key={category} href={`/templates?category=${category}`}>
            <Button
              variant={params.category === category ? "default" : "outline"}
              size="sm"
              className="capitalize"
            >
              {category}
            </Button>
          </Link>
        ))}
      </div>

      {templates.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No templates found"
          description="Create your first template to speed up document drafting."
          action={
            <Link href="/templates/new">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Template
              </Button>
            </Link>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.map((template) => (
            <Link key={template.id} href={`/templates/${template.id}`}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-base line-clamp-2">
                      {template.title}
                    </CardTitle>
                    {template.is_system && (
                      <Badge variant="secondary" className="shrink-0 text-[10px]">
                        System
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant={categoryVariant(template.category)} className="capitalize">
                      {template.category}
                    </Badge>
                    {template.practice_area && (
                      <Badge variant="outline" className="capitalize">
                        {template.practice_area}
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-3 line-clamp-2">
                    {template.content.slice(0, 120)}
                    {template.content.length > 120 ? "..." : ""}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

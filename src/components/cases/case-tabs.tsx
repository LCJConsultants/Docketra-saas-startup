"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Clock, Receipt, CalendarDays } from "lucide-react";

interface CaseTabsProps {
  caseId: string;
}

export function CaseTabs({ caseId: _caseId }: CaseTabsProps) {
  return (
    <Tabs defaultValue="overview" className="space-y-4">
      <TabsList>
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="documents" className="gap-1.5">
          <FileText className="h-3.5 w-3.5" />
          Documents
        </TabsTrigger>
        <TabsTrigger value="timeline" className="gap-1.5">
          <CalendarDays className="h-3.5 w-3.5" />
          Timeline
        </TabsTrigger>
        <TabsTrigger value="billing" className="gap-1.5">
          <Receipt className="h-3.5 w-3.5" />
          Billing
        </TabsTrigger>
      </TabsList>

      <TabsContent value="overview">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground text-center py-8">
              Case overview will display key details, recent activity, and AI suggestions.
            </p>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="documents">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Documents</CardTitle>
            <Badge variant="secondary">0 files</Badge>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="rounded-full bg-muted p-3 mb-3">
                <FileText className="h-5 w-5 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">
                No documents attached to this case yet.
              </p>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="timeline">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Timeline</CardTitle>
            <Badge variant="secondary">0 events</Badge>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="rounded-full bg-muted p-3 mb-3">
                <Clock className="h-5 w-5 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">
                No timeline events yet. Court dates and deadlines will appear here.
              </p>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="billing">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Billing</CardTitle>
            <Badge variant="secondary">0 entries</Badge>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="rounded-full bg-muted p-3 mb-3">
                <Receipt className="h-5 w-5 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">
                No time entries or invoices yet. Start tracking time to see billing info.
              </p>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}

import { Clock } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { TimerWidget } from "@/components/time-tracking/timer-widget";
import { TimeEntryForm } from "@/components/time-tracking/time-entry-form";
import { TimeEntryTable } from "@/components/time-tracking/time-entry-table";
import { getTimeEntries } from "@/actions/time-entries";
import { getCases } from "@/actions/cases";
import { formatDuration, formatCurrency } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function TimeTrackingPage() {
  const [entriesResult, casesResult] = await Promise.all([
    getTimeEntries(),
    getCases({ status: "open" }),
  ]);
  const entries = entriesResult.data;
  const cases = casesResult.data;

  const casesList = cases.map((c) => ({ id: c.id, title: c.title }));

  const totalMinutes = entries.reduce((sum, e) => sum + e.duration_minutes, 0);
  const totalBillable = entries
    .filter((e) => e.is_billable && e.total_amount)
    .reduce((sum, e) => sum + (e.total_amount || 0), 0);
  const unbilledCount = entries.filter((e) => !e.invoice_id).length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Time Tracking"
        description="Track billable hours and manage time entries"
      />

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Total Time</p>
            <p className="text-xl font-semibold">{formatDuration(totalMinutes)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Total Billable</p>
            <p className="text-xl font-semibold">{formatCurrency(totalBillable)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Unbilled Entries</p>
            <p className="text-xl font-semibold">{unbilledCount}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Timer + Manual Entry */}
        <div className="space-y-4">
          <TimerWidget cases={casesList} />
          <TimeEntryForm cases={casesList} />
        </div>

        {/* Time Entries Table */}
        <div className="lg:col-span-2">
          {entries.length === 0 ? (
            <EmptyState
              icon={<Clock className="h-8 w-8 text-muted-foreground" />}
              title="No time entries yet"
              description="Start the timer or add a manual entry to track your billable hours."
            />
          ) : (
            <TimeEntryTable entries={entries} />
          )}
        </div>
      </div>
    </div>
  );
}

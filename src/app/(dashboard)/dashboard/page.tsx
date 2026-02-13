import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/page-header";
import { Calendar, Clock, Briefcase, FileText, AlertTriangle, CheckCircle } from "lucide-react";
import {
  getDashboardStats,
  getUpcomingDeadlines,
  getRecentActivity,
  getUnbilledSummary,
} from "@/actions/dashboard";
import { getUpcomingEvents } from "@/actions/calendar";
import { formatDateTime, formatRelative, formatDuration, formatCurrency } from "@/lib/utils";

const eventTypeLabels: Record<string, string> = {
  court_date: "Court Date",
  deadline: "Deadline",
  filing: "Filing",
  meeting: "Meeting",
  reminder: "Reminder",
  sol: "Statute of Limitations",
};

const activityTypeLabels: Record<string, string> = {
  case: "New case",
  document: "Document uploaded",
  time_entry: "Time logged",
};

export default async function DashboardPage() {
  const [stats, events, deadlines, activity, unbilled] = await Promise.all([
    getDashboardStats(),
    getUpcomingEvents(5),
    getUpcomingDeadlines(5),
    getRecentActivity(5),
    getUnbilledSummary(),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Today's Agenda"
        description="Welcome back. Here's what needs your attention."
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link href="/cases">
          <Card className="hover:border-primary/50 transition-colors">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="rounded-lg bg-primary/10 p-2.5">
                  <Briefcase className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Active Cases</p>
                  <p className="text-2xl font-semibold">{stats.activeCases}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link href="/calendar">
          <Card className="hover:border-primary/50 transition-colors">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="rounded-lg bg-amber-100 p-2.5">
                  <Calendar className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Events Today</p>
                  <p className="text-2xl font-semibold">{stats.eventsToday}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link href="/time-tracking">
          <Card className="hover:border-primary/50 transition-colors">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="rounded-lg bg-emerald-100 p-2.5">
                  <Clock className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Hours This Week</p>
                  <p className="text-2xl font-semibold">{stats.hoursThisWeek}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link href="/documents">
          <Card className="hover:border-primary/50 transition-colors">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="rounded-lg bg-blue-100 p-2.5">
                  <FileText className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Documents</p>
                  <p className="text-2xl font-semibold">{stats.documentsCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Events */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              Upcoming Events
            </CardTitle>
          </CardHeader>
          <CardContent>
            {events.length > 0 ? (
              <div className="space-y-3">
                {events.map((event) => (
                  <div key={event.id} className="flex items-start justify-between gap-2 text-sm">
                    <div className="min-w-0">
                      {event.case_id ? (
                        <Link href={`/cases/${event.case_id}`} className="font-medium hover:underline">
                          {event.title}
                        </Link>
                      ) : (
                        <p className="font-medium">{event.title}</p>
                      )}
                      <p className="text-muted-foreground text-xs">
                        {eventTypeLabels[event.event_type] ?? event.event_type}
                      </p>
                    </div>
                    <p className="text-muted-foreground text-xs whitespace-nowrap">
                      {formatDateTime(event.start_time)}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="rounded-full bg-muted p-3 mb-3">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground">
                  No upcoming events. Add court dates and deadlines in the Calendar.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Upcoming Deadlines */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              Upcoming Deadlines
            </CardTitle>
          </CardHeader>
          <CardContent>
            {deadlines.length > 0 ? (
              <div className="space-y-3">
                {deadlines.map((dl) => (
                  <div key={dl.id} className="flex items-start justify-between gap-2 text-sm">
                    <div className="min-w-0">
                      {dl.case_id ? (
                        <Link href={`/cases/${dl.case_id}`} className="font-medium hover:underline">
                          {dl.title}
                        </Link>
                      ) : (
                        <p className="font-medium">{dl.title}</p>
                      )}
                      <p className="text-muted-foreground text-xs">
                        {eventTypeLabels[dl.event_type] ?? dl.event_type}
                      </p>
                    </div>
                    <p className="text-muted-foreground text-xs whitespace-nowrap">
                      {formatDateTime(dl.start_time)}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="rounded-full bg-muted p-3 mb-3">
                  <CheckCircle className="h-5 w-5 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground">
                  No upcoming deadlines. You&apos;re all caught up!
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            {activity.length > 0 ? (
              <div className="space-y-3">
                {activity.map((item, i) => (
                  <div key={i} className="flex items-start justify-between gap-2 text-sm">
                    <div className="min-w-0">
                      <p className="font-medium truncate">{item.title}</p>
                      <p className="text-muted-foreground text-xs">
                        {activityTypeLabels[item.type] ?? item.type}
                      </p>
                    </div>
                    <p className="text-muted-foreground text-xs whitespace-nowrap">
                      {formatRelative(item.timestamp)}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <p className="text-sm text-muted-foreground">
                  No recent activity yet. Start by adding a client and case.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Unbilled Time */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              Unbilled Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            {unbilled.length > 0 ? (
              <div className="space-y-3">
                {unbilled.map((entry, i) => (
                  <div key={i} className="flex items-start justify-between gap-2 text-sm">
                    <div className="min-w-0">
                      <p className="font-medium truncate">{entry.case_title}</p>
                      <p className="text-muted-foreground text-xs">
                        {formatDuration(entry.total_hours * 60)}
                      </p>
                    </div>
                    <p className="font-medium whitespace-nowrap">
                      {formatCurrency(entry.total_amount)}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <p className="text-sm text-muted-foreground">
                  No unbilled time entries. Start tracking time on your cases.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

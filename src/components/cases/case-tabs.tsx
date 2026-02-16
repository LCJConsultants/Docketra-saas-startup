import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Clock, Receipt, CalendarDays, MapPin } from "lucide-react";
import { formatDateTime } from "@/lib/utils";

interface CalendarEvent {
  id: string;
  title: string;
  event_type: string;
  start_time: string;
  end_time: string | null;
  location: string | null;
  all_day: boolean;
}

interface Document {
  id: string;
  title: string;
  file_name: string;
  category: string | null;
  created_at: string;
}

interface CaseTabsProps {
  caseId: string;
  events: CalendarEvent[];
  documents: Document[];
}

const eventTypeLabels: Record<string, string> = {
  court_date: "Court Date",
  deadline: "Deadline",
  filing: "Filing",
  meeting: "Meeting",
  reminder: "Reminder",
  sol: "Statute of Limitations",
};

const eventTypeBadge: Record<string, "default" | "warning" | "info" | "secondary" | "outline"> = {
  court_date: "default",
  deadline: "warning",
  filing: "info",
  meeting: "secondary",
  reminder: "outline",
  sol: "warning",
};

export function CaseTabs({ caseId, events, documents }: CaseTabsProps) {
  const now = new Date();
  const upcomingEvents = events.filter((e) => new Date(e.start_time) >= now);
  const pastEvents = events.filter((e) => new Date(e.start_time) < now).reverse();

  return (
    <Tabs defaultValue="timeline" className="space-y-4">
      <TabsList>
        <TabsTrigger value="timeline" className="gap-1.5">
          <CalendarDays className="h-3.5 w-3.5" />
          Timeline
        </TabsTrigger>
        <TabsTrigger value="documents" className="gap-1.5">
          <FileText className="h-3.5 w-3.5" />
          Documents
        </TabsTrigger>
        <TabsTrigger value="billing" className="gap-1.5">
          <Receipt className="h-3.5 w-3.5" />
          Billing
        </TabsTrigger>
      </TabsList>

      <TabsContent value="timeline">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Timeline</CardTitle>
            <Badge variant="secondary">
              {events.length} {events.length === 1 ? "event" : "events"}
            </Badge>
          </CardHeader>
          <CardContent>
            {events.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="rounded-full bg-muted p-3 mb-3">
                  <Clock className="h-5 w-5 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground">
                  No events linked to this case yet.
                </p>
                <Link
                  href="/calendar"
                  className="text-sm text-primary hover:underline mt-2"
                >
                  Create an event in Calendar
                </Link>
              </div>
            ) : (
              <div className="space-y-6">
                {upcomingEvents.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
                      Upcoming
                    </p>
                    <div className="space-y-3">
                      {upcomingEvents.map((event) => (
                        <EventRow key={event.id} event={event} />
                      ))}
                    </div>
                  </div>
                )}
                {pastEvents.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
                      Past
                    </p>
                    <div className="space-y-3">
                      {pastEvents.map((event) => (
                        <EventRow key={event.id} event={event} />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="documents">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Documents</CardTitle>
            <Badge variant="secondary">
              {documents.length} {documents.length === 1 ? "file" : "files"}
            </Badge>
          </CardHeader>
          <CardContent>
            {documents.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="rounded-full bg-muted p-3 mb-3">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground">
                  No documents attached to this case yet.
                </p>
                <Link
                  href="/documents"
                  className="text-sm text-primary hover:underline mt-2"
                >
                  Upload a document
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {documents.map((doc) => (
                  <Link
                    key={doc.id}
                    href={`/documents`}
                    className="flex items-start justify-between gap-2 text-sm p-2 rounded-md hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                      <div className="min-w-0">
                        <p className="font-medium truncate">{doc.title}</p>
                        <p className="text-xs text-muted-foreground">{doc.file_name}</p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      {doc.category && (
                        <Badge variant="outline" className="text-[10px] capitalize">
                          {doc.category}
                        </Badge>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            )}
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

function EventRow({ event }: { event: CalendarEvent }) {
  return (
    <div className="flex items-start justify-between gap-3 text-sm p-2 rounded-md hover:bg-muted/50 transition-colors">
      <div className="min-w-0">
        <p className="font-medium">{event.title}</p>
        <div className="flex items-center gap-2 mt-1">
          <Badge
            variant={eventTypeBadge[event.event_type] ?? "outline"}
            className="text-[10px]"
          >
            {eventTypeLabels[event.event_type] ?? event.event_type}
          </Badge>
          {event.location && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="h-3 w-3" />
              {event.location}
            </span>
          )}
        </div>
      </div>
      <p className="text-xs text-muted-foreground whitespace-nowrap shrink-0">
        {formatDateTime(event.start_time)}
      </p>
    </div>
  );
}

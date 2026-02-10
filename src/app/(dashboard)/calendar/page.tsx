import Link from "next/link";
import { Plus, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/page-header";
import { CalendarView } from "@/components/calendar/calendar-view";
import { getCalendarEvents } from "@/actions/calendar";

export default async function CalendarPage() {
  const events = await getCalendarEvents();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Calendar"
        description="Court dates, deadlines, and events"
        action={
          <Link href="/calendar?new=true">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Event
            </Button>
          </Link>
        }
      />
      <CalendarView events={events} />
    </div>
  );
}

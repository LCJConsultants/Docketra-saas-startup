"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/page-header";
import { CalendarView } from "@/components/calendar/calendar-view";
import { EventForm } from "@/components/calendar/event-form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import type { CalendarEvent } from "@/types";

interface CalendarPageClientProps {
  events: (CalendarEvent & { case?: { id: string; title: string } | null })[];
  cases: { id: string; title: string }[];
}

export function CalendarPageClient({ events, cases }: CalendarPageClientProps) {
  const [showNewEvent, setShowNewEvent] = useState(false);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Calendar"
        description="Court dates, deadlines, and events"
        action={
          <Button onClick={() => setShowNewEvent(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Event
          </Button>
        }
      />
      <CalendarView events={events} />

      <Dialog open={showNewEvent} onOpenChange={setShowNewEvent}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>New Event</DialogTitle>
            <DialogDescription>
              Add a court date, deadline, or other event to your calendar.
            </DialogDescription>
          </DialogHeader>
          <EventForm
            cases={cases}
            onSuccess={() => setShowNewEvent(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { createEventAction, updateEventAction } from "@/actions/calendar";
import { toast } from "sonner";
import type { CalendarEvent, Case } from "@/types";

interface EventFormProps {
  event?: CalendarEvent;
  cases: Pick<Case, "id" | "title">[];
  onSuccess?: () => void;
}

function toLocalDatetime(utcString: string): string {
  const d = new Date(utcString);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

export function EventForm({ event, cases, onSuccess }: EventFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const isEditing = !!event;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData(e.currentTarget);

      // Convert local datetime to UTC ISO string for proper timezone handling
      const startLocal = formData.get("start_time") as string;
      if (startLocal) {
        formData.set("start_time", new Date(startLocal).toISOString());
      }
      const endLocal = formData.get("end_time") as string;
      if (endLocal) {
        formData.set("end_time", new Date(endLocal).toISOString());
      }

      if (isEditing) {
        await updateEventAction(event.id, formData);
        toast.success("Event updated");
      } else {
        await createEventAction(formData);
        toast.success("Event created");
      }

      if (onSuccess) {
        onSuccess();
      } else {
        router.push("/calendar");
      }
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Title *</Label>
        <Input id="title" name="title" defaultValue={event?.title} required />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="event_type">Event Type *</Label>
          <Select name="event_type" defaultValue={event?.event_type || "meeting"} required>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="court_date">Court Date</SelectItem>
              <SelectItem value="deadline">Deadline</SelectItem>
              <SelectItem value="filing">Filing</SelectItem>
              <SelectItem value="meeting">Meeting</SelectItem>
              <SelectItem value="reminder">Reminder</SelectItem>
              <SelectItem value="sol">Statute of Limitations</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="case_id">Case (optional)</Label>
          <Select name="case_id" defaultValue={event?.case_id || "none"}>
            <SelectTrigger>
              <SelectValue placeholder="No case linked" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No case linked</SelectItem>
              {cases.map((c) => (
                <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="start_time">Start *</Label>
          <Input
            id="start_time"
            name="start_time"
            type="datetime-local"
            defaultValue={event?.start_time ? toLocalDatetime(event.start_time) : ""}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="end_time">End</Label>
          <Input
            id="end_time"
            name="end_time"
            type="datetime-local"
            defaultValue={event?.end_time ? toLocalDatetime(event.end_time) : ""}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="location">Location</Label>
        <Input id="location" name="location" defaultValue={event?.location || ""} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" name="description" defaultValue={event?.description || ""} rows={3} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="reminder_minutes">Reminders (minutes before, comma-separated)</Label>
        <Input
          id="reminder_minutes"
          name="reminder_minutes"
          placeholder="1440, 60"
          defaultValue={event?.reminder_minutes?.join(", ") || ""}
        />
        <p className="text-xs text-muted-foreground">Example: 1440 = 1 day, 60 = 1 hour</p>
      </div>

      <div className="flex items-center gap-3 pt-2">
        <Button type="submit" disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isEditing ? "Save Changes" : "Create Event"}
        </Button>
        <Button type="button" variant="outline" onClick={() => onSuccess ? onSuccess() : router.back()}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

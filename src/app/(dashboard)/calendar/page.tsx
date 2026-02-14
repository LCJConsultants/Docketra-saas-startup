import { CalendarPageClient } from "./calendar-client";
import { getCalendarEvents } from "@/actions/calendar";
import { getCases } from "@/actions/cases";

export default async function CalendarPage() {
  const [events, casesResult] = await Promise.all([
    getCalendarEvents(),
    getCases({ status: "open" }),
  ]);

  const casesList = casesResult.data.map((c) => ({ id: c.id, title: c.title }));

  return <CalendarPageClient events={events} cases={casesList} />;
}

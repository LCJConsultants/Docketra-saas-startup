import { CalendarPageClient } from "./calendar-client";
import { getCalendarEvents } from "@/actions/calendar";
import { getCases } from "@/actions/cases";

export default async function CalendarPage() {
  const [events, cases] = await Promise.all([
    getCalendarEvents(),
    getCases({ status: "open" }),
  ]);

  const casesList = cases.map((c) => ({ id: c.id, title: c.title }));

  return <CalendarPageClient events={events} cases={casesList} />;
}

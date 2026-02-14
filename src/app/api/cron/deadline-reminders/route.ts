import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Cron endpoint: Check for upcoming deadlines and create notifications
  const supabase = createAdminClient();
  const now = new Date();

  // Find events within the next 24 hours that have reminders
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const { data: events } = await supabase
    .from("calendar_events")
    .select("id, user_id, title, event_type, start_time, reminder_minutes")
    .gte("start_time", now.toISOString())
    .lte("start_time", tomorrow.toISOString())
    .not("reminder_minutes", "is", null);

  let notificationsCreated = 0;

  for (const event of events || []) {
    if (!event.reminder_minutes) continue;

    for (const minutes of event.reminder_minutes) {
      const reminderTime = new Date(new Date(event.start_time).getTime() - minutes * 60000);

      // If reminder time is in the past but event is in the future, send now
      if (reminderTime <= now && new Date(event.start_time) > now) {
        // Check if we already sent this reminder
        const { count } = await supabase
          .from("notifications")
          .select("*", { count: "exact", head: true })
          .eq("user_id", event.user_id)
          .like("title", `%${event.title}%`)
          .gte("created_at", new Date(now.getTime() - 3600000).toISOString()); // Within last hour

        if (!count || count === 0) {
          await supabase.from("notifications").insert({
            user_id: event.user_id,
            title: `Upcoming: ${event.title}`,
            message: `${event.event_type.replace("_", " ")} starts in ${minutes} minutes`,
            type: event.event_type === "deadline" ? "deadline" : "event",
            link: event.id ? `/calendar` : null,
          });
          notificationsCreated++;
        }
      }
    }
  }

  return NextResponse.json({
    message: "Deadline reminders processed",
    notifications_created: notificationsCreated,
  });
}

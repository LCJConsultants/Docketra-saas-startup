import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST() {
  // Cron endpoint: Generate and send daily digest emails
  // Should be called by Vercel Cron or similar scheduler

  const supabase = createAdminClient();

  // Get all users with digest enabled
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, email, full_name, notification_preferences")
    .not("notification_preferences->digest", "eq", "false");

  if (!profiles || profiles.length === 0) {
    return NextResponse.json({ message: "No users with digest enabled", sent: 0 });
  }

  let sentCount = 0;

  for (const profile of profiles) {
    const now = new Date();
    const endOfDay = new Date(now);
    endOfDay.setHours(23, 59, 59, 999);

    // Get today's events
    const { data: events } = await supabase
      .from("calendar_events")
      .select("title, event_type, start_time, location")
      .eq("user_id", profile.id)
      .gte("start_time", now.toISOString())
      .lte("start_time", endOfDay.toISOString())
      .order("start_time", { ascending: true });

    // Get upcoming deadlines (next 7 days)
    const nextWeek = new Date(now);
    nextWeek.setDate(nextWeek.getDate() + 7);

    const { data: deadlines } = await supabase
      .from("calendar_events")
      .select("title, event_type, start_time")
      .eq("user_id", profile.id)
      .in("event_type", ["deadline", "filing", "sol"])
      .gte("start_time", now.toISOString())
      .lte("start_time", nextWeek.toISOString())
      .order("start_time", { ascending: true });

    // TODO: Send email via Resend
    // await resend.emails.send({
    //   from: 'Docketra <digest@docketra.com>',
    //   to: profile.email,
    //   subject: `Daily Digest - ${format(now, 'MMM d, yyyy')}`,
    //   html: buildDigestEmail(profile.full_name, events, deadlines),
    // });

    sentCount++;
  }

  return NextResponse.json({ message: "Digest sent", sent: sentCount });
}

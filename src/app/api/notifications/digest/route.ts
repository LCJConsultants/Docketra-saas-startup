import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { resend } from "@/lib/resend";
import { buildDigestEmail } from "@/lib/digest-template";
import { format } from "date-fns";

export async function POST(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createAdminClient();

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

    const { data: events } = await supabase
      .from("calendar_events")
      .select("title, event_type, start_time, location")
      .eq("user_id", profile.id)
      .gte("start_time", now.toISOString())
      .lte("start_time", endOfDay.toISOString())
      .order("start_time", { ascending: true });

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

    const html = buildDigestEmail(profile.full_name, events, deadlines);
    if (!html) continue;

    try {
      await resend.emails.send({
        from: "Docketra <digest@docketra.com>",
        to: profile.email,
        subject: `Daily Digest - ${format(now, "MMM d, yyyy")}`,
        html,
      });
      sentCount++;
    } catch (error) {
      console.error(`Failed to send digest to ${profile.email}:`, error);
    }
  }

  return NextResponse.json({ message: "Digest sent", sent: sentCount });
}

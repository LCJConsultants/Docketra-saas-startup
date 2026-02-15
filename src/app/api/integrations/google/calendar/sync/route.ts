import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  fetchGoogleCalendarEvents,
  createGoogleCalendarEvent,
  updateGoogleCalendarEvent,
  mapGoogleEventToDocketra,
} from "@/lib/google";

export async function POST() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("google_refresh_token")
      .eq("id", user.id)
      .single();

    if (!profile?.google_refresh_token) {
      return NextResponse.json(
        { error: "Google not connected" },
        { status: 400 }
      );
    }

    const refreshToken = profile.google_refresh_token;

    // Define sync window: 90 days back, 365 days forward
    const now = new Date();
    const timeMin = new Date(
      now.getTime() - 90 * 24 * 60 * 60 * 1000
    ).toISOString();
    const timeMax = new Date(
      now.getTime() + 365 * 24 * 60 * 60 * 1000
    ).toISOString();

    // Fetch local events
    const { data: localEvents } = await supabase
      .from("calendar_events")
      .select("*")
      .eq("user_id", user.id)
      .gte("start_time", timeMin)
      .lte("start_time", timeMax);

    // Fetch Google Calendar events
    const googleEvents = await fetchGoogleCalendarEvents(
      refreshToken,
      timeMin,
      timeMax
    );

    let pushed = 0;
    let pulled = 0;

    // --- Push phase: local → Google ---

    for (const localEvent of localEvents || []) {
      const eventData = {
        title: localEvent.title,
        description: localEvent.description,
        event_type: localEvent.event_type,
        start_time: localEvent.start_time,
        end_time: localEvent.end_time,
        all_day: localEvent.all_day,
        location: localEvent.location,
      };

      if (!localEvent.google_event_id) {
        // New local event — push to Google
        try {
          const googleEventId = await createGoogleCalendarEvent(
            refreshToken,
            eventData
          );
          await supabase
            .from("calendar_events")
            .update({
              google_event_id: googleEventId,
              google_synced_at: new Date().toISOString(),
            })
            .eq("id", localEvent.id);
          pushed++;
        } catch (err) {
          console.error(
            `Failed to push event ${localEvent.id} to Google:`,
            err
          );
        }
      } else if (
        localEvent.updated_at &&
        (!localEvent.google_synced_at ||
          new Date(localEvent.updated_at) >
            new Date(localEvent.google_synced_at))
      ) {
        // Local event updated since last sync — push update to Google
        try {
          await updateGoogleCalendarEvent(
            refreshToken,
            localEvent.google_event_id,
            eventData
          );
          await supabase
            .from("calendar_events")
            .update({ google_synced_at: new Date().toISOString() })
            .eq("id", localEvent.id);
          pushed++;
        } catch (err) {
          console.error(
            `Failed to update event ${localEvent.id} on Google:`,
            err
          );
        }
      }
    }

    // --- Pull phase: Google → local ---

    // Build lookup of local events by google_event_id
    /* eslint-disable @typescript-eslint/no-explicit-any */
    const localByGoogleId = new Map<string, any>();
    for (const ev of localEvents || []) {
      if (ev.google_event_id) {
        localByGoogleId.set(ev.google_event_id, ev);
      }
    }

    for (const googleEvent of googleEvents) {
      if (!googleEvent.id) continue;

      // Handle cancelled events — delete local copy if it exists
      if (googleEvent.status === "cancelled") {
        const localMatch = localByGoogleId.get(googleEvent.id);
        if (localMatch) {
          try {
            await supabase
              .from("calendar_events")
              .delete()
              .eq("id", localMatch.id);
            pulled++;
          } catch (err) {
            console.error(
              `Failed to delete local event ${localMatch.id} (cancelled on Google):`,
              err
            );
          }
        }
        continue;
      }

      const localMatch = localByGoogleId.get(googleEvent.id);

      if (!localMatch) {
        // New Google event — pull into local DB
        try {
          const mapped = mapGoogleEventToDocketra(googleEvent);
          await supabase.from("calendar_events").insert({
            user_id: user.id,
            ...mapped,
            google_event_id: googleEvent.id,
            google_synced_at: new Date().toISOString(),
          });
          pulled++;
        } catch (err) {
          console.error(
            `Failed to pull Google event ${googleEvent.id}:`,
            err
          );
        }
      } else {
        // Existing event — check if Google version is newer
        const googleUpdated = googleEvent.updated
          ? new Date(googleEvent.updated)
          : null;
        const localSyncedAt = localMatch.google_synced_at
          ? new Date(localMatch.google_synced_at)
          : null;

        if (googleUpdated && (!localSyncedAt || googleUpdated > localSyncedAt)) {
          try {
            const mapped = mapGoogleEventToDocketra(googleEvent);
            await supabase
              .from("calendar_events")
              .update({
                ...mapped,
                google_synced_at: new Date().toISOString(),
              })
              .eq("id", localMatch.id);
            pulled++;
          } catch (err) {
            console.error(
              `Failed to update local event ${localMatch.id} from Google:`,
              err
            );
          }
        }
      }
    }

    return NextResponse.json({ pushed, pulled });
  } catch (err) {
    console.error("Calendar sync error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

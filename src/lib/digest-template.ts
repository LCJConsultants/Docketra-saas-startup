import { format } from "date-fns";

interface DigestEvent {
  title: string;
  event_type: string;
  start_time: string;
  location?: string | null;
}

interface DigestDeadline {
  title: string;
  event_type: string;
  start_time: string;
}

const eventTypeLabels: Record<string, string> = {
  court_date: "Court Date",
  deadline: "Deadline",
  filing: "Filing",
  meeting: "Meeting",
  reminder: "Reminder",
  sol: "Statute of Limitations",
};

export function buildDigestEmail(
  fullName: string,
  events: DigestEvent[] | null,
  deadlines: DigestDeadline[] | null
): string | null {
  const hasEvents = events && events.length > 0;
  const hasDeadlines = deadlines && deadlines.length > 0;

  if (!hasEvents && !hasDeadlines) return null;

  const firstName = fullName?.split(" ")[0] || "there";

  let eventsHtml = "";
  if (hasEvents) {
    const rows = events
      .map(
        (e) => `
        <tr>
          <td style="padding: 8px 12px; border-bottom: 1px solid #f0f0f0; font-size: 14px;">
            ${escapeHtml(e.title)}
          </td>
          <td style="padding: 8px 12px; border-bottom: 1px solid #f0f0f0; font-size: 14px; color: #6b7280;">
            ${eventTypeLabels[e.event_type] ?? e.event_type}
          </td>
          <td style="padding: 8px 12px; border-bottom: 1px solid #f0f0f0; font-size: 14px; color: #6b7280;">
            ${format(new Date(e.start_time), "h:mm a")}
          </td>
        </tr>`
      )
      .join("");

    eventsHtml = `
      <h2 style="font-size: 16px; color: #111827; margin: 24px 0 12px 0;">Today's Schedule</h2>
      <table style="width: 100%; border-collapse: collapse; background: #ffffff; border-radius: 8px; overflow: hidden; border: 1px solid #e5e7eb;">
        <thead>
          <tr style="background: #f9fafb;">
            <th style="padding: 8px 12px; text-align: left; font-size: 12px; color: #6b7280; font-weight: 600;">Event</th>
            <th style="padding: 8px 12px; text-align: left; font-size: 12px; color: #6b7280; font-weight: 600;">Type</th>
            <th style="padding: 8px 12px; text-align: left; font-size: 12px; color: #6b7280; font-weight: 600;">Time</th>
          </tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
      </table>`;
  }

  let deadlinesHtml = "";
  if (hasDeadlines) {
    const rows = deadlines
      .map(
        (d) => `
        <tr>
          <td style="padding: 8px 12px; border-bottom: 1px solid #f0f0f0; font-size: 14px;">
            ${escapeHtml(d.title)}
          </td>
          <td style="padding: 8px 12px; border-bottom: 1px solid #f0f0f0; font-size: 14px; color: #6b7280;">
            ${eventTypeLabels[d.event_type] ?? d.event_type}
          </td>
          <td style="padding: 8px 12px; border-bottom: 1px solid #f0f0f0; font-size: 14px; color: #6b7280;">
            ${format(new Date(d.start_time), "MMM d, yyyy")}
          </td>
        </tr>`
      )
      .join("");

    deadlinesHtml = `
      <h2 style="font-size: 16px; color: #111827; margin: 24px 0 12px 0;">Upcoming Deadlines</h2>
      <table style="width: 100%; border-collapse: collapse; background: #ffffff; border-radius: 8px; overflow: hidden; border: 1px solid #e5e7eb;">
        <thead>
          <tr style="background: #f9fafb;">
            <th style="padding: 8px 12px; text-align: left; font-size: 12px; color: #6b7280; font-weight: 600;">Deadline</th>
            <th style="padding: 8px 12px; text-align: left; font-size: 12px; color: #6b7280; font-weight: 600;">Type</th>
            <th style="padding: 8px 12px; text-align: left; font-size: 12px; color: #6b7280; font-weight: 600;">Due Date</th>
          </tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
      </table>`;
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://docketra.org";

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
<body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <div style="max-width: 600px; margin: 0 auto; padding: 24px;">
    <div style="background: #ffffff; border-radius: 12px; padding: 32px; border: 1px solid #e5e7eb;">
      <h1 style="font-size: 20px; color: #111827; margin: 0 0 8px 0;">Good morning, ${escapeHtml(firstName)}</h1>
      <p style="font-size: 14px; color: #6b7280; margin: 0 0 24px 0;">Here's your daily briefing for ${format(new Date(), "EEEE, MMMM d")}.</p>
      ${eventsHtml}
      ${deadlinesHtml}
      <div style="margin-top: 32px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center;">
        <a href="${appUrl}/dashboard" style="display: inline-block; padding: 10px 24px; background: #111827; color: #ffffff; text-decoration: none; border-radius: 6px; font-size: 14px; font-weight: 500;">View Dashboard</a>
      </div>
    </div>
    <p style="text-align: center; font-size: 12px; color: #9ca3af; margin-top: 16px;">
      You're receiving this because you enabled daily digest emails.
      <br />Manage your preferences in Settings.
    </p>
  </div>
</body>
</html>`;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

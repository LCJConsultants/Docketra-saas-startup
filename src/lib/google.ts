import { google } from "googleapis";
import { Readable } from "stream";

const SCOPES = [
  "https://www.googleapis.com/auth/userinfo.email",
  "https://www.googleapis.com/auth/gmail.readonly",
  "https://www.googleapis.com/auth/gmail.send",
  "https://www.googleapis.com/auth/gmail.modify",
  "https://www.googleapis.com/auth/drive.file",
  "https://www.googleapis.com/auth/calendar",
];

function getOAuth2Client() {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    `${process.env.NEXT_PUBLIC_APP_URL}/api/integrations/google/callback`
  );
}

export function getGoogleAuthUrl(): string {
  const oauth2Client = getOAuth2Client();
  return oauth2Client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: SCOPES,
  });
}

export async function handleGoogleCallback(code: string) {
  const oauth2Client = getOAuth2Client();
  const { tokens } = await oauth2Client.getToken(code);
  return tokens;
}

export function getAuthenticatedClient(refreshToken: string) {
  const oauth2Client = getOAuth2Client();
  oauth2Client.setCredentials({ refresh_token: refreshToken });
  return oauth2Client;
}

// --- Gmail functions ---

/* eslint-disable @typescript-eslint/no-explicit-any */
function parseGmailMessage(message: any) {
  const headers = message.payload?.headers || [];
  const getHeader = (name: string) =>
    headers.find((h: any) => h.name.toLowerCase() === name.toLowerCase())
      ?.value || "";

  let bodyText = "";
  let bodyHtml = "";

  function extractParts(payload: any) {
    if (payload.mimeType === "text/plain" && payload.body?.data) {
      bodyText = Buffer.from(payload.body.data, "base64url").toString("utf-8");
    }
    if (payload.mimeType === "text/html" && payload.body?.data) {
      bodyHtml = Buffer.from(payload.body.data, "base64url").toString("utf-8");
    }
    if (payload.parts) {
      payload.parts.forEach(extractParts);
    }
  }
  extractParts(message.payload);

  return {
    message_id: message.id,
    thread_id: message.threadId,
    subject: getHeader("Subject"),
    from_address: getHeader("From"),
    to_addresses: getHeader("To")
      .split(",")
      .map((a: string) => a.trim())
      .filter(Boolean),
    cc_addresses: getHeader("Cc")
      ? getHeader("Cc")
          .split(",")
          .map((a: string) => a.trim())
      : [],
    body_text: bodyText,
    body_html: bodyHtml,
    snippet: message.snippet || "",
    is_read: !(message.labelIds || []).includes("UNREAD"),
    is_starred: (message.labelIds || []).includes("STARRED"),
    labels: message.labelIds || [],
    has_attachments: (message.payload?.parts || []).some(
      (p: any) => p.filename && p.filename.length > 0
    ),
    sent_at: new Date(parseInt(message.internalDate)).toISOString(),
    received_at: new Date(parseInt(message.internalDate)).toISOString(),
    direction: (message.labelIds || []).includes("SENT")
      ? ("outbound" as const)
      : ("inbound" as const),
    provider: "gmail" as const,
    provider_email_id: message.id,
  };
}

export async function fetchGmailMessages(
  refreshToken: string,
  maxResults = 25
) {
  const auth = getAuthenticatedClient(refreshToken);
  const gmail = google.gmail({ version: "v1", auth });

  const listRes = await gmail.users.messages.list({
    userId: "me",
    maxResults,
    labelIds: ["INBOX"],
  });

  if (!listRes.data.messages) return [];

  const messages = await Promise.all(
    listRes.data.messages.map(async (msg) => {
      const detail = await gmail.users.messages.get({
        userId: "me",
        id: msg.id!,
        format: "full",
      });
      return parseGmailMessage(detail.data);
    })
  );

  return messages;
}

export async function sendGmailMessage(params: {
  refreshToken: string;
  to: string;
  subject: string;
  body: string;
  cc?: string;
  bcc?: string;
  threadId?: string;
  inReplyTo?: string;
  references?: string;
}) {
  const auth = getAuthenticatedClient(params.refreshToken);
  const gmail = google.gmail({ version: "v1", auth });

  const messageParts = [
    `To: ${params.to}`,
    params.cc ? `Cc: ${params.cc}` : "",
    params.bcc ? `Bcc: ${params.bcc}` : "",
    `Subject: ${params.subject}`,
    params.inReplyTo ? `In-Reply-To: ${params.inReplyTo}` : "",
    params.references ? `References: ${params.references}` : "",
    "Content-Type: text/html; charset=utf-8",
    "",
    params.body,
  ]
    .filter(Boolean)
    .join("\r\n");

  const encodedMessage = Buffer.from(messageParts)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

  const res = await gmail.users.messages.send({
    userId: "me",
    requestBody: {
      raw: encodedMessage,
      ...(params.threadId && { threadId: params.threadId }),
    },
  });

  return { messageId: res.data.id!, threadId: res.data.threadId || undefined };
}

// --- Google Drive functions ---

export async function createDriveFolder(
  refreshToken: string,
  name: string,
  parentFolderId?: string
): Promise<string> {
  const auth = getAuthenticatedClient(refreshToken);
  const drive = google.drive({ version: "v3", auth });

  const fileMetadata: Record<string, unknown> = {
    name,
    mimeType: "application/vnd.google-apps.folder",
  };
  if (parentFolderId) {
    fileMetadata.parents = [parentFolderId];
  }

  const res = await drive.files.create({
    requestBody: fileMetadata,
    fields: "id",
  });

  return res.data.id!;
}

async function findFolder(
  drive: ReturnType<typeof google.drive>,
  name: string,
  parentId?: string
): Promise<string | null> {
  const escapedName = name.replace(/'/g, "\\'");
  const query = parentId
    ? `name='${escapedName}' and mimeType='application/vnd.google-apps.folder' and '${parentId}' in parents and trashed=false`
    : `name='${escapedName}' and mimeType='application/vnd.google-apps.folder' and trashed=false`;

  const res = await drive.files.list({ q: query, fields: "files(id)" });
  return res.data.files?.[0]?.id || null;
}

export async function ensureDriveFolderStructure(
  refreshToken: string,
  clientName: string,
  caseTitle: string
): Promise<{ clientFolderId: string; caseFolderId: string }> {
  const auth = getAuthenticatedClient(refreshToken);
  const drive = google.drive({ version: "v3", auth });

  // Find or create "Docketra" root folder
  let rootFolderId = await findFolder(drive, "Docketra");
  if (!rootFolderId) {
    rootFolderId = await createDriveFolder(refreshToken, "Docketra");
  }

  // Find or create client folder under Docketra
  let clientFolderId = await findFolder(drive, clientName, rootFolderId);
  if (!clientFolderId) {
    clientFolderId = await createDriveFolder(
      refreshToken,
      clientName,
      rootFolderId
    );
  }

  // Find or create case folder under client
  let caseFolderId = await findFolder(drive, caseTitle, clientFolderId);
  if (!caseFolderId) {
    caseFolderId = await createDriveFolder(
      refreshToken,
      caseTitle,
      clientFolderId
    );
  }

  return { clientFolderId, caseFolderId };
}

export async function uploadToDrive(
  refreshToken: string,
  fileName: string,
  fileBuffer: Buffer,
  mimeType: string,
  parentFolderId: string
): Promise<string> {
  const auth = getAuthenticatedClient(refreshToken);
  const drive = google.drive({ version: "v3", auth });

  const res = await drive.files.create({
    requestBody: {
      name: fileName,
      parents: [parentFolderId],
    },
    media: {
      mimeType,
      body: Readable.from(fileBuffer),
    },
    fields: "id",
  });

  return res.data.id!;
}

export async function listDriveFiles(
  refreshToken: string,
  folderId: string
) {
  const auth = getAuthenticatedClient(refreshToken);
  const drive = google.drive({ version: "v3", auth });

  const res = await drive.files.list({
    q: `'${folderId}' in parents and trashed=false`,
    fields: "files(id, name, mimeType, size, modifiedTime, webViewLink)",
    orderBy: "modifiedTime desc",
  });

  return res.data.files || [];
}

// --- Google Calendar functions ---

/* eslint-disable @typescript-eslint/no-explicit-any */

export interface DocketraEvent {
  title: string;
  description?: string | null;
  event_type: string;
  start_time: string;
  end_time?: string | null;
  all_day?: boolean;
  location?: string | null;
}

export function mapDocketraEventToGoogle(event: DocketraEvent) {
  const gcalEvent: any = {
    summary: event.title,
    description: event.description || undefined,
    location: event.location || undefined,
    extendedProperties: {
      private: {
        docketra_event_type: event.event_type,
      },
    },
  };

  if (event.all_day) {
    // All-day events use date (YYYY-MM-DD) instead of dateTime
    const startDate = event.start_time.split("T")[0];
    gcalEvent.start = { date: startDate };
    if (event.end_time) {
      const endDate = event.end_time.split("T")[0];
      gcalEvent.end = { date: endDate };
    } else {
      // Google requires end date; default to next day for single all-day event
      const [year, month, day] = startDate.split("-").map(Number);
      const nextDay = new Date(Date.UTC(year, month - 1, day + 1));
      gcalEvent.end = {
        date: nextDay.toISOString().split("T")[0],
      };
    }
  } else {
    gcalEvent.start = { dateTime: event.start_time };
    if (event.end_time) {
      gcalEvent.end = { dateTime: event.end_time };
    } else {
      // Default to 1 hour duration
      const endTime = new Date(
        new Date(event.start_time).getTime() + 60 * 60 * 1000
      ).toISOString();
      gcalEvent.end = { dateTime: endTime };
    }
  }

  return gcalEvent;
}

export function mapGoogleEventToDocketra(googleEvent: any): {
  title: string;
  description: string | null;
  event_type: string;
  start_time: string;
  end_time: string | null;
  all_day: boolean;
  location: string | null;
} {
  const allDay = !!googleEvent.start?.date;
  const startTime = allDay
    ? new Date(googleEvent.start.date + "T00:00:00Z").toISOString()
    : googleEvent.start?.dateTime || new Date().toISOString();
  const endTime = allDay
    ? googleEvent.end?.date
      ? new Date(googleEvent.end.date + "T00:00:00Z").toISOString()
      : null
    : googleEvent.end?.dateTime || null;

  const eventType =
    googleEvent.extendedProperties?.private?.docketra_event_type || "meeting";

  return {
    title: googleEvent.summary || "Untitled Event",
    description: googleEvent.description || null,
    event_type: eventType,
    start_time: startTime,
    end_time: endTime,
    all_day: allDay,
    location: googleEvent.location || null,
  };
}

export async function fetchGoogleCalendarEvents(
  refreshToken: string,
  timeMin: string,
  timeMax: string
) {
  const auth = getAuthenticatedClient(refreshToken);
  const calendar = google.calendar({ version: "v3", auth });

  const res = await calendar.events.list({
    calendarId: "primary",
    timeMin,
    timeMax,
    singleEvents: true,
    orderBy: "startTime",
  });

  return res.data.items || [];
}

export async function createGoogleCalendarEvent(
  refreshToken: string,
  event: DocketraEvent
): Promise<string> {
  const auth = getAuthenticatedClient(refreshToken);
  const calendar = google.calendar({ version: "v3", auth });

  const gcalEvent = mapDocketraEventToGoogle(event);
  const res = await calendar.events.insert({
    calendarId: "primary",
    requestBody: gcalEvent,
  });

  return res.data.id!;
}

export async function updateGoogleCalendarEvent(
  refreshToken: string,
  googleEventId: string,
  event: DocketraEvent
): Promise<string> {
  const auth = getAuthenticatedClient(refreshToken);
  const calendar = google.calendar({ version: "v3", auth });

  const gcalEvent = mapDocketraEventToGoogle(event);
  const res = await calendar.events.update({
    calendarId: "primary",
    eventId: googleEventId,
    requestBody: gcalEvent,
  });

  return res.data.id!;
}

export async function deleteGoogleCalendarEvent(
  refreshToken: string,
  googleEventId: string
): Promise<void> {
  const auth = getAuthenticatedClient(refreshToken);
  const calendar = google.calendar({ version: "v3", auth });

  try {
    await calendar.events.delete({
      calendarId: "primary",
      eventId: googleEventId,
    });
  } catch (err: any) {
    // Silently handle 404/410 — event already deleted on Google side
    if (err?.code === 404 || err?.code === 410) {
      return;
    }
    throw err;
  }
}

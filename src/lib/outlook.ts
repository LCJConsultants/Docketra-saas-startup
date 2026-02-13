import { Client } from "@microsoft/microsoft-graph-client";

const SCOPES = [
  "User.Read",
  "Mail.Read",
  "Mail.Send",
  "Mail.ReadWrite",
  "offline_access",
];

export function getOutlookAuthUrl(): string {
  const params = new URLSearchParams({
    client_id: process.env.MICROSOFT_CLIENT_ID!,
    response_type: "code",
    redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/integrations/outlook/callback`,
    scope: SCOPES.join(" "),
    response_mode: "query",
    prompt: "consent",
  });
  return `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?${params}`;
}

export async function handleOutlookCallback(code: string) {
  const tokenUrl = "https://login.microsoftonline.com/common/oauth2/v2.0/token";
  const body = new URLSearchParams({
    client_id: process.env.MICROSOFT_CLIENT_ID!,
    client_secret: process.env.MICROSOFT_CLIENT_SECRET!,
    code,
    redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/integrations/outlook/callback`,
    grant_type: "authorization_code",
    scope: SCOPES.join(" "),
  });

  const res = await fetch(tokenUrl, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Outlook token exchange failed: ${err}`);
  }

  return await res.json();
}

async function refreshOutlookToken(refreshToken: string) {
  const tokenUrl = "https://login.microsoftonline.com/common/oauth2/v2.0/token";
  const body = new URLSearchParams({
    client_id: process.env.MICROSOFT_CLIENT_ID!,
    client_secret: process.env.MICROSOFT_CLIENT_SECRET!,
    refresh_token: refreshToken,
    grant_type: "refresh_token",
    scope: SCOPES.join(" "),
  });

  const res = await fetch(tokenUrl, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });

  if (!res.ok) throw new Error("Failed to refresh Outlook token");
  return await res.json();
}

function getGraphClient(accessToken: string) {
  return Client.init({
    authProvider: (done) => done(null, accessToken),
  });
}

/* eslint-disable @typescript-eslint/no-explicit-any */
function parseOutlookMessage(msg: any) {
  return {
    message_id: msg.id,
    thread_id: msg.conversationId || msg.id,
    subject: msg.subject || "",
    from_address: msg.from?.emailAddress?.address || "",
    to_addresses: (msg.toRecipients || [])
      .map((r: any) => r.emailAddress?.address)
      .filter(Boolean),
    cc_addresses: (msg.ccRecipients || [])
      .map((r: any) => r.emailAddress?.address)
      .filter(Boolean),
    body_text: msg.body?.contentType === "text" ? msg.body?.content : "",
    body_html: msg.body?.contentType === "html" ? msg.body?.content : "",
    snippet: msg.bodyPreview || "",
    is_read: msg.isRead || false,
    is_starred: msg.flag?.flagStatus === "flagged",
    has_attachments: msg.hasAttachments || false,
    sent_at: msg.receivedDateTime,
    received_at: msg.receivedDateTime,
    direction: "inbound" as const,
    provider: "outlook" as const,
    provider_email_id: msg.id,
    labels: [],
  };
}

export async function fetchOutlookMessages(
  refreshToken: string,
  maxResults = 25
) {
  const tokens = await refreshOutlookToken(refreshToken);
  const client = getGraphClient(tokens.access_token);

  const result = await client
    .api("/me/mailFolders/inbox/messages")
    .top(maxResults)
    .select(
      "id,subject,from,toRecipients,ccRecipients,body,bodyPreview,receivedDateTime,isRead,hasAttachments,flag,conversationId"
    )
    .orderby("receivedDateTime desc")
    .get();

  return (result.value || []).map(parseOutlookMessage);
}

export async function sendOutlookMessage(params: {
  refreshToken: string;
  to: string;
  subject: string;
  body: string;
  cc?: string;
  bcc?: string;
  replyToMessageId?: string;
}) {
  const tokens = await refreshOutlookToken(params.refreshToken);
  const client = getGraphClient(tokens.access_token);

  if (params.replyToMessageId) {
    await client.api(`/me/messages/${params.replyToMessageId}/reply`).post({
      message: {
        toRecipients: [{ emailAddress: { address: params.to } }],
        ...(params.cc && {
          ccRecipients: [{ emailAddress: { address: params.cc } }],
        }),
        ...(params.bcc && {
          bccRecipients: [{ emailAddress: { address: params.bcc } }],
        }),
      },
      comment: params.body,
    });
    return { messageId: `outlook-reply-${Date.now()}` };
  }

  const message: Record<string, unknown> = {
    subject: params.subject,
    body: { contentType: "HTML", content: params.body },
    toRecipients: [{ emailAddress: { address: params.to } }],
  };

  if (params.cc) {
    message.ccRecipients = [{ emailAddress: { address: params.cc } }];
  }

  if (params.bcc) {
    message.bccRecipients = [{ emailAddress: { address: params.bcc } }];
  }

  await client.api("/me/sendMail").post({ message });
  return { messageId: `outlook-sent-${Date.now()}` };
}

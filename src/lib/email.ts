import { fetchGmailMessages, sendGmailMessage } from "@/lib/google";
import { fetchOutlookMessages, sendOutlookMessage } from "@/lib/outlook";
import { createAdminClient } from "@/lib/supabase/admin";

export async function syncEmails(
  userId: string,
  provider: "gmail" | "outlook",
  refreshToken: string
) {
  const supabase = createAdminClient();

  let rawMessages;
  if (provider === "gmail") {
    rawMessages = await fetchGmailMessages(refreshToken, 50);
  } else {
    rawMessages = await fetchOutlookMessages(refreshToken, 50);
  }

  let synced = 0;
  for (const msg of rawMessages) {
    const { data: existing } = await supabase
      .from("emails")
      .select("id")
      .eq("user_id", userId)
      .eq("provider_email_id", msg.provider_email_id)
      .maybeSingle();

    if (existing) {
      await supabase
        .from("emails")
        .update({ is_read: msg.is_read, is_starred: msg.is_starred })
        .eq("id", existing.id);
    } else {
      await supabase.from("emails").insert({
        user_id: userId,
        ...msg,
      });
      synced++;
    }
  }

  return { synced, total: rawMessages.length };
}

export async function sendEmail(params: {
  userId: string;
  provider: "gmail" | "outlook";
  refreshToken: string;
  to: string;
  subject: string;
  body: string;
  cc?: string;
  bcc?: string;
  caseId?: string;
  clientId?: string;
  threadId?: string;
  inReplyTo?: string;
  references?: string;
  replyToProviderEmailId?: string;
}) {
  let result;
  if (params.provider === "gmail") {
    result = await sendGmailMessage({
      refreshToken: params.refreshToken,
      to: params.to,
      subject: params.subject,
      body: params.body,
      cc: params.cc,
      bcc: params.bcc,
      threadId: params.threadId,
      inReplyTo: params.inReplyTo,
      references: params.references,
    });
  } else {
    result = await sendOutlookMessage({
      refreshToken: params.refreshToken,
      to: params.to,
      subject: params.subject,
      body: params.body,
      cc: params.cc,
      bcc: params.bcc,
      replyToMessageId: params.replyToProviderEmailId,
    });
  }

  // Store sent email in DB
  const supabase = createAdminClient();
  await supabase.from("emails").insert({
    user_id: params.userId,
    message_id: result.messageId,
    thread_id: params.threadId || null,
    subject: params.subject,
    from_address: "me",
    to_addresses: [params.to],
    cc_addresses: params.cc ? [params.cc] : [],
    bcc_addresses: params.bcc ? [params.bcc] : [],
    body_html: params.body,
    direction: "outbound",
    provider: params.provider,
    provider_email_id: result.messageId,
    sent_at: new Date().toISOString(),
    is_read: true,
    has_attachments: false,
    case_id: params.caseId || null,
    client_id: params.clientId || null,
  });

  return result;
}

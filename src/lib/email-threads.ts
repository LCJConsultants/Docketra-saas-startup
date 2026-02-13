import type { Email } from "@/types";

export interface EmailThread {
  threadId: string;
  emails: Email[];
  latestEmail: Email;
  messageCount: number;
  hasUnread: boolean;
  subject: string;
  participants: string[];
}

export function groupEmailsByThread(emails: Email[]): EmailThread[] {
  const threadMap = new Map<string, Email[]>();

  for (const email of emails) {
    const key = email.thread_id || email.id;
    const existing = threadMap.get(key) || [];
    existing.push(email);
    threadMap.set(key, existing);
  }

  const threads: EmailThread[] = [];
  for (const [threadId, threadEmails] of threadMap.entries()) {
    threadEmails.sort(
      (a, b) =>
        new Date(b.sent_at || b.created_at).getTime() -
        new Date(a.sent_at || a.created_at).getTime()
    );

    const latestEmail = threadEmails[0];
    const participants = [
      ...new Set(threadEmails.map((e) => e.from_address)),
    ];

    threads.push({
      threadId,
      emails: threadEmails,
      latestEmail,
      messageCount: threadEmails.length,
      hasUnread: threadEmails.some((e) => !e.is_read),
      subject: latestEmail.subject || "(no subject)",
      participants,
    });
  }

  threads.sort(
    (a, b) =>
      new Date(b.latestEmail.sent_at || b.latestEmail.created_at).getTime() -
      new Date(a.latestEmail.sent_at || a.latestEmail.created_at).getTime()
  );

  return threads;
}

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Mail, RefreshCw, Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { EmailList } from "@/components/emails/email-list";
import { EmailViewer } from "@/components/emails/email-viewer";
import { EmailComposer } from "@/components/emails/email-composer";
import { markEmailRead } from "@/actions/emails";
import { groupEmailsByThread, type EmailThread } from "@/lib/email-threads";
import { formatDateTime } from "@/lib/utils";
import { toast } from "sonner";
import type { Email } from "@/types";

interface EmailsClientProps {
  emails: Email[];
  cases: Array<{ id: string; title: string }>;
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").trim();
}

function buildQuotedBody(email: Email): string {
  const date = email.sent_at ? formatDateTime(email.sent_at) : "";
  const attribution = `\n\nOn ${date}, ${email.from_address} wrote:\n`;
  const originalText = email.body_text || stripHtml(email.body_html || "");
  const quoted = originalText
    .split("\n")
    .map((line) => `> ${line}`)
    .join("\n");
  return attribution + quoted;
}

function buildForwardedBody(email: Email): string {
  const date = email.sent_at ? formatDateTime(email.sent_at) : "";
  const header = `\n\n---------- Forwarded message ---------\nFrom: ${email.from_address}\nDate: ${date}\nSubject: ${email.subject || ""}\nTo: ${email.to_addresses.join(", ")}\n\n`;
  return header + (email.body_text || stripHtml(email.body_html || ""));
}

export function EmailsClient({
  emails: initialEmails,
  cases,
}: EmailsClientProps) {
  const router = useRouter();
  const [emails, setEmails] = useState(initialEmails);
  const [selectedThread, setSelectedThread] = useState<EmailThread | null>(null);
  const [showComposer, setShowComposer] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [initialSyncDone, setInitialSyncDone] = useState(false);
  const [composerMode, setComposerMode] = useState<"compose" | "reply" | "forward">("compose");
  const [composerDefaults, setComposerDefaults] = useState<{
    to?: string;
    subject?: string;
    body?: string;
    cc?: string;
    replyToEmailId?: string;
  }>({});

  const threads = groupEmailsByThread(emails);

  // Auto-sync on first mount if no emails cached
  useEffect(() => {
    if (!initialSyncDone && initialEmails.length === 0) {
      handleSync();
    }
    setInitialSyncDone(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSync = async () => {
    setSyncing(true);
    try {
      const res = await fetch("/api/emails/sync", { method: "POST" });
      if (res.ok) {
        router.refresh();
      } else {
        toast.error("Failed to sync emails");
      }
    } catch {
      toast.error("Failed to sync emails");
    } finally {
      setSyncing(false);
    }
  };

  const handleSelectThread = async (thread: EmailThread) => {
    setSelectedThread(thread);
    const unreadEmails = thread.emails.filter((e) => !e.is_read);
    for (const email of unreadEmails) {
      await markEmailRead(email.id);
    }
    if (unreadEmails.length > 0) {
      setEmails((prev) =>
        prev.map((e) =>
          thread.emails.some((te) => te.id === e.id)
            ? { ...e, is_read: true }
            : e
        )
      );
    }
  };

  const handleReply = (email: Email) => {
    const quotedBody = buildQuotedBody(email);
    setComposerMode("reply");
    setComposerDefaults({
      to: email.from_address,
      subject: email.subject?.startsWith("Re: ")
        ? email.subject
        : `Re: ${email.subject || ""}`,
      body: quotedBody,
      cc: email.cc_addresses?.join(", ") || "",
      replyToEmailId: email.id,
    });
    setShowComposer(true);
  };

  const handleForward = (email: Email) => {
    const forwardedBody = buildForwardedBody(email);
    setComposerMode("forward");
    setComposerDefaults({
      to: "",
      subject: email.subject?.startsWith("Fwd: ")
        ? email.subject
        : `Fwd: ${email.subject || ""}`,
      body: forwardedBody,
    });
    setShowComposer(true);
  };

  const handleSendEmail = async (data: {
    to: string;
    subject: string;
    body: string;
    cc?: string;
    bcc?: string;
    replyToEmailId?: string;
  }) => {
    const res = await fetch("/api/emails/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        to: data.to,
        subject: data.subject,
        message: data.body,
        cc: data.cc,
        bcc: data.bcc,
        replyToEmailId: data.replyToEmailId,
      }),
    });
    if (!res.ok) throw new Error("Failed to send");
    setShowComposer(false);
    setComposerDefaults({});
    setComposerMode("compose");
    router.refresh();
  };

  const handleOpenCompose = () => {
    setComposerMode("compose");
    setComposerDefaults({});
    setShowComposer(true);
  };

  const handleCloseComposer = () => {
    setShowComposer(false);
    setComposerDefaults({});
    setComposerMode("compose");
  };

  // Update local state when initialEmails changes (after router.refresh)
  useEffect(() => {
    setEmails(initialEmails);
  }, [initialEmails]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Emails"
        description="Your email inbox linked to cases"
        action={
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleSync} disabled={syncing}>
              {syncing ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              Sync
            </Button>
            <Button onClick={handleOpenCompose}>
              <Plus className="h-4 w-4 mr-2" />
              Compose
            </Button>
          </div>
        }
      />

      {showComposer && (
        <EmailComposer
          mode={composerMode}
          defaultTo={composerDefaults.to || ""}
          defaultSubject={composerDefaults.subject || ""}
          defaultBody={composerDefaults.body || ""}
          defaultCc={composerDefaults.cc || ""}
          replyToEmailId={composerDefaults.replyToEmailId}
          onClose={handleCloseComposer}
          onSend={handleSendEmail}
        />
      )}

      {emails.length === 0 ? (
        <EmptyState
          icon={<Mail className="h-8 w-8 text-muted-foreground" />}
          title="No emails yet"
          description={
            syncing
              ? "Syncing your emails..."
              : "Click Sync to fetch your latest emails."
          }
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <EmailList
              threads={threads}
              selectedThreadId={selectedThread?.threadId}
              onSelectThread={handleSelectThread}
            />
          </div>
          <div className="lg:col-span-2">
            {selectedThread ? (
              <EmailViewer
                emails={selectedThread.emails}
                onReply={handleReply}
                onForward={handleForward}
              />
            ) : (
              <div className="flex items-center justify-center h-64 text-muted-foreground border rounded-lg">
                Select a conversation to view
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

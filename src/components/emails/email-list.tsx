"use client";

import { Badge } from "@/components/ui/badge";
import { formatRelative } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { EmailThread } from "@/lib/email-threads";

interface EmailListProps {
  threads: EmailThread[];
  selectedThreadId?: string;
  onSelectThread: (thread: EmailThread) => void;
}

export function EmailList({ threads, selectedThreadId, onSelectThread }: EmailListProps) {
  return (
    <div className="space-y-1">
      {threads.map((thread) => {
        const email = thread.latestEmail;
        return (
          <div
            key={thread.threadId}
            onClick={() => onSelectThread(thread)}
            className={cn(
              "rounded-lg p-3 cursor-pointer transition-colors",
              selectedThreadId === thread.threadId
                ? "bg-primary/5 border border-primary/20"
                : "hover:bg-muted/50",
              thread.hasUnread && "font-semibold"
            )}
          >
            <div className="flex items-center gap-2 mb-1">
              {thread.hasUnread && (
                <span className="h-2 w-2 rounded-full bg-primary shrink-0" />
              )}
              <span
                className={cn(
                  "text-sm truncate flex-1",
                  thread.hasUnread && "font-semibold"
                )}
              >
                {email.direction === "inbound"
                  ? email.from_address
                  : email.to_addresses[0]}
              </span>
              {thread.messageCount > 1 && (
                <Badge variant="secondary" className="text-[10px] shrink-0">
                  {thread.messageCount}
                </Badge>
              )}
              <Badge
                variant={email.direction === "inbound" ? "info" : "secondary"}
                className="text-[10px] shrink-0"
              >
                {email.direction === "inbound" ? "In" : "Out"}
              </Badge>
            </div>
            <p
              className={cn(
                "text-sm truncate",
                thread.hasUnread && "font-medium"
              )}
            >
              {thread.subject}
            </p>
            <p className="text-xs text-muted-foreground mt-1 truncate">
              {email.body_text?.slice(0, 100) || ""}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {email.sent_at ? formatRelative(email.sent_at) : ""}
            </p>
          </div>
        );
      })}
    </div>
  );
}

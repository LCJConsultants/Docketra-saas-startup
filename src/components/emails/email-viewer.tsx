"use client";

import { useState, useMemo } from "react";
import DOMPurify from "isomorphic-dompurify";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Reply, Forward, Paperclip, ExternalLink, ChevronDown, ChevronRight } from "lucide-react";
import { formatDateTime } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { Email } from "@/types";
import Link from "next/link";

interface EmailViewerProps {
  emails: Email[];
  onReply?: (email: Email) => void;
  onForward?: (email: Email) => void;
}

function SingleEmailView({
  email,
  isLatest,
  defaultExpanded,
  onReply,
  onForward,
}: {
  email: Email;
  isLatest: boolean;
  defaultExpanded: boolean;
  onReply?: (email: Email) => void;
  onForward?: (email: Email) => void;
}) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  const sanitizedHtml = useMemo(() => {
    if (!email.body_html) return "";
    return DOMPurify.sanitize(email.body_html, {
      FORBID_TAGS: ["script", "iframe", "object", "embed", "form", "input", "textarea", "button"],
      FORBID_ATTR: ["onerror", "onload", "onclick", "onmouseover", "onfocus", "onblur"],
      ALLOW_DATA_ATTR: false,
    });
  }, [email.body_html]);

  return (
    <Card>
      <CardHeader
        className={cn("space-y-3", !isLatest && "cursor-pointer")}
        onClick={!isLatest ? () => setExpanded(!expanded) : undefined}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            {!isLatest && (
              expanded ? (
                <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
              ) : (
                <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
              )
            )}
            <h2 className={cn("font-semibold truncate", isLatest ? "text-lg" : "text-sm")}>
              {email.subject || "(no subject)"}
            </h2>
          </div>
          {isLatest && (
            <div className="flex items-center gap-2 shrink-0">
              <Button variant="ghost" size="sm" onClick={() => onReply?.(email)}>
                <Reply className="h-4 w-4 mr-1" />
                Reply
              </Button>
              <Button variant="ghost" size="sm" onClick={() => onForward?.(email)}>
                <Forward className="h-4 w-4 mr-1" />
                Forward
              </Button>
            </div>
          )}
        </div>
        <div className="flex items-center gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">From:</span>{" "}
            <span className="font-medium">{email.from_address}</span>
          </div>
          <div>
            <span className="text-muted-foreground">To:</span>{" "}
            <span>{email.to_addresses.join(", ")}</span>
          </div>
        </div>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          {email.sent_at && <span>{formatDateTime(email.sent_at)}</span>}
          {email.case_id && (
            <Link href={`/cases/${email.case_id}`} className="flex items-center gap-1 hover:text-primary">
              <ExternalLink className="h-3 w-3" />
              View Case
            </Link>
          )}
        </div>
      </CardHeader>
      {expanded && (
        <CardContent>
          {email.body_html ? (
            <div
              className="prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
            />
          ) : (
            <pre className="whitespace-pre-wrap text-sm">{email.body_text}</pre>
          )}

          {email.attachments && email.attachments.length > 0 && (
            <div className="mt-4 pt-4 border-t">
              <p className="text-xs text-muted-foreground font-medium mb-2 flex items-center gap-1">
                <Paperclip className="h-3 w-3" />
                Attachments ({email.attachments.length})
              </p>
              <div className="flex flex-wrap gap-2">
                {email.attachments.map((att, idx) => (
                  <Badge key={idx} variant="outline" className="gap-1">
                    <Paperclip className="h-3 w-3" />
                    {att.name}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}

export function EmailViewer({ emails, onReply, onForward }: EmailViewerProps) {
  const sorted = [...emails].sort(
    (a, b) =>
      new Date(a.sent_at || a.created_at).getTime() -
      new Date(b.sent_at || b.created_at).getTime()
  );

  return (
    <div className="space-y-3">
      {sorted.map((email, index) => {
        const isLatest = index === sorted.length - 1;
        return (
          <SingleEmailView
            key={email.id}
            email={email}
            isLatest={isLatest}
            defaultExpanded={isLatest}
            onReply={onReply}
            onForward={onForward}
          />
        );
      })}
    </div>
  );
}

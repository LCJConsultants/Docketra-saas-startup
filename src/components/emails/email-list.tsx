"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatRelative } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { Email } from "@/types";

interface EmailListProps {
  emails: Email[];
  selectedId?: string;
  onSelect: (email: Email) => void;
}

export function EmailList({ emails, selectedId, onSelect }: EmailListProps) {
  return (
    <div className="space-y-1">
      {emails.map((email) => (
        <div
          key={email.id}
          onClick={() => onSelect(email)}
          className={cn(
            "rounded-lg p-3 cursor-pointer transition-colors",
            selectedId === email.id ? "bg-primary/5 border border-primary/20" : "hover:bg-muted/50"
          )}
        >
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-medium truncate flex-1">
              {email.direction === "inbound" ? email.from_address : email.to_addresses[0]}
            </span>
            <Badge variant={email.direction === "inbound" ? "info" : "secondary"} className="text-[10px] shrink-0">
              {email.direction === "inbound" ? "In" : "Out"}
            </Badge>
          </div>
          <p className="text-sm truncate">{email.subject || "(no subject)"}</p>
          <p className="text-xs text-muted-foreground mt-1 truncate">
            {email.body_text?.slice(0, 100) || ""}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {email.sent_at ? formatRelative(email.sent_at) : ""}
          </p>
        </div>
      ))}
    </div>
  );
}

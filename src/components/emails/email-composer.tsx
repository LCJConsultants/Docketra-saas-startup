"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Send, X } from "lucide-react";
import { toast } from "sonner";

interface EmailComposerProps {
  defaultTo?: string;
  defaultSubject?: string;
  onClose?: () => void;
  onSend?: (data: { to: string; subject: string; body: string }) => Promise<void>;
}

export function EmailComposer({ defaultTo = "", defaultSubject = "", onClose, onSend }: EmailComposerProps) {
  const [to, setTo] = useState(defaultTo);
  const [subject, setSubject] = useState(defaultSubject);
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!to || !body) {
      toast.error("Please fill in To and message body");
      return;
    }

    setLoading(true);
    try {
      if (onSend) {
        await onSend({ to, subject, body });
      }
      toast.success("Email sent");
      onClose?.();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to send email");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="text-lg">New Email</CardTitle>
        {onClose && (
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
            <X className="h-4 w-4" />
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="to">To</Label>
          <Input id="to" type="email" value={to} onChange={(e) => setTo(e.target.value)} placeholder="client@email.com" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="subject">Subject</Label>
          <Input id="subject" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Subject" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="body">Message</Label>
          <Textarea id="body" value={body} onChange={(e) => setBody(e.target.value)} rows={8} placeholder="Write your message..." />
        </div>
        <div className="flex justify-end">
          <Button onClick={handleSend} disabled={loading}>
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
            Send
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

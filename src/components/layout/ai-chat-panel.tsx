"use client";

import { useState } from "react";
import { X, Send, Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface AIChatPanelProps {
  open: boolean;
  onClose: () => void;
}

export function AIChatPanel({ open, onClose }: AIChatPanelProps) {
  const [input, setInput] = useState("");
  const [isLoading] = useState(false);

  if (!open) return null;

  return (
    <div className="fixed right-0 top-0 z-50 h-full w-full sm:w-[400px] border-l bg-card shadow-xl flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 h-14 border-b">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-accent" />
          <span className="font-semibold text-sm">AI Assistant</span>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="flex flex-col items-center justify-center h-full text-center px-4 py-12">
          <div className="rounded-full bg-accent/10 p-4 mb-4">
            <Sparkles className="h-8 w-8 text-accent" />
          </div>
          <h3 className="font-semibold text-lg">Docketra AI</h3>
          <p className="text-sm text-muted-foreground mt-2">
            Ask me to draft documents, look up case details, summarize files, or help with any legal task.
          </p>
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="p-4 border-t">
        <div className="flex gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask anything..."
            className="min-h-[44px] max-h-[120px] resize-none"
            rows={1}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
              }
            }}
          />
          <Button
            size="icon"
            disabled={!input.trim() || isLoading}
            className={cn("shrink-0", isLoading && "opacity-50")}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

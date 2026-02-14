"use client";

import { useRef, useEffect, useState } from "react";
import { X, Send, Sparkles, Loader2, Paperclip, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useAiChat } from "@/hooks/use-ai-chat";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

const ACCEPTED_FILE_TYPES = [
  ".pdf",
  ".doc",
  ".docx",
  ".txt",
  ".rtf",
  ".odt",
  ".xls",
  ".xlsx",
  ".csv",
  ".png",
  ".jpg",
  ".jpeg",
].join(",");

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

interface AIChatPanelProps {
  open: boolean;
  onClose: () => void;
}

export function AIChatPanel({ open, onClose }: AIChatPanelProps) {
  const { messages, sendMessage, isLoading, error, input, setInput, attachedFile, setAttachedFile } = useAiChat();
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileError, setFileError] = useState<string | null>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileError(null);

    if (file.size > MAX_FILE_SIZE) {
      setFileError(`File size exceeds 10MB limit (${formatFileSize(file.size)})`);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    setAttachedFile(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleRemoveFile = () => {
    setAttachedFile(null);
    setFileError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSend = () => {
    if ((!input.trim() && !attachedFile) || isLoading) return;
    sendMessage(input, undefined, attachedFile || undefined);
    setInput("");
    setAttachedFile(null);
    setFileError(null);
  };

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
      <ScrollArea className="flex-1" ref={scrollRef}>
        <div className="p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center px-4 py-12">
              <div className="rounded-full bg-accent/10 p-4 mb-4">
                <Sparkles className="h-8 w-8 text-accent" />
              </div>
              <h3 className="font-semibold text-lg">Docketra AI</h3>
              <p className="text-sm text-muted-foreground mt-2">
                Ask me to draft documents, look up case details, summarize files, or help with any legal task.
              </p>
            </div>
          ) : (
            messages.map((msg, i) => (
              <div
                key={i}
                className={cn(
                  "flex",
                  msg.role === "user" ? "justify-end" : "justify-start"
                )}
              >
                <div
                  className={cn(
                    "max-w-[85%] rounded-lg px-3 py-2 text-sm",
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  )}
                >
                  {msg.attachment && (
                    <div className={cn(
                      "flex items-center gap-1.5 text-xs mb-1.5 px-2 py-1 rounded",
                      msg.role === "user"
                        ? "bg-primary-foreground/10"
                        : "bg-background/50"
                    )}>
                      <FileText className="h-3 w-3 shrink-0" />
                      <span className="truncate">{msg.attachment.fileName}</span>
                      <span className="shrink-0 opacity-70">
                        ({formatFileSize(msg.attachment.fileSize)})
                      </span>
                    </div>
                  )}
                  {msg.content || (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  )}
                </div>
              </div>
            ))
          )}

          {error && (
            <div className="rounded-lg bg-destructive/10 text-destructive px-3 py-2 text-sm">
              {error}
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="p-4 border-t">
        {/* File preview chip */}
        {attachedFile && (
          <div className="flex items-center gap-2 mb-2 px-2 py-1.5 bg-muted rounded-md text-sm">
            <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
            <span className="truncate">{attachedFile.name}</span>
            <span className="text-muted-foreground shrink-0">
              ({formatFileSize(attachedFile.size)})
            </span>
            <button
              onClick={handleRemoveFile}
              className="ml-auto shrink-0 text-muted-foreground hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        {/* File size error */}
        {fileError && (
          <div className="text-destructive text-xs mb-2">{fileError}</div>
        )}

        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept={ACCEPTED_FILE_TYPES}
          onChange={handleFileSelect}
        />

        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0 h-[44px] w-[44px]"
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading}
          >
            <Paperclip className="h-4 w-4" />
          </Button>
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={attachedFile ? "Describe what to do with the file..." : "Ask anything..."}
            className="min-h-[44px] max-h-[120px] resize-none"
            rows={1}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
          />
          <Button
            size="icon"
            disabled={(!input.trim() && !attachedFile) || isLoading}
            onClick={handleSend}
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

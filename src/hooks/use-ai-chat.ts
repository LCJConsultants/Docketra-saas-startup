"use client";

import { useState, useCallback } from "react";
import type { ChatMessage } from "@/types/ai";

export function useAiChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [attachedFile, setAttachedFile] = useState<File | null>(null);

  const sendMessage = useCallback(
    async (content: string, caseId?: string, file?: File) => {
      if (!content.trim() && !file) return;

      setError(null);
      setIsLoading(true);

      const userMessage: ChatMessage = {
        role: "user",
        content,
        timestamp: new Date().toISOString(),
        ...(file && {
          attachment: {
            fileName: file.name,
            fileType: file.type,
            fileSize: file.size,
          },
        }),
      };

      setMessages((prev) => [...prev, userMessage]);

      // Prepare messages for the API (without timestamps and attachments)
      const apiMessages = [...messages, userMessage].map((m) => ({
        role: m.role,
        content: m.content,
      }));

      try {
        let response: Response;

        if (file) {
          const formData = new FormData();
          formData.append("file", file);
          formData.append("messages", JSON.stringify(apiMessages));
          if (caseId) formData.append("caseId", caseId);

          response = await fetch("/api/ai/chat", {
            method: "POST",
            body: formData,
          });
        } else {
          response = await fetch("/api/ai/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ messages: apiMessages, caseId }),
          });
        }

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || "Failed to send message");
        }

        const reader = response.body?.getReader();
        if (!reader) throw new Error("No response stream");

        const decoder = new TextDecoder();
        let assistantContent = "";

        // Add placeholder assistant message
        const assistantMessage: ChatMessage = {
          role: "assistant",
          content: "",
          timestamp: new Date().toISOString(),
        };

        setMessages((prev) => [...prev, assistantMessage]);

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          assistantContent += chunk;

          // Update the last message (assistant) with accumulated content
          setMessages((prev) => {
            const updated = [...prev];
            updated[updated.length - 1] = {
              ...updated[updated.length - 1],
              content: assistantContent,
            };
            return updated;
          });
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "An unexpected error occurred";
        setError(errorMessage);

        // Remove the empty assistant message on error
        setMessages((prev) => {
          const last = prev[prev.length - 1];
          if (last?.role === "assistant" && !last.content) {
            return prev.slice(0, -1);
          }
          return prev;
        });
      } finally {
        setIsLoading(false);
      }
    },
    [messages]
  );

  return { messages, sendMessage, isLoading, error, input, setInput, attachedFile, setAttachedFile };
}

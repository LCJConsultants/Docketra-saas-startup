"use client";

import { useState } from "react";
import { Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

interface QuickActionsProps {
  caseId: string;
  caseTitle: string;
}

const actions = [
  { label: "Draft Motion", prompt: "Draft a motion for this case. Ask me what type of motion is needed." },
  { label: "Draft Letter", prompt: "Draft a professional legal letter related to this case. Ask me who the recipient should be and the purpose of the letter." },
  { label: "Summarize Case", prompt: "Please provide a comprehensive summary of this case, including all key details, parties involved, current status, and any important dates." },
  { label: "Research", prompt: "I need legal research assistance for this case. What specific legal questions or topics would you like me to research?" },
];

export function QuickActions({ caseId, caseTitle }: QuickActionsProps) {
  const [loading, setLoading] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [resultTitle, setResultTitle] = useState("");
  const [showResult, setShowResult] = useState(false);

  const handleAction = async (prompt: string, label: string) => {
    setLoading(label);

    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content: prompt }],
          caseId,
        }),
      });

      if (!response.ok) throw new Error("Failed to get AI response");

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No response stream");

      const decoder = new TextDecoder();
      let content = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        content += decoder.decode(value, { stream: true });
      }

      setResultTitle(label);
      setResult(content);
      setShowResult(true);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setLoading(null);
    }
  };

  return (
    <>
      <div className="flex items-center gap-2 flex-wrap">
        {actions.map(({ label, prompt }) => (
          <Button
            key={label}
            variant="outline"
            size="sm"
            disabled={loading !== null}
            onClick={() => handleAction(prompt, label)}
          >
            {loading === label ? (
              <Loader2 className="h-3 w-3 mr-1.5 animate-spin" />
            ) : (
              <Sparkles className="h-3 w-3 mr-1.5" />
            )}
            {label}
          </Button>
        ))}
      </div>

      <Dialog open={showResult} onOpenChange={setShowResult}>
        <DialogContent className="max-w-3xl max-h-[85vh]">
          <DialogHeader>
            <DialogTitle>{resultTitle} — {caseTitle}</DialogTitle>
            <DialogDescription>
              AI-generated content. Please review carefully before using.
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh]">
            <div className="prose prose-sm max-w-none whitespace-pre-wrap text-sm">
              {result}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  );
}

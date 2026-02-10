"use client";

import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface QuickActionsProps {
  caseId: string;
  caseTitle: string;
}

const actions = [
  { label: "Draft Motion", action: "draft_motion" },
  { label: "Draft Letter", action: "draft_letter" },
  { label: "Summarize Case", action: "summarize_case" },
  { label: "Research", action: "research" },
] as const;

export function QuickActions({ caseId, caseTitle }: QuickActionsProps) {
  const handleAction = (action: string, label: string) => {
    toast.info(`${label} for "${caseTitle}" - Coming soon`, {
      description: `Case ID: ${caseId}`,
    });
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {actions.map(({ label, action }) => (
        <Button
          key={action}
          variant="outline"
          size="sm"
          onClick={() => handleAction(action, label)}
        >
          <Sparkles className="h-3 w-3 mr-1.5" />
          {label}
        </Button>
      ))}
    </div>
  );
}

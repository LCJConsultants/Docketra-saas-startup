"use client";

import { Mic } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function VoiceButton() {
  const handleClick = () => {
    toast.info("Voice input coming soon", {
      description: "This feature is currently in development.",
    });
  };

  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      onClick={handleClick}
      className="shrink-0"
    >
      <Mic className="h-4 w-4" />
    </Button>
  );
}

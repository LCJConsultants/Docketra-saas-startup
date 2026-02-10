"use client";

import { useState } from "react";
import { useTimer } from "@/hooks/use-timer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Play, Pause, Square, Clock } from "lucide-react";
import { startTimerAction, stopTimerAction } from "@/actions/time-entries";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface TimerWidgetProps {
  cases: { id: string; title: string }[];
}

export function TimerWidget({ cases }: TimerWidgetProps) {
  const [selectedCaseId, setSelectedCaseId] = useState("");
  const [description, setDescription] = useState("");

  const timer = useTimer();

  const handleStart = async () => {
    if (!selectedCaseId) {
      toast.error("Select a case first");
      return;
    }

    try {
      const entry = await startTimerAction(selectedCaseId);
      timer.start(selectedCaseId, entry.id);
      toast.success("Timer started");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to start timer");
    }
  };

  const handleStop = async () => {
    const result = timer.stop();

    if (!result.timeEntryId) return;

    if (!description.trim()) {
      toast.error("Please add a description before stopping");
      timer.resume();
      return;
    }

    try {
      await stopTimerAction(result.timeEntryId, description);
      toast.success(`Timer stopped — ${result.durationMinutes} minute(s) recorded`);
      setDescription("");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to stop timer");
    }
  };

  return (
    <div className={cn(
      "rounded-xl border bg-card p-4 shadow-sm transition-all",
      timer.isRunning && "border-emerald-300 bg-emerald-50/50"
    )}>
      <div className="flex items-center gap-2 mb-3">
        <Clock className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium">Timer</span>
      </div>

      <div className="text-3xl font-mono font-semibold text-center mb-3">
        {timer.formattedTime}
      </div>

      {!timer.isRunning && !timer.timeEntryId && (
        <div className="space-y-3">
          <Select value={selectedCaseId} onValueChange={setSelectedCaseId}>
            <SelectTrigger>
              <SelectValue placeholder="Select a case" />
            </SelectTrigger>
            <SelectContent>
              {cases.map((c) => (
                <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={handleStart} className="w-full gap-2" disabled={!selectedCaseId}>
            <Play className="h-4 w-4" />
            Start Timer
          </Button>
        </div>
      )}

      {timer.isRunning && (
        <div className="space-y-3">
          <Input
            placeholder="What are you working on?"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => timer.pause()} className="flex-1 gap-2">
              <Pause className="h-4 w-4" />
              Pause
            </Button>
            <Button variant="destructive" onClick={handleStop} className="flex-1 gap-2">
              <Square className="h-4 w-4" />
              Stop
            </Button>
          </div>
        </div>
      )}

      {!timer.isRunning && timer.elapsedSeconds > 0 && (
        <div className="space-y-3">
          <Input
            placeholder="What did you work on?"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => timer.resume()} className="flex-1 gap-2">
              <Play className="h-4 w-4" />
              Resume
            </Button>
            <Button variant="destructive" onClick={handleStop} className="flex-1 gap-2">
              <Square className="h-4 w-4" />
              Save
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { createTimeEntryAction } from "@/actions/time-entries";
import { toast } from "sonner";

interface TimeEntryFormProps {
  cases: { id: string; title: string }[];
  defaultCaseId?: string;
  onSuccess?: () => void;
}

export function TimeEntryForm({ cases, defaultCaseId, onSuccess }: TimeEntryFormProps) {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData(e.currentTarget);
      // Convert hours:minutes to total minutes
      const hours = parseInt(formData.get("hours") as string) || 0;
      const minutes = parseInt(formData.get("minutes") as string) || 0;
      formData.set("duration_minutes", String(hours * 60 + minutes));
      formData.delete("hours");
      formData.delete("minutes");

      await createTimeEntryAction(formData);
      toast.success("Time entry added");
      onSuccess?.();
      (e.target as HTMLFormElement).reset();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Manual Time Entry</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="case_id">Case *</Label>
            <Select name="case_id" defaultValue={defaultCaseId} required>
              <SelectTrigger>
                <SelectValue placeholder="Select a case" />
              </SelectTrigger>
              <SelectContent>
                {cases.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Input id="description" name="description" placeholder="Drafted motion for summary judgment" required />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="hours">Hours</Label>
              <Input id="hours" name="hours" type="number" min="0" max="24" defaultValue="0" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="minutes">Minutes</Label>
              <Input id="minutes" name="minutes" type="number" min="0" max="59" defaultValue="30" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="hourly_rate">Rate ($/hr)</Label>
              <Input id="hourly_rate" name="hourly_rate" type="number" step="0.01" min="0" placeholder="250.00" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Date *</Label>
              <Input id="date" name="date" type="date" defaultValue={new Date().toISOString().split("T")[0]} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="is_billable">Billable</Label>
              <Select name="is_billable" defaultValue="true">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Billable</SelectItem>
                  <SelectItem value="false">Non-billable</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button type="submit" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Add Entry
          </Button>
        </CardContent>
      </Card>
    </form>
  );
}

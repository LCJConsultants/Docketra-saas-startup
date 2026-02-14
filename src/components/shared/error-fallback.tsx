"use client";

import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface ErrorFallbackProps {
  error: Error & { digest?: string };
  reset: () => void;
  title?: string;
}

export function ErrorFallback({ error, reset, title = "Something went wrong" }: ErrorFallbackProps) {
  return (
    <div className="flex items-center justify-center py-16 px-4">
      <Card className="max-w-md w-full">
        <CardContent className="pt-6 text-center">
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-destructive/10 p-3">
              <AlertTriangle className="h-6 w-6 text-destructive" />
            </div>
          </div>
          <h2 className="text-lg font-semibold mb-2">{title}</h2>
          <p className="text-sm text-muted-foreground mb-6">
            {error.message || "An unexpected error occurred. Please try again."}
          </p>
          <div className="flex items-center justify-center gap-3">
            <Button onClick={reset}>Try Again</Button>
            <Button variant="outline" onClick={() => window.history.back()}>
              Go Back
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

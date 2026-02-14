"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Scale, Loader2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { updateProfileAction } from "@/actions/settings";

export default function OnboardingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData(e.currentTarget);
      await updateProfileAction(formData);
      toast.success("Profile set up successfully!");
      router.push("/dashboard");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save profile");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary">
              <Scale className="h-6 w-6 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl">Welcome to Docketra</CardTitle>
          <CardDescription>
            Let&apos;s set up your profile so you can get started.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="full_name">Full Name *</Label>
              <Input
                id="full_name"
                name="full_name"
                placeholder="John Smith, Esq."
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="firm_name">Firm Name</Label>
              <Input
                id="firm_name"
                name="firm_name"
                placeholder="Smith Law Office"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bar_number">Bar Number</Label>
              <Input
                id="bar_number"
                name="bar_number"
                placeholder="e.g. 12345"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                placeholder="(555) 123-4567"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="practice_areas">Practice Areas</Label>
              <Input
                id="practice_areas"
                name="practice_areas"
                placeholder="Criminal Defense, Family Law, Civil Litigation"
              />
              <p className="text-xs text-muted-foreground">Separate multiple areas with commas</p>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <ArrowRight className="mr-2 h-4 w-4" />
              )}
              Get Started
            </Button>

            <button
              type="button"
              onClick={() => router.push("/dashboard")}
              className="w-full text-sm text-muted-foreground hover:text-foreground text-center"
            >
              Skip for now
            </button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

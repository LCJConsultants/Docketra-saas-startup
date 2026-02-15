"use client";

import { useState } from "react";
import { Scale, Mail, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

export default function VerifyEmailPage() {
  const [loading, setLoading] = useState(false);

  const handleResend = async () => {
    setLoading(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (user?.email) {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email: user.email,
      });

      if (error) {
        toast.error(error.message);
      } else {
        toast.success("Verification email sent! Check your inbox.");
      }
    }
    setLoading(false);
  };

  const handleRefresh = () => {
    window.location.href = "/dashboard";
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary">
              <Scale className="h-6 w-6 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl">Check your email</CardTitle>
          <CardDescription>
            We sent you a verification link. Please check your inbox and click the link to verify your email address.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-center p-6">
            <div className="rounded-full bg-primary/10 p-4">
              <Mail className="h-8 w-8 text-primary" />
            </div>
          </div>

          <p className="text-sm text-muted-foreground text-center">
            Don&apos;t see the email? Check your spam folder or click below to resend.
          </p>

          <div className="space-y-2">
            <Button onClick={handleRefresh} className="w-full">
              I&apos;ve verified my email
            </Button>
            <Button
              variant="outline"
              onClick={handleResend}
              disabled={loading}
              className="w-full"
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Resend verification email
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

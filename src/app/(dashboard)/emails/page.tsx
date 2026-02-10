import { Mail, Plug } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export default async function EmailsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("gmail_refresh_token, outlook_refresh_token")
    .eq("id", user!.id)
    .single();

  const hasEmailConnected = profile?.gmail_refresh_token || profile?.outlook_refresh_token;

  // Fetch emails if connected
  let emails: Array<Record<string, unknown>> = [];
  if (hasEmailConnected) {
    const { data } = await supabase
      .from("emails")
      .select("*")
      .eq("user_id", user!.id)
      .order("sent_at", { ascending: false })
      .limit(50);
    emails = data || [];
  }

  if (!hasEmailConnected) {
    return (
      <div className="space-y-6">
        <PageHeader title="Emails" description="Send and receive emails linked to your cases" />

        <Card className="max-w-lg mx-auto">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="rounded-full bg-muted p-4">
                <Mail className="h-8 w-8 text-muted-foreground" />
              </div>
            </div>
            <CardTitle>Connect Your Email</CardTitle>
            <CardDescription>
              Link your Gmail or Outlook account to send and receive emails directly from Docketra.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-3">
            <Link href="/settings/integrations">
              <Button className="gap-2">
                <Plug className="h-4 w-4" />
                Connect Email Account
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Emails"
        description="Your email inbox linked to cases"
        action={<Button>Compose</Button>}
      />

      {emails.length === 0 ? (
        <EmptyState
          icon={Mail}
          title="No emails yet"
          description="Emails will appear here once your account syncs."
        />
      ) : (
        <div className="space-y-2">
          {emails.map((email) => (
            <Card key={email.id as string} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {(email.direction === "inbound" ? email.from_address : (email.to_addresses as string[])?.[0]) as string}
                    </p>
                    <p className="text-sm truncate">{email.subject as string || "(no subject)"}</p>
                    <p className="text-xs text-muted-foreground truncate mt-0.5">
                      {(email.body_text as string)?.slice(0, 100)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

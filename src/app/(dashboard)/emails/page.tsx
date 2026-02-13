import { Mail, Plug } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { PageHeader } from "@/components/shared/page-header";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { EmailsClient } from "./emails-client";

export default async function EmailsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("gmail_refresh_token, outlook_refresh_token")
    .eq("id", user!.id)
    .single();

  const hasEmailConnected =
    profile?.gmail_refresh_token || profile?.outlook_refresh_token;

  if (!hasEmailConnected) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Emails"
          description="Send and receive emails linked to your cases"
        />

        <Card className="max-w-lg mx-auto">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="rounded-full bg-muted p-4">
                <Mail className="h-8 w-8 text-muted-foreground" />
              </div>
            </div>
            <CardTitle>Connect Your Email</CardTitle>
            <CardDescription>
              Link your Gmail or Outlook account to send and receive emails
              directly from Docketra.
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

  // Fetch emails from DB
  const { data: emails } = await supabase
    .from("emails")
    .select("*")
    .eq("user_id", user!.id)
    .order("received_at", { ascending: false })
    .limit(100);

  // Fetch open cases for linking
  const { data: cases } = await supabase
    .from("cases")
    .select("id, title")
    .eq("user_id", user!.id)
    .eq("status", "open");

  return <EmailsClient emails={emails || []} cases={cases || []} />;
}

import { createClient } from "@/lib/supabase/server";
import { IntegrationsClient } from "./integrations-client";

export default async function IntegrationsPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string; error?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select(
      "google_refresh_token, gmail_refresh_token, outlook_refresh_token, dropbox_refresh_token"
    )
    .eq("id", user!.id)
    .single();

  return (
    <IntegrationsClient
      googleConnected={!!profile?.google_refresh_token}
      outlookConnected={!!profile?.outlook_refresh_token}
      dropboxConnected={!!profile?.dropbox_refresh_token}
      success={params.success}
      error={params.error}
    />
  );
}

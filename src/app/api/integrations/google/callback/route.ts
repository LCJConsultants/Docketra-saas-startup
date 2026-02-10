import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");

  if (!code) {
    return NextResponse.redirect(new URL("/settings/integrations?error=no_code", request.url));
  }

  // TODO: Exchange code for tokens using googleapis
  // const tokens = await exchangeGoogleCode(code);

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    // TODO: Store refresh token
    // await supabase.from("profiles").update({ google_refresh_token: tokens.refresh_token }).eq("id", user.id);
  }

  return NextResponse.redirect(new URL("/settings/integrations?success=google", request.url));
}

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");

  if (!code) {
    return NextResponse.redirect(new URL("/settings/integrations?error=no_code", request.url));
  }

  // TODO: Exchange code for tokens using dropbox SDK

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    // TODO: Store refresh token
  }

  return NextResponse.redirect(new URL("/settings/integrations?success=dropbox", request.url));
}

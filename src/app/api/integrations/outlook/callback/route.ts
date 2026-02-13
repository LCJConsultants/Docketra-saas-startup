import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { handleOutlookCallback } from "@/lib/outlook";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");

  if (error) {
    return NextResponse.redirect(
      new URL(`/settings/integrations?error=${error}`, request.url)
    );
  }

  if (!code) {
    return NextResponse.redirect(
      new URL("/settings/integrations?error=no_code", request.url)
    );
  }

  try {
    const tokens = await handleOutlookCallback(code);

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.redirect(
        new URL("/login?error=not_authenticated", request.url)
      );
    }

    await supabase
      .from("profiles")
      .update({ outlook_refresh_token: tokens.refresh_token })
      .eq("id", user.id);

    return NextResponse.redirect(
      new URL("/settings/integrations?success=outlook", request.url)
    );
  } catch (err) {
    console.error("Outlook callback error:", err);
    return NextResponse.redirect(
      new URL("/settings/integrations?error=outlook_failed", request.url)
    );
  }
}

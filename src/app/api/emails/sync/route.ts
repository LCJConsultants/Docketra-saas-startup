import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { syncEmails } from "@/lib/email";

export async function POST() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("gmail_refresh_token, outlook_refresh_token")
      .eq("id", user.id)
      .single();

    const results = [];

    if (profile?.gmail_refresh_token) {
      try {
        const gmailResult = await syncEmails(
          user.id,
          "gmail",
          profile.gmail_refresh_token
        );
        results.push({ provider: "gmail", ...gmailResult });
      } catch (err) {
        console.error("Gmail sync error:", err);
        results.push({ provider: "gmail", error: "Sync failed" });
      }
    }

    if (profile?.outlook_refresh_token) {
      try {
        const outlookResult = await syncEmails(
          user.id,
          "outlook",
          profile.outlook_refresh_token
        );
        results.push({ provider: "outlook", ...outlookResult });
      } catch (err) {
        console.error("Outlook sync error:", err);
        results.push({ provider: "outlook", error: "Sync failed" });
      }
    }

    return NextResponse.json({ results });
  } catch (err) {
    console.error("Email sync error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

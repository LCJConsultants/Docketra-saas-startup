import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendEmail } from "@/lib/email";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = await request.json();
    const { to, subject, message, caseId, clientId, cc, bcc, replyToEmailId } = body;

    if (!to || !message) {
      return NextResponse.json(
        { error: "Recipient and message are required" },
        { status: 400 }
      );
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("gmail_refresh_token, outlook_refresh_token")
      .eq("id", user.id)
      .single();

    // Determine which provider to use (prefer Gmail, fallback to Outlook)
    let provider: "gmail" | "outlook";
    let refreshToken: string;

    if (profile?.gmail_refresh_token) {
      provider = "gmail";
      refreshToken = profile.gmail_refresh_token;
    } else if (profile?.outlook_refresh_token) {
      provider = "outlook";
      refreshToken = profile.outlook_refresh_token;
    } else {
      return NextResponse.json(
        { error: "No email provider connected" },
        { status: 400 }
      );
    }

    // Look up original email for threading if this is a reply
    let threadId: string | undefined;
    let inReplyTo: string | undefined;
    let references: string | undefined;
    let replyToProviderEmailId: string | undefined;

    if (replyToEmailId) {
      const { data: originalEmail } = await supabase
        .from("emails")
        .select("message_id, thread_id, provider_email_id")
        .eq("id", replyToEmailId)
        .eq("user_id", user.id)
        .single();

      if (originalEmail) {
        threadId = originalEmail.thread_id || undefined;
        inReplyTo = originalEmail.message_id || undefined;
        references = originalEmail.message_id || undefined;
        replyToProviderEmailId = originalEmail.provider_email_id || undefined;
      }
    }

    const result = await sendEmail({
      userId: user.id,
      provider,
      refreshToken,
      to,
      subject: subject || "",
      body: message,
      cc,
      bcc,
      caseId,
      clientId,
      threadId,
      inReplyTo,
      references,
      replyToProviderEmailId,
    });

    return NextResponse.json(result);
  } catch (err) {
    console.error("Send email error:", err);
    return NextResponse.json(
      { error: "Failed to send email" },
      { status: 500 }
    );
  }
}

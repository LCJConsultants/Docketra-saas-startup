import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    // Fetch all user data in parallel
    const [
      { data: profile },
      { data: clients },
      { data: cases },
      { data: documents },
      { data: calendarEvents },
      { data: timeEntries },
      { data: invoices },
      { data: templates },
      { data: emails },
      { data: conversations },
    ] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", user.id).single(),
      supabase.from("clients").select("*").eq("user_id", user.id),
      supabase.from("cases").select("*").eq("user_id", user.id),
      supabase.from("documents").select("*").eq("user_id", user.id),
      supabase.from("calendar_events").select("*").eq("user_id", user.id),
      supabase.from("time_entries").select("*").eq("user_id", user.id),
      supabase.from("invoices").select("*, line_items:invoice_line_items(*)").eq("user_id", user.id),
      supabase.from("document_templates").select("*").eq("user_id", user.id),
      supabase.from("emails").select("*").eq("user_id", user.id),
      supabase.from("ai_conversations").select("*").eq("user_id", user.id),
    ]);

    const exportData = {
      exported_at: new Date().toISOString(),
      user_id: user.id,
      email: user.email,
      profile,
      clients: clients || [],
      cases: cases || [],
      documents: documents || [],
      calendar_events: calendarEvents || [],
      time_entries: timeEntries || [],
      invoices: invoices || [],
      templates: templates || [],
      emails: emails || [],
      ai_conversations: conversations || [],
    };

    return new NextResponse(JSON.stringify(exportData, null, 2), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="docketra-export-${new Date().toISOString().split("T")[0]}.json"`,
      },
    });
  } catch (err) {
    console.error("Data export error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

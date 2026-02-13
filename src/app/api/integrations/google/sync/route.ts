import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { ensureDriveFolderStructure, listDriveFiles } from "@/lib/google";

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
      .select("google_refresh_token")
      .eq("id", user.id)
      .single();

    if (!profile?.google_refresh_token) {
      return NextResponse.json(
        { error: "Google not connected" },
        { status: 400 }
      );
    }

    const { data: cases } = await supabase
      .from("cases")
      .select(
        "id, title, client_id, drive_folder_id, client:clients(first_name, last_name)"
      )
      .eq("user_id", user.id);

    let totalSynced = 0;

    for (const caseItem of cases || []) {
      const client = caseItem.client as unknown as {
        first_name: string;
        last_name: string;
      } | null;
      if (!client) continue;

      const clientName = `${client.first_name} ${client.last_name}`;
      let caseFolderId = caseItem.drive_folder_id;

      // Ensure folder structure exists
      if (!caseFolderId) {
        try {
          const result = await ensureDriveFolderStructure(
            profile.google_refresh_token,
            clientName,
            caseItem.title
          );
          caseFolderId = result.caseFolderId;

          await supabase
            .from("cases")
            .update({ drive_folder_id: caseFolderId })
            .eq("id", caseItem.id);
          await supabase
            .from("clients")
            .update({ drive_folder_id: result.clientFolderId })
            .eq("id", caseItem.client_id);
        } catch (err) {
          console.error(
            `Drive folder setup failed for case ${caseItem.id}:`,
            err
          );
          continue;
        }
      }

      // Sync files from Drive folder
      try {
        const files = await listDriveFiles(
          profile.google_refresh_token,
          caseFolderId
        );
        for (const file of files) {
          const { data: existing } = await supabase
            .from("documents")
            .select("id")
            .eq("user_id", user.id)
            .eq("drive_file_id", file.id!)
            .maybeSingle();

          if (!existing) {
            await supabase.from("documents").insert({
              user_id: user.id,
              case_id: caseItem.id,
              client_id: caseItem.client_id,
              title: file.name || "Untitled",
              file_name: file.name || "unknown",
              file_type: file.mimeType || null,
              file_size: file.size ? parseInt(file.size) : null,
              drive_file_id: file.id,
              source: "cloud_sync",
              category: "other",
            });
            totalSynced++;
          }
        }
      } catch (err) {
        console.error(`Drive sync failed for case ${caseItem.id}:`, err);
      }
    }

    return NextResponse.json({ synced: totalSynced });
  } catch (err) {
    console.error("Drive sync error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

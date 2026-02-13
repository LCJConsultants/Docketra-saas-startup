import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    // Authenticate user
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

    // Parse multipart form data
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const title = formData.get("title") as string | null;
    const category = formData.get("category") as string | null;
    const caseId = formData.get("case_id") as string | null;
    const clientId = formData.get("client_id") as string | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!title) {
      return NextResponse.json(
        { error: "Title is required" },
        { status: 400 }
      );
    }

    // Build a unique storage path: user_id/timestamp-filename
    const timestamp = Date.now();
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const storagePath = `${user.id}/${timestamp}-${sanitizedName}`;

    // Upload file to Supabase Storage bucket "documents"
    const { error: uploadError } = await supabase.storage
      .from("documents")
      .upload(storagePath, file, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error("Storage upload error:", uploadError);
      return NextResponse.json(
        { error: "Failed to upload file to storage" },
        { status: 500 }
      );
    }

    // Create document record in the database
    const { data: document, error: dbError } = await supabase
      .from("documents")
      .insert({
        user_id: user.id,
        title,
        file_name: file.name,
        file_type: file.type || null,
        file_size: file.size || null,
        storage_path: storagePath,
        case_id: caseId || null,
        client_id: clientId || null,
        category: category || "other",
        is_template: false,
        source: "upload",
      })
      .select()
      .single();

    if (dbError) {
      // Clean up uploaded file if DB insert fails
      await supabase.storage.from("documents").remove([storagePath]);
      console.error("Database insert error:", dbError);
      return NextResponse.json(
        { error: "Failed to create document record" },
        { status: 500 }
      );
    }

    // Optionally upload to Google Drive if connected and case has a Drive folder
    if (caseId && document) {
      try {
        const { data: userProfile } = await supabase
          .from("profiles")
          .select("google_refresh_token")
          .eq("id", user.id)
          .single();

        if (userProfile?.google_refresh_token) {
          const { data: caseData } = await supabase
            .from("cases")
            .select("drive_folder_id")
            .eq("id", caseId)
            .single();

          if (caseData?.drive_folder_id) {
            const { uploadToDrive } = await import("@/lib/google");
            const arrayBuffer = await file.arrayBuffer();
            const driveFileId = await uploadToDrive(
              userProfile.google_refresh_token,
              file.name,
              Buffer.from(arrayBuffer),
              file.type,
              caseData.drive_folder_id
            );
            await supabase
              .from("documents")
              .update({ drive_file_id: driveFileId })
              .eq("id", document.id);
          }
        }
      } catch (driveErr) {
        console.error("Drive upload failed (non-critical):", driveErr);
      }
    }

    return NextResponse.json(document, { status: 201 });
  } catch (err) {
    console.error("Upload route error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

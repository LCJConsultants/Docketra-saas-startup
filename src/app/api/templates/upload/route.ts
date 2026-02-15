import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { extractTextFromFile } from "@/lib/extract-text";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

const ALLOWED_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/msword",
  "text/plain",
];

export async function POST(request: Request) {
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

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const title = formData.get("title") as string | null;
    const category = formData.get("category") as string | null;
    const practiceArea = formData.get("practice_area") as string | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!title?.trim()) {
      return NextResponse.json(
        { error: "Title is required" },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File size exceeds 10MB limit" },
        { status: 400 }
      );
    }

    if (!ALLOWED_TYPES.includes(file.type) && !file.name.match(/\.(pdf|docx?|txt)$/i)) {
      return NextResponse.json(
        { error: "Unsupported file type. Please upload PDF, DOCX, DOC, or TXT files." },
        { status: 400 }
      );
    }

    // Upload file to Supabase Storage
    const timestamp = Date.now();
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const storagePath = `${user.id}/templates/${timestamp}-${sanitizedName}`;

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

    // Extract text content from the file
    let extractedText: string;
    try {
      const arrayBuffer = await file.arrayBuffer();
      extractedText = await extractTextFromFile(
        Buffer.from(arrayBuffer),
        file.type,
        file.name
      );
    } catch (extractError) {
      // Clean up uploaded file if extraction fails
      await supabase.storage.from("documents").remove([storagePath]);
      console.error("Text extraction error:", extractError);
      return NextResponse.json(
        {
          error: extractError instanceof Error
            ? extractError.message
            : "Failed to extract text from file",
        },
        { status: 400 }
      );
    }

    if (!extractedText.trim()) {
      await supabase.storage.from("documents").remove([storagePath]);
      return NextResponse.json(
        { error: "Could not extract any text from the file. The file may be empty or contain only images." },
        { status: 400 }
      );
    }

    // Insert template record
    const { data: template, error: dbError } = await supabase
      .from("document_templates")
      .insert({
        user_id: user.id,
        title: title.trim(),
        category: category || "other",
        practice_area: practiceArea || null,
        content: extractedText,
        file_path: storagePath,
        is_system: false,
      })
      .select()
      .single();

    if (dbError) {
      // Clean up uploaded file if DB insert fails
      await supabase.storage.from("documents").remove([storagePath]);
      console.error("Database insert error:", dbError);
      return NextResponse.json(
        { error: "Failed to create template record" },
        { status: 500 }
      );
    }

    return NextResponse.json(template, { status: 201 });
  } catch (err) {
    console.error("Template upload error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

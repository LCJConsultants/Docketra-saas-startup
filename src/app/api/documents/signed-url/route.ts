import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { storagePath } = await req.json();

    if (!storagePath || typeof storagePath !== "string") {
      return NextResponse.json({ error: "Storage path required" }, { status: 400 });
    }

    // Verify the document belongs to this user
    const { data: doc, error: docError } = await supabase
      .from("documents")
      .select("id")
      .eq("storage_path", storagePath)
      .eq("user_id", user.id)
      .single();

    if (docError || !doc) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    // Generate a signed URL that expires in 1 hour
    const { data, error } = await supabase.storage
      .from("documents")
      .createSignedUrl(storagePath, 3600);

    if (error || !data?.signedUrl) {
      return NextResponse.json({ error: "Failed to generate download URL" }, { status: 500 });
    }

    return NextResponse.json({ url: data.signedUrl });
  } catch (err) {
    console.error("Signed URL error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

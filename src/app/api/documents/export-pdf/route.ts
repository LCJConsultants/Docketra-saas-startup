import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import jsPDF from "jspdf";

function parseContentToPdf(pdf: jsPDF, content: string) {
  const pageWidth = pdf.internal.pageSize.getWidth();
  const margin = 25.4; // 1 inch margins
  const usableWidth = pageWidth - margin * 2;
  let y = margin;
  const lineHeight = 6;
  const pageHeight = pdf.internal.pageSize.getHeight();
  const bottomMargin = pageHeight - margin;

  function checkPageBreak(needed: number) {
    if (y + needed > bottomMargin) {
      pdf.addPage();
      y = margin;
    }
  }

  const lines = content.split("\n");

  for (const line of lines) {
    const trimmed = line.trim();

    // Empty line
    if (!trimmed) {
      y += lineHeight * 0.8;
      continue;
    }

    // Strip markdown bold/italic for PDF text
    function stripMarkdown(text: string): string {
      return text
        .replace(/\*\*\*(.+?)\*\*\*/g, "$1")
        .replace(/\*\*(.+?)\*\*/g, "$1")
        .replace(/\*(.+?)\*/g, "$1")
        .replace(/__(.+?)__/g, "$1")
        .replace(/_(.+?)_/g, "$1");
    }

    // Heading 1
    if (trimmed.startsWith("# ")) {
      const text = stripMarkdown(trimmed.replace(/^#\s*/, ""));
      checkPageBreak(14);
      y += 4;
      pdf.setFontSize(18);
      pdf.setFont("helvetica", "bold");
      const splitLines = pdf.splitTextToSize(text, usableWidth);
      const textWidth = pdf.getTextWidth(splitLines[0]);
      const centerX = (pageWidth - textWidth) / 2;
      for (const sl of splitLines) {
        checkPageBreak(9);
        const slWidth = pdf.getTextWidth(sl);
        pdf.text(sl, (pageWidth - slWidth) / 2, y);
        y += 9;
      }
      y += 3;
      continue;
    }

    // Heading 2
    if (trimmed.startsWith("## ")) {
      const text = stripMarkdown(trimmed.replace(/^##\s*/, ""));
      checkPageBreak(12);
      y += 3;
      pdf.setFontSize(15);
      pdf.setFont("helvetica", "bold");
      const splitLines = pdf.splitTextToSize(text, usableWidth);
      for (const sl of splitLines) {
        checkPageBreak(8);
        pdf.text(sl, margin, y);
        y += 8;
      }
      y += 2;
      continue;
    }

    // Heading 3
    if (trimmed.startsWith("### ")) {
      const text = stripMarkdown(trimmed.replace(/^###\s*/, ""));
      checkPageBreak(10);
      y += 2;
      pdf.setFontSize(13);
      pdf.setFont("helvetica", "bold");
      const splitLines = pdf.splitTextToSize(text, usableWidth);
      for (const sl of splitLines) {
        checkPageBreak(7);
        pdf.text(sl, margin, y);
        y += 7;
      }
      y += 2;
      continue;
    }

    // Horizontal rule
    if (trimmed.startsWith("---") || trimmed.startsWith("***")) {
      checkPageBreak(8);
      y += 3;
      pdf.setDrawColor(200, 200, 200);
      pdf.line(margin, y, pageWidth - margin, y);
      y += 5;
      continue;
    }

    // Regular paragraph
    const text = stripMarkdown(trimmed);
    pdf.setFontSize(12);
    pdf.setFont("helvetica", "normal");

    // Check if this looks like a bold line (was wrapped in **)
    if (trimmed.startsWith("**") && trimmed.endsWith("**")) {
      pdf.setFont("helvetica", "bold");
    }

    const splitLines = pdf.splitTextToSize(text, usableWidth);
    for (const sl of splitLines) {
      checkPageBreak(lineHeight);
      pdf.text(sl, margin, y);
      y += lineHeight;
    }
    y += 1;
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { documentId } = await req.json();

    if (!documentId) {
      return NextResponse.json({ error: "Document ID required" }, { status: 400 });
    }

    const { data: doc, error } = await supabase
      .from("documents")
      .select("*")
      .eq("id", documentId)
      .eq("user_id", user.id)
      .single();

    if (error || !doc) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    const content = doc.ocr_text || "";

    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "letter",
    });

    parseContentToPdf(pdf, content);

    const pdfBuffer = Buffer.from(pdf.output("arraybuffer"));
    const fileName = doc.title.replace(/[^a-zA-Z0-9\s]/g, "").replace(/\s+/g, "_") + ".pdf";

    return new Response(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${fileName}"`,
      },
    });
  } catch (err) {
    console.error("PDF export route error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

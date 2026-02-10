import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { openai } from "@/lib/openai";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { templateId, caseId, instructions } = await req.json();

    // Build context from case details if provided
    let caseContext = "";
    if (caseId) {
      const { data: caseData } = await supabase
        .from("cases")
        .select("*, client:clients(first_name, last_name, email, phone, address)")
        .eq("id", caseId)
        .eq("user_id", user.id)
        .single();

      if (caseData) {
        caseContext = `\n\nCase Details:
- Case Title: ${caseData.title}
- Case Number: ${caseData.case_number || "N/A"}
- Case Type: ${caseData.case_type}
- Status: ${caseData.status}
- Client: ${caseData.client?.first_name} ${caseData.client?.last_name}
- Client Email: ${caseData.client?.email || "N/A"}
- Client Phone: ${caseData.client?.phone || "N/A"}
- Client Address: ${caseData.client?.address || "N/A"}
- Court: ${caseData.court_name || "N/A"}
- Judge: ${caseData.judge_name || "N/A"}
- Opposing Party: ${caseData.opposing_party || "N/A"}
- Opposing Counsel: ${caseData.opposing_counsel || "N/A"}
- Description: ${caseData.description || "N/A"}`;
      }
    }

    // Get template content if provided
    let templateContext = "";
    if (templateId) {
      const { data: template } = await supabase
        .from("document_templates")
        .select("*")
        .eq("id", templateId)
        .or(`user_id.eq.${user.id},is_system.eq.true`)
        .single();

      if (template) {
        templateContext = `\n\nTemplate to follow:
Title: ${template.title}
Category: ${template.category}
Content/Structure:
${template.content}`;
      }
    }

    const systemPrompt = `You are Docketra AI, a legal document drafting assistant. Generate a professional legal document based on the provided instructions and context.

Guidelines:
- Use proper legal formatting, language, and structure
- Include all standard sections appropriate for the document type
- Use placeholder brackets [PLACEHOLDER] for any information you do not have
- Be thorough and professional
- The document should be ready for attorney review before filing or sending${caseContext}${templateContext}`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: `Please draft the following document:\n\n${instructions}`,
        },
      ],
    });

    const content = response.choices[0]?.message?.content || "";

    // Extract a title from the first line or generate one
    const firstLine = content.split("\n").find((line) => line.trim().length > 0) || "";
    const title = firstLine.replace(/^#+\s*/, "").replace(/^\*+/, "").replace(/\*+$/, "").trim().slice(0, 100) || "Untitled Document";

    return NextResponse.json({ content, title });
  } catch (error) {
    console.error("AI Draft error:", error);
    return NextResponse.json(
      { error: "Failed to draft document" },
      { status: 500 }
    );
  }
}

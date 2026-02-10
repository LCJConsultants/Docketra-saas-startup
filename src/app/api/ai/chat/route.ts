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

    const { messages, caseId } = await req.json();

    // Build context about the case if provided
    let caseContext = "";
    if (caseId) {
      const { data: caseData } = await supabase
        .from("cases")
        .select("*, client:clients(first_name, last_name)")
        .eq("id", caseId)
        .eq("user_id", user.id)
        .single();

      if (caseData) {
        caseContext = `\n\nCurrent case context:
- Case: ${caseData.title}
- Case Number: ${caseData.case_number || "N/A"}
- Type: ${caseData.case_type}
- Status: ${caseData.status}
- Client: ${caseData.client?.first_name} ${caseData.client?.last_name}
- Court: ${caseData.court_name || "N/A"}
- Judge: ${caseData.judge_name || "N/A"}
- Opposing Party: ${caseData.opposing_party || "N/A"}
- Opposing Counsel: ${caseData.opposing_counsel || "N/A"}
- Description: ${caseData.description || "N/A"}`;
      }
    }

    const systemPrompt = `You are Docketra AI, an intelligent legal assistant built into the Docketra legal practice management platform. You help solo attorneys and small law firms with:

- Drafting legal documents (motions, pleadings, letters, contracts)
- Summarizing case details and documents
- Legal research and analysis
- Understanding court procedures and deadlines
- General legal practice management advice

Always be professional, accurate, and thorough. When drafting documents, use proper legal formatting and language. If you are unsure about jurisdiction-specific rules, mention that the attorney should verify local rules.

You are NOT a substitute for legal judgment. Always remind users that AI-generated content should be reviewed before filing or sending.${caseContext}`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        ...messages.map((m: { role: string; content: string }) => ({
          role: m.role as "user" | "assistant" | "system",
          content: m.content,
        })),
      ],
      stream: true,
    });

    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        try {
          for await (const chunk of response) {
            const content = chunk.choices[0]?.delta?.content;
            if (content) {
              controller.enqueue(encoder.encode(content));
            }
          }
        } catch (err) {
          controller.error(err);
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
      },
    });
  } catch (error) {
    console.error("AI Chat error:", error);
    return NextResponse.json(
      { error: "Failed to process chat request" },
      { status: 500 }
    );
  }
}

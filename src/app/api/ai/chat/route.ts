import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { openai } from "@/lib/openai";
import type { ChatCompletionTool, ChatCompletionMessageParam } from "openai/resources/chat/completions";

interface UploadedFileInfo {
  storagePath: string;
  fileName: string;
  fileType: string;
  fileSize: number;
}

const tools: ChatCompletionTool[] = [
  {
    type: "function",
    function: {
      name: "create_calendar_event",
      description: "Create a new calendar event such as a meeting, court date, deadline, or reminder in Docketra",
      parameters: {
        type: "object",
        properties: {
          title: { type: "string", description: "Event title" },
          event_type: { type: "string", enum: ["court_date", "deadline", "filing", "meeting", "reminder", "sol"], description: "Type of event" },
          start_time: { type: "string", description: "Start time in ISO 8601 format (e.g. 2026-02-11T10:30:00)" },
          end_time: { type: "string", description: "End time in ISO 8601 format (optional)" },
          location: { type: "string", description: "Event location (optional)" },
          description: { type: "string", description: "Event description (optional)" },
          case_id: { type: "string", description: "UUID of the case to link this event to (optional)" },
        },
        required: ["title", "event_type", "start_time"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "search_cases",
      description: "Search for cases in Docketra by status or type",
      parameters: {
        type: "object",
        properties: {
          status: { type: "string", enum: ["open", "pending", "closed", "archived"], description: "Filter by case status" },
          case_type: { type: "string", enum: ["criminal", "civil", "divorce", "custody", "mediation", "other"], description: "Filter by case type" },
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_case_details",
      description: "Get full details of a specific case including client info",
      parameters: {
        type: "object",
        properties: {
          case_id: { type: "string", description: "UUID of the case" },
          title: { type: "string", description: "Case title to search for (if case_id is not known)" },
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "search_clients",
      description: "Search for clients in Docketra",
      parameters: {
        type: "object",
        properties: {
          name: { type: "string", description: "Client name to search for" },
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "create_time_entry",
      description: "Log a time entry for billable hours on a case",
      parameters: {
        type: "object",
        properties: {
          case_id: { type: "string", description: "UUID of the case" },
          description: { type: "string", description: "Description of work performed" },
          duration_minutes: { type: "number", description: "Duration in minutes" },
          hourly_rate: { type: "number", description: "Hourly rate in dollars (optional)" },
          date: { type: "string", description: "Date of the work (YYYY-MM-DD format, defaults to today)" },
          is_billable: { type: "boolean", description: "Whether this time is billable (defaults to true)" },
        },
        required: ["case_id", "description", "duration_minutes"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_upcoming_events",
      description: "Get upcoming calendar events and deadlines",
      parameters: {
        type: "object",
        properties: {
          limit: { type: "number", description: "Number of events to return (default 10)" },
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "list_templates",
      description: "List available document templates that can be used for drafting. Call this when the user wants to use a template or asks what templates are available.",
      parameters: {
        type: "object",
        properties: {
          category: { type: "string", enum: ["motion", "pleading", "letter", "contract", "agreement", "other"], description: "Filter templates by category (optional)" },
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "draft_from_template",
      description: "Draft a legal document using a saved template as the base structure. The template content will guide the formatting and structure. Use this when the user wants to draft from a specific template.",
      parameters: {
        type: "object",
        properties: {
          template_id: { type: "string", description: "UUID of the template to use" },
          case_id: { type: "string", description: "UUID of the case this document is for (optional)" },
          instructions: { type: "string", description: "Additional instructions or details for filling in the template" },
        },
        required: ["template_id"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "draft_document",
      description: "Draft a legal document from scratch (without a template) such as a motion, pleading, letter, contract, or agreement. The drafted document will be saved to the case's documents. Use this when the user asks you to draft, write, or create any legal document and no template is being used.",
      parameters: {
        type: "object",
        properties: {
          document_type: { type: "string", enum: ["motion", "pleading", "letter", "contract", "agreement", "other"], description: "Type of document to draft" },
          title: { type: "string", description: "Title of the document (e.g. 'Motion to Dismiss', 'Demand Letter')" },
          instructions: { type: "string", description: "Detailed instructions for what the document should contain, its purpose, key arguments, and any specific details" },
          case_id: { type: "string", description: "UUID of the case this document is for (optional)" },
        },
        required: ["document_type", "title", "instructions"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "file_document",
      description: "File an already-uploaded document to a case by creating the database record. Use this when the user has attached a file and wants it filed to a specific case. The file has already been uploaded to storage — do NOT re-upload it.",
      parameters: {
        type: "object",
        properties: {
          storage_path: { type: "string", description: "The storage path of the uploaded file" },
          file_name: { type: "string", description: "Original file name" },
          file_type: { type: "string", description: "MIME type of the file" },
          file_size: { type: "number", description: "File size in bytes" },
          case_id: { type: "string", description: "UUID of the case to file the document to (optional)" },
          client_id: { type: "string", description: "UUID of the client to associate (optional)" },
          title: { type: "string", description: "Document title (defaults to file name without extension)" },
          category: { type: "string", enum: ["motion", "pleading", "letter", "contract", "agreement", "evidence", "correspondence", "other"], description: "Document category (defaults to 'other')" },
        },
        required: ["storage_path", "file_name", "file_type", "file_size"],
      },
    },
  },
];

async function executeTool(
  toolName: string,
  args: Record<string, unknown>,
  userId: string,
  supabase: Awaited<ReturnType<typeof createClient>>,
  uploadedFileInfo?: UploadedFileInfo
): Promise<string> {
  switch (toolName) {
    case "create_calendar_event": {
      const { data, error } = await supabase
        .from("calendar_events")
        .insert({
          user_id: userId,
          title: args.title as string,
          event_type: args.event_type as string,
          start_time: args.start_time as string,
          end_time: (args.end_time as string) || null,
          location: (args.location as string) || null,
          description: (args.description as string) || null,
          case_id: (args.case_id as string) || null,
        })
        .select()
        .single();

      if (error) return `Error creating event: ${error.message}`;
      return `Successfully created event "${data.title}" on ${new Date(data.start_time).toLocaleString()}.`;
    }

    case "search_cases": {
      let query = supabase
        .from("cases")
        .select("id, title, case_number, case_type, status, client:clients(first_name, last_name)")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(10);

      if (args.status) query = query.eq("status", args.status as string);
      if (args.case_type) query = query.eq("case_type", args.case_type as string);

      const { data, error } = await query;
      if (error) return `Error searching cases: ${error.message}`;
      if (!data || data.length === 0) return "No cases found matching the criteria.";

      return data.map((c) => {
        const client = c.client as unknown as { first_name: string; last_name: string } | null;
        return `- ${c.title} (${c.case_type}, ${c.status})${c.case_number ? ` #${c.case_number}` : ""}${client ? ` — Client: ${client.first_name} ${client.last_name}` : ""} [ID: ${c.id}]`;
      }).join("\n");
    }

    case "get_case_details": {
      let query = supabase
        .from("cases")
        .select("*, client:clients(id, first_name, last_name, email, phone)")
        .eq("user_id", userId);

      if (args.case_id) {
        query = query.eq("id", args.case_id as string);
      } else if (args.title) {
        query = query.ilike("title", `%${args.title}%`);
      }

      const { data, error } = await query.limit(1).single();
      if (error) return `Case not found: ${error.message}`;

      const client = data.client as { id: string; first_name: string; last_name: string; email: string; phone: string } | null;
      return `Case: ${data.title}
Case Number: ${data.case_number || "N/A"}
Type: ${data.case_type}
Status: ${data.status}
Client: ${client ? `${client.first_name} ${client.last_name} (${client.email || "no email"}, ${client.phone || "no phone"})` : "N/A"}
Court: ${data.court_name || "N/A"}
Judge: ${data.judge_name || "N/A"}
Opposing Party: ${data.opposing_party || "N/A"}
Opposing Counsel: ${data.opposing_counsel || "N/A"}
Date Opened: ${data.date_opened || "N/A"}
Description: ${data.description || "N/A"}
Tags: ${data.tags?.join(", ") || "None"}
ID: ${data.id}`;
    }

    case "search_clients": {
      let query = supabase
        .from("clients")
        .select("id, first_name, last_name, email, phone, status")
        .eq("user_id", userId)
        .limit(10);

      if (args.name) {
        const name = args.name as string;
        query = query.or(`first_name.ilike.%${name}%,last_name.ilike.%${name}%`);
      }

      const { data, error } = await query;
      if (error) return `Error searching clients: ${error.message}`;
      if (!data || data.length === 0) return "No clients found.";

      return data.map((c) =>
        `- ${c.first_name} ${c.last_name} (${c.email || "no email"}, ${c.phone || "no phone"}) [ID: ${c.id}]`
      ).join("\n");
    }

    case "create_time_entry": {
      const { data, error } = await supabase
        .from("time_entries")
        .insert({
          user_id: userId,
          case_id: args.case_id as string,
          description: args.description as string,
          duration_minutes: args.duration_minutes as number,
          hourly_rate: (args.hourly_rate as number) || null,
          date: (args.date as string) || new Date().toISOString().split("T")[0],
          is_billable: args.is_billable !== false,
        })
        .select()
        .single();

      if (error) return `Error creating time entry: ${error.message}`;
      return `Successfully logged ${data.duration_minutes} minutes for "${data.description}".`;
    }

    case "get_upcoming_events": {
      const limit = (args.limit as number) || 10;
      const { data, error } = await supabase
        .from("calendar_events")
        .select("id, title, event_type, start_time, end_time, location, case:cases(title)")
        .eq("user_id", userId)
        .gte("start_time", new Date().toISOString())
        .order("start_time", { ascending: true })
        .limit(limit);

      if (error) return `Error fetching events: ${error.message}`;
      if (!data || data.length === 0) return "No upcoming events found.";

      return data.map((e) => {
        const caseInfo = e.case as unknown as { title: string } | null;
        return `- ${e.title} (${e.event_type.replace("_", " ")}) — ${new Date(e.start_time).toLocaleString()}${e.location ? ` at ${e.location}` : ""}${caseInfo ? ` [Case: ${caseInfo.title}]` : ""}`;
      }).join("\n");
    }

    case "list_templates": {
      let query = supabase
        .from("document_templates")
        .select("id, title, category, practice_area, is_system")
        .or(`user_id.eq.${userId},is_system.eq.true`)
        .order("category")
        .limit(20);

      if (args.category) query = query.eq("category", args.category as string);

      const { data, error } = await query;
      if (error) return `Error fetching templates: ${error.message}`;
      if (!data || data.length === 0) return "No templates found. The user can create templates in the Templates section.";

      return "Available templates:\n" + data.map((t) =>
        `- ${t.title} (${t.category}${t.practice_area ? `, ${t.practice_area}` : ""})${t.is_system ? " [System]" : ""} [ID: ${t.id}]`
      ).join("\n");
    }

    case "draft_from_template": {
      // Get the template
      const { data: template, error: tplError } = await supabase
        .from("document_templates")
        .select("*")
        .eq("id", args.template_id as string)
        .or(`user_id.eq.${userId},is_system.eq.true`)
        .single();

      if (tplError || !template) return `Template not found: ${tplError?.message || "Unknown error"}`;

      // Get case context if provided
      let caseContext = "";
      if (args.case_id) {
        const { data: caseData } = await supabase
          .from("cases")
          .select("*, client:clients(first_name, last_name, email, phone, address)")
          .eq("id", args.case_id as string)
          .eq("user_id", userId)
          .single();

        if (caseData) {
          const client = caseData.client as { first_name: string; last_name: string; email: string; phone: string; address: string } | null;
          caseContext = `\n\nCase Details:
- Case Title: ${caseData.title}
- Case Number: ${caseData.case_number || "N/A"}
- Case Type: ${caseData.case_type}
- Court: ${caseData.court_name || "N/A"}
- Judge: ${caseData.judge_name || "N/A"}
- Opposing Party: ${caseData.opposing_party || "N/A"}
- Opposing Counsel: ${caseData.opposing_counsel || "N/A"}
- Client: ${client ? `${client.first_name} ${client.last_name}` : "N/A"}
- Client Address: ${client?.address || "N/A"}
- Description: ${caseData.description || "N/A"}`;
        }
      }

      const draftResponse = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `You are a legal document drafting expert. Generate a professional, properly formatted legal document based on the provided template and case context. Follow the template structure closely, filling in all {{placeholders}} with actual data from the case context. Use [PLACEHOLDER] for any information not available.${caseContext}`,
          },
          {
            role: "user",
            content: `Use this template to draft a document:\n\nTemplate: ${template.title}\nCategory: ${template.category}\n\nTemplate Content:\n${template.content}\n\n${args.instructions ? `Additional instructions: ${args.instructions}` : "Fill in all placeholders with the case details provided."}`,
          },
        ],
      });

      const draftContent = draftResponse.choices[0]?.message?.content || "";

      // Save as a document
      const { data: doc, error: docError } = await supabase
        .from("documents")
        .insert({
          user_id: userId,
          case_id: (args.case_id as string) || null,
          title: `${template.title} (from template)`,
          file_name: `${template.title.replace(/[^a-zA-Z0-9]/g, "_")}.md`,
          file_type: "md",
          category: template.category,
          ocr_text: draftContent,
          source: "ai_draft",
        })
        .select()
        .single();

      if (docError) return `Document drafted but failed to save: ${docError.message}`;

      return `Successfully drafted "${template.title}" from template and saved it to your Documents. You can review and edit it in the Documents section.`;
    }

    case "draft_document": {
      // Get case context if provided
      let caseContext = "";
      if (args.case_id) {
        const { data: caseData } = await supabase
          .from("cases")
          .select("*, client:clients(first_name, last_name, email, phone, address)")
          .eq("id", args.case_id as string)
          .eq("user_id", userId)
          .single();

        if (caseData) {
          const client = caseData.client as { first_name: string; last_name: string; email: string; phone: string; address: string } | null;
          caseContext = `\n\nCase Details:
- Case Title: ${caseData.title}
- Case Number: ${caseData.case_number || "N/A"}
- Case Type: ${caseData.case_type}
- Court: ${caseData.court_name || "N/A"}
- Judge: ${caseData.judge_name || "N/A"}
- Opposing Party: ${caseData.opposing_party || "N/A"}
- Opposing Counsel: ${caseData.opposing_counsel || "N/A"}
- Client: ${client ? `${client.first_name} ${client.last_name}` : "N/A"}
- Client Address: ${client?.address || "N/A"}
- Description: ${caseData.description || "N/A"}`;
        }
      }

      const draftResponse = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `You are a legal document drafting expert. Generate a professional, properly formatted legal document based on the instructions. Use proper legal formatting, language, and structure. Include all standard sections appropriate for the document type. Use [PLACEHOLDER] brackets for any information you don't have. The document should be ready for attorney review.${caseContext}`,
          },
          {
            role: "user",
            content: `Draft a ${args.document_type}: "${args.title}"\n\nInstructions: ${args.instructions}`,
          },
        ],
      });

      const draftContent = draftResponse.choices[0]?.message?.content || "";

      // Save as a document in Supabase
      const { data: doc, error: docError } = await supabase
        .from("documents")
        .insert({
          user_id: userId,
          case_id: (args.case_id as string) || null,
          title: args.title as string,
          file_name: `${(args.title as string).replace(/[^a-zA-Z0-9]/g, "_")}.md`,
          file_type: "md",
          category: args.document_type as string,
          ocr_text: draftContent,
          source: "ai_draft",
        })
        .select()
        .single();

      if (docError) return `Document drafted but failed to save: ${docError.message}`;

      return `Successfully drafted "${args.title}" and saved it to your Documents. You can review and edit it in the Documents section.`;
    }

    case "file_document": {
      if (!uploadedFileInfo) {
        return "Error: No file was uploaded with this request. The user must attach a file to use this tool.";
      }

      // Safety guard: override storage_path to prevent hallucination
      const storagePath = uploadedFileInfo.storagePath;
      const fileName = uploadedFileInfo.fileName;
      const fileType = uploadedFileInfo.fileType;
      const fileSize = uploadedFileInfo.fileSize;

      const title = (args.title as string) || fileName.replace(/\.[^/.]+$/, "");
      const category = (args.category as string) || "other";

      const { data: document, error: dbError } = await supabase
        .from("documents")
        .insert({
          user_id: userId,
          title,
          file_name: fileName,
          file_type: fileType || null,
          file_size: fileSize || null,
          storage_path: storagePath,
          case_id: (args.case_id as string) || null,
          client_id: (args.client_id as string) || null,
          category,
          is_template: false,
          source: "ai_upload",
        })
        .select()
        .single();

      if (dbError) return `Error filing document: ${dbError.message}`;

      // Google Drive sync if case is provided
      if (args.case_id && document) {
        try {
          const { data: userProfile } = await supabase
            .from("profiles")
            .select("google_refresh_token")
            .eq("id", userId)
            .single();

          if (userProfile?.google_refresh_token) {
            const { data: caseData } = await supabase
              .from("cases")
              .select("drive_folder_id")
              .eq("id", args.case_id as string)
              .single();

            if (caseData?.drive_folder_id) {
              // Download from storage to re-upload to Drive
              const { data: fileData } = await supabase.storage
                .from("documents")
                .download(storagePath);

              if (fileData) {
                const { uploadToDrive } = await import("@/lib/google");
                const arrayBuffer = await fileData.arrayBuffer();
                const driveFileId = await uploadToDrive(
                  userProfile.google_refresh_token,
                  fileName,
                  Buffer.from(arrayBuffer),
                  fileType,
                  caseData.drive_folder_id
                );
                await supabase
                  .from("documents")
                  .update({ drive_file_id: driveFileId })
                  .eq("id", document.id);
              }
            }
          }
        } catch (driveErr) {
          console.error("Drive upload failed (non-critical):", driveErr);
        }
      }

      const caseLabel = args.case_id ? ` to the specified case` : "";
      return `Successfully filed "${title}" (${category})${caseLabel}. Document ID: ${document.id}`;
    }

    default:
      return `Unknown tool: ${toolName}`;
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // 3a. Dual-format request parsing
    let messages: { role: string; content: string }[];
    let caseId: string | undefined;
    let uploadedFileInfo: UploadedFileInfo | undefined;

    const contentType = req.headers.get("content-type") || "";

    if (contentType.includes("multipart/form-data")) {
      // FormData path: file + messages + optional caseId
      const formData = await req.formData();
      const file = formData.get("file") as File | null;
      const messagesRaw = formData.get("messages") as string | null;
      const caseIdRaw = formData.get("caseId") as string | null;

      if (!messagesRaw) {
        return NextResponse.json({ error: "Messages are required" }, { status: 400 });
      }

      messages = JSON.parse(messagesRaw);
      caseId = caseIdRaw || undefined;

      // 3b. Upload file to Supabase Storage immediately
      if (file) {
        const timestamp = Date.now();
        const sanitizedName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
        const storagePath = `${user.id}/${timestamp}-${sanitizedName}`;

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

        uploadedFileInfo = {
          storagePath,
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size,
        };
      }
    } else {
      // JSON path: existing behavior unchanged
      const body = await req.json();
      messages = body.messages;
      caseId = body.caseId;
    }

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
- Description: ${caseData.description || "N/A"}
- Case ID: ${caseData.id}`;
      }
    }

    // 3c. Inject file context into system prompt
    let fileContext = "";
    if (uploadedFileInfo) {
      fileContext = `\n\nThe user has attached a file to this message:
- File name: ${uploadedFileInfo.fileName}
- File type: ${uploadedFileInfo.fileType}
- File size: ${uploadedFileInfo.fileSize} bytes
- Storage path: ${uploadedFileInfo.storagePath}

The file has already been uploaded to storage. Use the \`file_document\` tool to create the document record and file it to the appropriate case. Do NOT re-upload the file. Use the storage_path, file_name, file_type, and file_size values provided above.`;
    }

    const systemPrompt = `You are Docketra AI, an intelligent legal assistant built into the Docketra legal practice management platform. You help solo attorneys and small law firms with:

- Creating and managing calendar events, court dates, and deadlines
- Looking up case details and client information
- Logging billable time entries
- Drafting legal documents (motions, pleadings, letters, contracts) — use draft_document for freeform drafting, or list_templates + draft_from_template to draft from saved templates
- Uploading and filing documents to cases
- Summarizing case details and documents
- Legal research and analysis
- General legal practice management advice
- Looking up case and client information from the system

You have direct access to the Docketra system through tools. When a user asks you to do something (like add a meeting, look up a case, or log time), USE the available tools to actually perform the action — do NOT just give instructions on how to do it manually.

Always be professional, accurate, and thorough. When drafting documents, use proper legal formatting and language. If you are unsure about jurisdiction-specific rules, mention that the attorney should verify local rules.

You are NOT a substitute for legal judgment. Always remind users that AI-generated content should be reviewed before filing or sending.${caseContext}${fileContext}`;

    const apiMessages: ChatCompletionMessageParam[] = [
      { role: "system", content: systemPrompt },
      ...messages.map((m: { role: string; content: string }) => ({
        role: m.role as "user" | "assistant" | "system",
        content: m.content,
      })),
    ];

    // First call — may include tool calls
    let response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: apiMessages,
      tools,
      stream: false,
    });

    let assistantMessage = response.choices[0]?.message;

    // Handle tool calls in a loop (up to 5 rounds)
    let rounds = 0;
    while (assistantMessage?.tool_calls && assistantMessage.tool_calls.length > 0 && rounds < 5) {
      rounds++;

      // Add assistant message with tool calls
      apiMessages.push(assistantMessage);

      // Execute each tool call
      for (const toolCall of assistantMessage.tool_calls) {
        const fn = toolCall as unknown as { function: { arguments: string; name: string } };
        const args = JSON.parse(fn.function.arguments);
        const result = await executeTool(fn.function.name, args, user.id, supabase, uploadedFileInfo);

        apiMessages.push({
          role: "tool",
          tool_call_id: toolCall.id,
          content: result,
        });
      }

      // Get next response
      response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: apiMessages,
        tools,
        stream: false,
      });

      assistantMessage = response.choices[0]?.message;
    }

    // Stream the final text response
    const finalContent = assistantMessage?.content || "I completed the action but have nothing additional to say.";

    const stream = new ReadableStream({
      start(controller) {
        const encoder = new TextEncoder();
        controller.enqueue(encoder.encode(finalContent));
        controller.close();
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

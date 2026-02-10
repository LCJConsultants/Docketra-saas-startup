export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: string;
}

export interface DraftRequest {
  templateId?: string;
  caseId?: string;
  instructions: string;
}

export interface DraftResponse {
  content: string;
  title: string;
}

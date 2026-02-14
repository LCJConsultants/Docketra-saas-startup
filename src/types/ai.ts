export interface ChatAttachment {
  fileName: string;
  fileType: string;
  fileSize: number;
}

export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: string;
  attachment?: ChatAttachment;
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

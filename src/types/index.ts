export type CaseType = "criminal" | "civil" | "divorce" | "custody" | "mediation" | "other";
export type CaseStatus = "open" | "pending" | "closed" | "archived";
export type ClientStatus = "active" | "inactive" | "archived";
export type InvoiceStatus = "draft" | "sent" | "paid" | "overdue" | "void";
export type DocumentCategory = "motion" | "pleading" | "correspondence" | "contract" | "evidence" | "other";
export type EventType = "court_date" | "deadline" | "filing" | "meeting" | "reminder" | "sol";
export type SubscriptionStatus = "trialing" | "active" | "past_due" | "canceled" | "unpaid";

export interface Profile {
  id: string;
  full_name: string;
  firm_name: string | null;
  email: string;
  phone: string | null;
  bar_number: string | null;
  practice_areas: string[] | null;
  avatar_url: string | null;
  stripe_customer_id: string | null;
  subscription_status: SubscriptionStatus;
  subscription_plan: string | null;
  google_refresh_token: string | null;
  gmail_refresh_token: string | null;
  outlook_refresh_token: string | null;
  dropbox_refresh_token: string | null;
  notification_preferences: {
    email: boolean;
    in_app: boolean;
    digest: boolean;
  };
  created_at: string;
  updated_at: string;
}

export interface Client {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  date_of_birth: string | null;
  notes: string | null;
  status: ClientStatus;
  drive_folder_id: string | null;
  dropbox_folder_path: string | null;
  created_at: string;
  updated_at: string;
}

export interface Case {
  id: string;
  user_id: string;
  client_id: string;
  case_number: string | null;
  title: string;
  case_type: CaseType;
  status: CaseStatus;
  description: string | null;
  court_name: string | null;
  judge_name: string | null;
  opposing_party: string | null;
  opposing_counsel: string | null;
  date_opened: string;
  date_closed: string | null;
  statute_of_limitations: string | null;
  drive_folder_id: string | null;
  dropbox_folder_path: string | null;
  tags: string[] | null;
  created_at: string;
  updated_at: string;
  client?: Client;
}

export interface Document {
  id: string;
  user_id: string;
  case_id: string | null;
  client_id: string | null;
  title: string;
  file_name: string;
  file_type: string | null;
  file_size: number | null;
  storage_path: string | null;
  drive_file_id: string | null;
  dropbox_file_id: string | null;
  category: DocumentCategory | null;
  ocr_text: string | null;
  ai_summary: string | null;
  is_template: boolean;
  source: string;
  created_at: string;
  updated_at: string;
}

export interface CalendarEvent {
  id: string;
  user_id: string;
  case_id: string | null;
  title: string;
  description: string | null;
  event_type: EventType;
  start_time: string;
  end_time: string | null;
  all_day: boolean;
  location: string | null;
  reminder_minutes: number[] | null;
  is_recurring: boolean;
  recurrence_rule: string | null;
  created_at: string;
  updated_at: string;
  case?: Case;
}

export interface TimeEntry {
  id: string;
  user_id: string;
  case_id: string;
  description: string;
  duration_minutes: number;
  hourly_rate: number | null;
  amount: number | null;
  date: string;
  is_billable: boolean;
  invoice_id: string | null;
  timer_started_at: string | null;
  created_at: string;
  updated_at: string;
  case?: Case;
}

export interface Invoice {
  id: string;
  user_id: string;
  client_id: string;
  case_id: string | null;
  invoice_number: string;
  status: InvoiceStatus;
  subtotal: number;
  tax_rate: number;
  tax_amount: number;
  total: number;
  notes: string | null;
  due_date: string | null;
  paid_date: string | null;
  sent_at: string | null;
  created_at: string;
  updated_at: string;
  client?: Client;
  case?: Case;
  line_items?: InvoiceLineItem[];
}

export interface InvoiceLineItem {
  id: string;
  invoice_id: string;
  description: string;
  quantity: number;
  unit_price: number;
  amount: number;
  time_entry_id: string | null;
  created_at: string;
}

export interface DocumentTemplate {
  id: string;
  user_id: string | null;
  title: string;
  category: string;
  content: string;
  variables: Record<string, string> | null;
  is_system: boolean;
  practice_area: string | null;
  created_at: string;
  updated_at: string;
}

export interface AIConversation {
  id: string;
  user_id: string;
  case_id: string | null;
  title: string | null;
  messages: AIMessage[];
  created_at: string;
  updated_at: string;
}

export interface AIMessage {
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: string;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string | null;
  type: "deadline" | "event" | "system" | "ai_complete";
  link: string | null;
  is_read: boolean;
  created_at: string;
}

export interface Email {
  id: string;
  user_id: string;
  case_id: string | null;
  client_id: string | null;
  message_id: string | null;
  thread_id: string | null;
  subject: string | null;
  from_address: string;
  to_addresses: string[];
  cc_addresses: string[] | null;
  bcc_addresses: string[] | null;
  body_text: string | null;
  body_html: string | null;
  snippet: string | null;
  is_read: boolean;
  is_starred: boolean;
  direction: "inbound" | "outbound";
  provider: "gmail" | "outlook" | null;
  provider_email_id: string | null;
  labels: string[] | null;
  has_attachments: boolean;
  ai_summary: string | null;
  sent_at: string | null;
  received_at: string | null;
  attachments: Array<{ name: string; size: number; storage_path: string }> | null;
  created_at: string;
  updated_at: string;
}

export interface Subscription {
  id: string;
  user_id: string;
  stripe_subscription_id: string | null;
  stripe_customer_id: string | null;
  plan: string;
  status: SubscriptionStatus;
  setup_fee_paid: boolean;
  current_period_start: string | null;
  current_period_end: string | null;
  cancel_at: string | null;
  created_at: string;
  updated_at: string;
}

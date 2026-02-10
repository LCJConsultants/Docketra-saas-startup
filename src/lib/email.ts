// Email integration helpers (Gmail + Outlook)
// These are placeholder implementations - connect actual APIs when credentials are configured

export async function getGmailAuthUrl(): Promise<string> {
  // TODO: Build with googleapis
  return "/api/integrations/google/callback";
}

export async function getOutlookAuthUrl(): Promise<string> {
  // TODO: Build with @microsoft/microsoft-graph-client
  return "/api/integrations/outlook/callback";
}

export async function sendGmailMessage(params: {
  refreshToken: string;
  to: string;
  subject: string;
  body: string;
}): Promise<{ messageId: string }> {
  // TODO: Implement with Gmail API
  console.log("Sending Gmail message:", params.to, params.subject);
  return { messageId: "placeholder" };
}

export async function sendOutlookMessage(params: {
  refreshToken: string;
  to: string;
  subject: string;
  body: string;
}): Promise<{ messageId: string }> {
  // TODO: Implement with Microsoft Graph API
  console.log("Sending Outlook message:", params.to, params.subject);
  return { messageId: "placeholder" };
}

export async function fetchGmailMessages(refreshToken: string, maxResults = 20) {
  // TODO: Implement with Gmail API
  console.log("Fetching Gmail messages, token:", refreshToken.slice(0, 5));
  return [];
}

export async function fetchOutlookMessages(refreshToken: string, maxResults = 20) {
  // TODO: Implement with Microsoft Graph API
  console.log("Fetching Outlook messages, token:", refreshToken.slice(0, 5));
  return [];
}

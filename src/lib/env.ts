// Validate required environment variables at startup
// This runs once when the module is imported and will cause a clear error
// message if any required env vars are missing.

const required = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "NEXT_PUBLIC_APP_URL",
] as const;

const serverRequired = [
  "SUPABASE_SERVICE_ROLE_KEY",
  "OPENAI_API_KEY",
  "RESEND_API_KEY",
] as const;

export function validateEnv() {
  const missing: string[] = [];

  for (const key of required) {
    if (!process.env[key]) {
      missing.push(key);
    }
  }

  // Only check server vars on the server side
  if (typeof window === "undefined") {
    for (const key of serverRequired) {
      if (!process.env[key]) {
        missing.push(key);
      }
    }
  }

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables:\n${missing.map((k) => `  - ${k}`).join("\n")}\n\nPlease add them to your .env.local file.`
    );
  }
}

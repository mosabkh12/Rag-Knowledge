import { AppError } from "./errors";

export interface ServerEnv {
  OPENAI_API_KEY: string;
  OPENAI_CHAT_MODEL: string | undefined;
  SUPABASE_URL: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
}

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value || value.trim().length === 0) {
    throw new AppError(
      `Missing required environment variable: ${name}. Check your .env.local file.`,
      500
    );
  }
  return value;
}

let cachedEnv: ServerEnv | undefined;

/**
 * Validates and returns server-only environment variables.
 * Lazily evaluated so that `next build` does not fail when secrets
 * are only available at runtime (e.g. Vercel serverless functions).
 */
export function getServerEnv(): ServerEnv {
  if (cachedEnv) {
    return cachedEnv;
  }

  cachedEnv = {
    OPENAI_API_KEY: requireEnv("OPENAI_API_KEY"),
    OPENAI_CHAT_MODEL: process.env.OPENAI_CHAT_MODEL,
    SUPABASE_URL: requireEnv("NEXT_PUBLIC_SUPABASE_URL"),
    SUPABASE_SERVICE_ROLE_KEY: requireEnv("SUPABASE_SERVICE_ROLE_KEY"),
  };

  return cachedEnv;
}

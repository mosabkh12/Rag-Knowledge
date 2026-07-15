import { AppError } from "./errors";

export interface ServerEnv {
  OPENAI_API_KEY: string;
  OPENAI_CHAT_MODEL: string | undefined;
  SUPABASE_URL: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
}

export interface SupabasePublicEnv {
  url: string;
  anonKey: string;
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

let cachedPublicEnv: SupabasePublicEnv | undefined;

/**
 * Validates and returns the public (browser-safe) Supabase credentials.
 * The anon key is designed to be exposed to clients — access control is
 * enforced by Row-Level Security, not by keeping this key secret.
 */
export function getSupabasePublicEnv(): SupabasePublicEnv {
  if (cachedPublicEnv) {
    return cachedPublicEnv;
  }

  // Next.js can only inline NEXT_PUBLIC_* vars into the browser bundle
  // when referenced as a static `process.env.X` literal — a dynamic
  // `process.env[name]` lookup (like requireEnv uses) is invisible to
  // its bundler and resolves to undefined on the client.
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new AppError(
      "Missing required environment variable: NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY.",
      500
    );
  }

  cachedPublicEnv = { url, anonKey };

  return cachedPublicEnv;
}

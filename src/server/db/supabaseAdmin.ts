import "server-only";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { getServerEnv } from "@/lib/env";

let cachedClient: SupabaseClient | undefined;

/**
 * Returns a singleton Supabase client authenticated with the service role
 * key. This is the only file in the project allowed to read
 * SUPABASE_SERVICE_ROLE_KEY or instantiate a privileged Supabase client.
 */
export function getSupabaseAdmin(): SupabaseClient {
  if (cachedClient) {
    return cachedClient;
  }

  const env = getServerEnv();
  cachedClient = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  return cachedClient;
}

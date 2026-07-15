import "server-only";
import { createClient } from "@/lib/supabase/server";
import { AppError } from "@/lib/errors";
import type { Profile } from "@/types/auth";

interface ProfileRow {
  id: string;
  email: string;
  role: "user" | "admin";
  created_at: string;
}

function toProfile(row: ProfileRow): Profile {
  return {
    id: row.id,
    email: row.email,
    role: row.role,
    createdAt: row.created_at,
  };
}

/**
 * Returns the signed-in user's profile, or null if no session is present.
 * Runs through the RLS-scoped client, so a user can only ever read their
 * own profile row via this path.
 */
export async function getCurrentProfile(): Promise<Profile | null> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("id, email, role, created_at")
    .eq("id", user.id)
    .maybeSingle<ProfileRow>();

  if (error || !data) {
    return null;
  }

  return toProfile(data);
}

/**
 * Requires a signed-in user, throwing a 401 AppError otherwise.
 * Use in Route Handlers that must not run for anonymous requests.
 */
export async function requireUser(): Promise<Profile> {
  const profile = await getCurrentProfile();

  if (!profile) {
    throw new AppError("You must be signed in to do this.", 401);
  }

  return profile;
}

/**
 * Requires a signed-in admin, throwing a 403 AppError for non-admins
 * and a 401 for anonymous requests.
 */
export async function requireAdmin(): Promise<Profile> {
  const profile = await requireUser();

  if (profile.role !== "admin") {
    throw new AppError("This action requires an administrator account.", 403);
  }

  return profile;
}

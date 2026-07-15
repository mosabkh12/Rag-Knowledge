import "server-only";
import { getSupabaseAdmin } from "./supabaseAdmin";
import { AppError, NotFoundError } from "@/lib/errors";
import type { Profile, UserRole } from "@/types/auth";

interface ProfileRow {
  id: string;
  email: string;
  role: UserRole;
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
 * Lists every user profile, most recently joined first. Callers must
 * have already verified the requester is an admin.
 */
export async function listProfiles(): Promise<Profile[]> {
  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase
    .from("profiles")
    .select("id, email, role, created_at")
    .order("created_at", { ascending: false })
    .returns<ProfileRow[]>();

  if (error || !data) {
    throw new AppError("Failed to load users. Please try again.", 500);
  }

  return data.map(toProfile);
}

/**
 * Counts how many admin accounts currently exist, used to prevent
 * demoting the last remaining admin and locking everyone out.
 */
export async function countAdmins(): Promise<number> {
  const supabase = getSupabaseAdmin();

  const { count, error } = await supabase
    .from("profiles")
    .select("id", { count: "exact", head: true })
    .eq("role", "admin");

  if (error) {
    throw new AppError("Failed to load users. Please try again.", 500);
  }

  return count ?? 0;
}

/**
 * Updates a user's role. Returns the updated profile.
 */
export async function updateProfileRole(id: string, role: UserRole): Promise<Profile> {
  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase
    .from("profiles")
    .update({ role })
    .eq("id", id)
    .select("id, email, role, created_at")
    .maybeSingle<ProfileRow>();

  if (error) {
    throw new AppError("Failed to update the user's role. Please try again.", 500);
  }

  if (!data) {
    throw new NotFoundError("User not found.");
  }

  return toProfile(data);
}

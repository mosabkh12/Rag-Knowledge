import "server-only";
import { randomUUID } from "crypto";
import { getSupabaseAdmin } from "@/server/db/supabaseAdmin";
import { AppError } from "@/lib/errors";
import { DOCUMENT_STORAGE_BUCKET, SIGNED_FILE_URL_EXPIRY_SECONDS } from "@/lib/constants";

function sanitizeFileName(fileName: string): string {
  return fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
}

/**
 * Uploads the original file bytes to Supabase Storage and returns the
 * path it was stored at, so the document row can keep a reference to
 * the untouched original alongside its extracted text.
 */
export async function uploadDocumentFile(
  buffer: Buffer,
  fileName: string,
  mimeType: string
): Promise<string> {
  const supabase = getSupabaseAdmin();
  const path = `${randomUUID()}/${sanitizeFileName(fileName)}`;

  const { error } = await supabase.storage
    .from(DOCUMENT_STORAGE_BUCKET)
    .upload(path, buffer, { contentType: mimeType, upsert: false });

  if (error) {
    throw new AppError("Failed to store the uploaded file. Please try again.", 500);
  }

  return path;
}

/**
 * Generates a short-lived signed URL for viewing/downloading the
 * original file. The bucket is private, so this is the only way to
 * reach the file's bytes from a browser.
 */
export async function getSignedDocumentFileUrl(storagePath: string): Promise<string> {
  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase.storage
    .from(DOCUMENT_STORAGE_BUCKET)
    .createSignedUrl(storagePath, SIGNED_FILE_URL_EXPIRY_SECONDS);

  if (error || !data) {
    throw new AppError("Failed to generate a link for this file. Please try again.", 500);
  }

  return data.signedUrl;
}

/**
 * Deletes the original file from storage. Best-effort: failures are
 * swallowed since the document row is the source of truth and may
 * already be gone by the time this runs.
 */
export async function deleteDocumentFile(storagePath: string): Promise<void> {
  const supabase = getSupabaseAdmin();
  await supabase.storage.from(DOCUMENT_STORAGE_BUCKET).remove([storagePath]);
}

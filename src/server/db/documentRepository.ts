import "server-only";
import { getSupabaseAdmin } from "./supabaseAdmin";
import { AppError } from "@/lib/errors";
import type { Document, NewDocumentInput } from "@/types/document";

interface DocumentRow {
  id: string;
  title: string;
  content: string;
  created_at: string;
}

function toDocument(row: DocumentRow): Document {
  return {
    id: row.id,
    title: row.title,
    content: row.content,
    createdAt: row.created_at,
  };
}

/**
 * Inserts a new document and returns its persisted representation.
 */
export async function insertDocument(input: NewDocumentInput): Promise<Document> {
  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase
    .from("documents")
    .insert({ title: input.title, content: input.content })
    .select("id, title, content, created_at")
    .single<DocumentRow>();

  if (error || !data) {
    throw new AppError("Failed to save the document. Please try again.", 500);
  }

  return toDocument(data);
}

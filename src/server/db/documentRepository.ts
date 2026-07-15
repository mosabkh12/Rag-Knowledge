import "server-only";
import { getSupabaseAdmin } from "./supabaseAdmin";
import { AppError, NotFoundError } from "@/lib/errors";
import { DOCUMENT_PREVIEW_LENGTH } from "@/lib/constants";
import type { Document, DocumentSummary, NewDocumentInput } from "@/types/document";

interface DocumentRow {
  id: string;
  title: string;
  content: string;
  created_at: string;
  created_by: string | null;
  storage_path: string | null;
  file_name: string | null;
  mime_type: string | null;
}

interface DocumentListRow extends DocumentRow {
  document_chunks: { count: number }[];
}

const DOCUMENT_COLUMNS = "id, title, content, created_at, created_by, storage_path, file_name, mime_type";

function toDocument(row: DocumentRow): Document {
  return {
    id: row.id,
    title: row.title,
    content: row.content,
    createdAt: row.created_at,
    createdBy: row.created_by,
    storagePath: row.storage_path,
    fileName: row.file_name,
    mimeType: row.mime_type,
  };
}

function toDocumentSummary(row: DocumentListRow): DocumentSummary {
  return {
    id: row.id,
    title: row.title,
    createdAt: row.created_at,
    createdBy: row.created_by,
    chunkCount: row.document_chunks[0]?.count ?? 0,
    contentPreview: row.content.slice(0, DOCUMENT_PREVIEW_LENGTH),
    fileName: row.file_name,
    hasOriginalFile: row.storage_path !== null,
  };
}

/**
 * Inserts a new document and returns its persisted representation.
 */
export async function insertDocument(input: NewDocumentInput): Promise<Document> {
  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase
    .from("documents")
    .insert({
      title: input.title,
      content: input.content,
      created_by: input.createdBy,
      storage_path: input.storagePath,
      file_name: input.fileName,
      mime_type: input.mimeType,
    })
    .select(DOCUMENT_COLUMNS)
    .single<DocumentRow>();

  if (error || !data) {
    throw new AppError("Failed to save the document. Please try again.", 500);
  }

  return toDocument(data);
}

/**
 * Lists all documents with their chunk count and a short content preview,
 * most recently added first.
 */
export async function listDocuments(): Promise<DocumentSummary[]> {
  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase
    .from("documents")
    .select(`${DOCUMENT_COLUMNS}, document_chunks(count)`)
    .order("created_at", { ascending: false })
    .returns<DocumentListRow[]>();

  if (error || !data) {
    throw new AppError("Failed to load documents. Please try again.", 500);
  }

  return data.map(toDocumentSummary);
}

/**
 * Fetches a single document with its full content.
 */
export async function getDocumentById(id: string): Promise<Document> {
  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase
    .from("documents")
    .select(DOCUMENT_COLUMNS)
    .eq("id", id)
    .maybeSingle<DocumentRow>();

  if (error) {
    throw new AppError("Failed to load the document. Please try again.", 500);
  }

  if (!data) {
    throw new NotFoundError("Document not found.");
  }

  return toDocument(data);
}

/**
 * Deletes a document and, via cascade, its chunks. Does not remove the
 * original file from storage — callers with the document's storagePath
 * should do that separately (see deleteDocumentFile).
 */
export async function deleteDocument(id: string): Promise<void> {
  const supabase = getSupabaseAdmin();

  const { error, count } = await supabase
    .from("documents")
    .delete({ count: "exact" })
    .eq("id", id);

  if (error) {
    throw new AppError("Failed to delete the document. Please try again.", 500);
  }

  if (!count) {
    throw new NotFoundError("Document not found.");
  }
}

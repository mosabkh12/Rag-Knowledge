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
}

interface DocumentListRow extends DocumentRow {
  document_chunks: { count: number }[];
}

function toDocument(row: DocumentRow): Document {
  return {
    id: row.id,
    title: row.title,
    content: row.content,
    createdAt: row.created_at,
    createdBy: row.created_by,
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
  };
}

/**
 * Inserts a new document and returns its persisted representation.
 */
export async function insertDocument(input: NewDocumentInput): Promise<Document> {
  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase
    .from("documents")
    .insert({ title: input.title, content: input.content, created_by: input.createdBy })
    .select("id, title, content, created_at, created_by")
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
    .select("id, title, content, created_at, created_by, document_chunks(count)")
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
    .select("id, title, content, created_at, created_by")
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
 * Deletes a document and, via cascade, its chunks.
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

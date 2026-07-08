import "server-only";
import { getSupabaseAdmin } from "./supabaseAdmin";
import { AppError } from "@/lib/errors";
import { DEFAULT_TOP_K, SIMILARITY_THRESHOLD } from "@/lib/constants";
import type { NewChunkInput } from "@/types/document";
import type { RetrievedChunk } from "@/types/rag";

interface MatchChunkRow {
  id: string;
  document_id: string;
  content: string;
  similarity: number;
}

/**
 * Bulk-inserts document chunks along with their embeddings.
 */
export async function insertChunks(chunks: NewChunkInput[]): Promise<number> {
  if (chunks.length === 0) {
    return 0;
  }

  const supabase = getSupabaseAdmin();

  const rows = chunks.map((chunk) => ({
    document_id: chunk.documentId,
    chunk_index: chunk.chunkIndex,
    content: chunk.content,
    embedding: chunk.embedding,
  }));

  const { error, count } = await supabase
    .from("document_chunks")
    .insert(rows, { count: "exact" });

  if (error) {
    throw new AppError("Failed to save document chunks. Please try again.", 500);
  }

  return count ?? rows.length;
}

/**
 * Finds the most semantically similar chunks to a query embedding using
 * the `match_document_chunks` Postgres RPC function (pgvector cosine
 * similarity search).
 */
export async function matchChunks(
  queryEmbedding: number[],
  matchCount: number = DEFAULT_TOP_K,
  similarityThreshold: number = SIMILARITY_THRESHOLD
): Promise<RetrievedChunk[]> {
  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase.rpc("match_document_chunks", {
    query_embedding: queryEmbedding,
    match_count: matchCount,
    similarity_threshold: similarityThreshold,
  });

  if (error) {
    throw new AppError(
      "Failed to retrieve relevant context. Please try again.",
      500
    );
  }

  const rows = (data ?? []) as MatchChunkRow[];

  return rows.map((row) => ({
    id: row.id,
    documentId: row.document_id,
    content: row.content,
    similarity: row.similarity,
  }));
}

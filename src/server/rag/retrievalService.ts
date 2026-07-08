import { generateEmbedding } from "@/server/ai/embeddingService";
import { matchChunks } from "@/server/db/chunkRepository";
import { DEFAULT_TOP_K, SIMILARITY_THRESHOLD } from "@/lib/constants";
import type { RetrievedChunk } from "@/types/rag";

/**
 * Embeds a question and retrieves the top-k most similar chunks from the
 * knowledge base via pgvector cosine similarity search.
 */
export async function retrieveRelevantChunks(
  question: string,
  topK: number = DEFAULT_TOP_K
): Promise<RetrievedChunk[]> {
  const queryEmbedding = await generateEmbedding(question);
  return matchChunks(queryEmbedding, topK, SIMILARITY_THRESHOLD);
}

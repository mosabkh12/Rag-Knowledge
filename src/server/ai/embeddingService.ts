import "server-only";
import { getOpenAIClient } from "./openaiClient";
import { EMBEDDING_MODEL } from "@/lib/constants";
import { AppError } from "@/lib/errors";

/**
 * Generates an embedding vector for a single piece of text.
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  const [embedding] = await generateEmbeddings([text]);
  return embedding;
}

/**
 * Generates embedding vectors for a batch of texts in one API call.
 */
export async function generateEmbeddings(texts: string[]): Promise<number[][]> {
  if (texts.length === 0) {
    return [];
  }

  const client = getOpenAIClient();

  try {
    const response = await client.embeddings.create({
      model: EMBEDDING_MODEL,
      input: texts,
    });

    return response.data.map((item) => item.embedding);
  } catch {
    throw new AppError(
      "Failed to generate embeddings. Please try again in a moment.",
      502
    );
  }
}

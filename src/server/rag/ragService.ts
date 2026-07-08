import { chunkText } from "./chunkText";
import { buildGroundedPrompt } from "./promptBuilder";
import { retrieveRelevantChunks } from "./retrievalService";
import { generateEmbeddings } from "@/server/ai/embeddingService";
import { generateChatCompletion } from "@/server/ai/chatService";
import { insertDocument } from "@/server/db/documentRepository";
import { insertChunks } from "@/server/db/chunkRepository";
import { NO_CONTEXT_ANSWER } from "@/lib/constants";
import type { NewDocumentInput } from "@/types/document";
import type { RagAnswer } from "@/types/rag";

export interface IngestDocumentResult {
  documentId: string;
  chunksCreated: number;
}

/**
 * Full document ingestion pipeline: persist the document, split it into
 * overlapping chunks, embed each chunk, and store the embeddings.
 */
export async function ingestDocument(
  input: NewDocumentInput
): Promise<IngestDocumentResult> {
  const document = await insertDocument(input);

  const textChunks = chunkText(document.content);
  if (textChunks.length === 0) {
    return { documentId: document.id, chunksCreated: 0 };
  }

  const embeddings = await generateEmbeddings(textChunks.map((chunk) => chunk.content));

  const chunksCreated = await insertChunks(
    textChunks.map((chunk, index) => ({
      documentId: document.id,
      chunkIndex: chunk.chunkIndex,
      content: chunk.content,
      embedding: embeddings[index],
    }))
  );

  return { documentId: document.id, chunksCreated };
}

/**
 * Full question-answering pipeline: retrieve relevant chunks, and either
 * return the safe fallback answer or generate a grounded answer from the
 * retrieved context.
 */
export async function answerQuestion(
  question: string,
  topK: number
): Promise<RagAnswer> {
  const sources = await retrieveRelevantChunks(question, topK);

  if (sources.length === 0) {
    return { answer: NO_CONTEXT_ANSWER, sources: [] };
  }

  const messages = buildGroundedPrompt(question, sources);
  const answer = await generateChatCompletion(messages);

  return { answer, sources };
}

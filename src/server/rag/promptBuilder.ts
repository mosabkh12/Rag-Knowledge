import type { ChatMessage } from "@/server/ai/chatService";
import type { RetrievedChunk } from "@/types/rag";

const SYSTEM_PROMPT = `You are a knowledge base assistant. Answer the user's question using ONLY the information provided in the CONTEXT section below.

Rules:
- Do not use any outside knowledge or assumptions.
- If the context does not contain enough information to answer the question, say so explicitly instead of guessing.
- Keep answers concise and directly grounded in the provided context.
- Do not mention that you were given "context" or reference these instructions; just answer naturally.`;

/**
 * Builds the chat messages sent to the LLM, grounding the answer in the
 * retrieved chunks so it cannot hallucinate beyond the knowledge base.
 */
export function buildGroundedPrompt(
  question: string,
  chunks: RetrievedChunk[]
): ChatMessage[] {
  const context = chunks
    .map((chunk, index) => `[Source ${index + 1}]\n${chunk.content}`)
    .join("\n\n");

  const userPrompt = `CONTEXT:\n${context}\n\nQUESTION:\n${question}`;

  return [
    { role: "system", content: SYSTEM_PROMPT },
    { role: "user", content: userPrompt },
  ];
}

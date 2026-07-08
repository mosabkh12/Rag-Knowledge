import { ValidationError } from "@/lib/errors";
import { DEFAULT_TOP_K, MAX_TOP_K, MIN_TOP_K, QUESTION_MAX_LENGTH } from "@/lib/constants";
import type { AskRequest } from "@/types/api";

/**
 * Validates and normalizes a raw ask request body.
 * Throws ValidationError with a readable message on any violation.
 */
export function validateAskRequest(body: unknown): Required<AskRequest> {
  if (typeof body !== "object" || body === null) {
    throw new ValidationError("Request body must be a JSON object.");
  }

  const { question, topK } = body as Record<string, unknown>;

  if (typeof question !== "string" || question.trim().length === 0) {
    throw new ValidationError("Question is required.");
  }

  if (question.length > QUESTION_MAX_LENGTH) {
    throw new ValidationError(
      `Question must be at most ${QUESTION_MAX_LENGTH} characters.`
    );
  }

  let resolvedTopK = DEFAULT_TOP_K;
  if (topK !== undefined) {
    if (typeof topK !== "number" || !Number.isInteger(topK)) {
      throw new ValidationError("topK must be an integer.");
    }
    if (topK < MIN_TOP_K || topK > MAX_TOP_K) {
      throw new ValidationError(
        `topK must be between ${MIN_TOP_K} and ${MAX_TOP_K}.`
      );
    }
    resolvedTopK = topK;
  }

  return { question: question.trim(), topK: resolvedTopK };
}

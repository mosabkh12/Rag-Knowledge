import { ValidationError } from "@/lib/errors";
import {
  DOCUMENT_CONTENT_MAX_LENGTH,
  DOCUMENT_CONTENT_MIN_LENGTH,
  DOCUMENT_TITLE_MAX_LENGTH,
} from "@/lib/constants";
import type { CreateDocumentRequest } from "@/types/api";

/**
 * Validates and normalizes a raw create-document request body.
 * Throws ValidationError with a readable message on any violation.
 */
export function validateCreateDocumentRequest(
  body: unknown
): CreateDocumentRequest {
  if (typeof body !== "object" || body === null) {
    throw new ValidationError("Request body must be a JSON object.");
  }

  const { title, content } = body as Record<string, unknown>;

  if (typeof title !== "string" || title.trim().length === 0) {
    throw new ValidationError("Title is required.");
  }

  if (title.length > DOCUMENT_TITLE_MAX_LENGTH) {
    throw new ValidationError(
      `Title must be at most ${DOCUMENT_TITLE_MAX_LENGTH} characters.`
    );
  }

  if (typeof content !== "string" || content.trim().length === 0) {
    throw new ValidationError("Content is required.");
  }

  if (content.length < DOCUMENT_CONTENT_MIN_LENGTH) {
    throw new ValidationError(
      `Content must be at least ${DOCUMENT_CONTENT_MIN_LENGTH} characters.`
    );
  }

  if (content.length > DOCUMENT_CONTENT_MAX_LENGTH) {
    throw new ValidationError(
      `Content must be at most ${DOCUMENT_CONTENT_MAX_LENGTH} characters.`
    );
  }

  return { title: title.trim(), content: content.trim() };
}

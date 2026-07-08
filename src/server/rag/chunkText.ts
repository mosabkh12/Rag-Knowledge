import { CHUNK_MAX_SIZE, CHUNK_OVERLAP, CHUNK_TARGET_SIZE } from "@/lib/constants";
import type { TextChunk } from "@/types/rag";

/**
 * Collapses excess whitespace so chunk boundaries are computed against
 * consistent, predictable text.
 */
export function cleanText(text: string): string {
  return text.replace(/\r\n/g, "\n").replace(/[ \t]+/g, " ").trim();
}

/**
 * Splits text into overlapping chunks of roughly CHUNK_TARGET_SIZE
 * characters (bounded by CHUNK_MAX_SIZE), breaking on paragraph or
 * sentence boundaries where possible so chunks stay coherent.
 */
export function chunkText(rawText: string): TextChunk[] {
  const text = cleanText(rawText);

  if (text.length === 0) {
    return [];
  }

  if (text.length <= CHUNK_MAX_SIZE) {
    return [{ chunkIndex: 0, content: text }];
  }

  const chunks: TextChunk[] = [];
  let start = 0;
  let chunkIndex = 0;

  while (start < text.length) {
    let end = Math.min(start + CHUNK_TARGET_SIZE, text.length);

    if (end < text.length) {
      const searchWindow = text.slice(start, Math.min(start + CHUNK_MAX_SIZE, text.length));
      const boundary = findLastBoundary(searchWindow);
      if (boundary > 0) {
        end = start + boundary;
      }
    }

    const content = text.slice(start, end).trim();
    if (content.length > 0) {
      chunks.push({ chunkIndex, content });
      chunkIndex += 1;
    }

    if (end >= text.length) {
      break;
    }

    start = Math.max(end - CHUNK_OVERLAP, start + 1);
  }

  return chunks;
}

function findLastBoundary(window: string): number {
  const paragraphBreak = window.lastIndexOf("\n\n");
  if (paragraphBreak > window.length * 0.4) {
    return paragraphBreak + 2;
  }

  const sentenceBreak = Math.max(
    window.lastIndexOf(". "),
    window.lastIndexOf(".\n")
  );
  if (sentenceBreak > window.length * 0.4) {
    return sentenceBreak + 2;
  }

  const spaceBreak = window.lastIndexOf(" ");
  if (spaceBreak > window.length * 0.4) {
    return spaceBreak + 1;
  }

  return window.length;
}

import "server-only";
import { PDFParse } from "pdf-parse";
import mammoth from "mammoth";
import { ValidationError } from "@/lib/errors";
import { SUPPORTED_FILE_EXTENSIONS } from "@/lib/constants";

const TEXT_EXTENSIONS = [".txt", ".md", ".markdown"];

const MIME_TYPES: Record<string, string> = {
  ".txt": "text/plain",
  ".md": "text/markdown",
  ".markdown": "text/markdown",
  ".pdf": "application/pdf",
  ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
};

/**
 * Best-effort MIME type for a filename, used when storing the original
 * file so it opens correctly (e.g. inline PDF rendering) in a browser.
 */
export function getMimeType(filename: string): string {
  const extension = getExtension(filename);
  return MIME_TYPES[extension] ?? "application/octet-stream";
}

export function getExtension(filename: string): string {
  const match = filename.toLowerCase().match(/\.[^./]+$/);
  return match ? match[0] : "";
}

export function isSupportedDocumentExtension(filename: string): boolean {
  const extension = getExtension(filename);
  return extension === ".pdf" || extension === ".docx" || TEXT_EXTENSIONS.includes(extension);
}

/**
 * Extracts plain text from a file's raw bytes based on its extension.
 * Supports .txt/.md (read as-is), .pdf (pdf-parse), and .docx (mammoth).
 */
export async function extractTextFromBuffer(buffer: Buffer, filename: string): Promise<string> {
  const extension = getExtension(filename);

  if (extension === ".pdf") {
    return extractPdfText(buffer);
  }

  if (extension === ".docx") {
    return extractDocxText(buffer);
  }

  if (TEXT_EXTENSIONS.includes(extension)) {
    return buffer.toString("utf-8");
  }

  throw new ValidationError(
    `Unsupported file type. Supported formats: ${SUPPORTED_FILE_EXTENSIONS.join(", ")}.`
  );
}

/**
 * Convenience wrapper for a browser-provided File/Blob.
 */
export async function extractTextFromFile(file: File): Promise<string> {
  const buffer = Buffer.from(await file.arrayBuffer());
  return extractTextFromBuffer(buffer, file.name);
}

async function extractPdfText(buffer: Buffer): Promise<string> {
  const parser = new PDFParse({ data: buffer });

  try {
    const result = await parser.getText();

    if (result.text.trim().length === 0) {
      throw new ValidationError(
        "No extractable text was found in this PDF. It may be a scanned or image-only document."
      );
    }

    return result.text;
  } catch (error) {
    if (error instanceof ValidationError) {
      throw error;
    }
    throw new ValidationError(
      "Could not extract text from this PDF. It may be corrupted or password-protected."
    );
  } finally {
    await parser.destroy();
  }
}

async function extractDocxText(buffer: Buffer): Promise<string> {
  try {
    const result = await mammoth.extractRawText({ buffer });

    if (result.value.trim().length === 0) {
      throw new ValidationError("No extractable text was found in this Word document.");
    }

    return result.value;
  } catch (error) {
    if (error instanceof ValidationError) {
      throw error;
    }
    throw new ValidationError("Could not extract text from this Word document.");
  }
}

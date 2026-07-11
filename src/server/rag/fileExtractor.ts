import "server-only";
import { PDFParse } from "pdf-parse";
import mammoth from "mammoth";
import { ValidationError } from "@/lib/errors";
import { SUPPORTED_FILE_EXTENSIONS } from "@/lib/constants";

const TEXT_EXTENSIONS = [".txt", ".md", ".markdown"];

/**
 * Extracts plain text from an uploaded file based on its extension.
 * Supports .txt/.md (read as-is), .pdf (pdf-parse), and .docx (mammoth).
 */
export async function extractTextFromFile(file: File): Promise<string> {
  const name = file.name.toLowerCase();
  const buffer = Buffer.from(await file.arrayBuffer());

  if (name.endsWith(".pdf")) {
    return extractPdfText(buffer);
  }

  if (name.endsWith(".docx")) {
    return extractDocxText(buffer);
  }

  if (TEXT_EXTENSIONS.some((extension) => name.endsWith(extension))) {
    return buffer.toString("utf-8");
  }

  throw new ValidationError(
    `Unsupported file type. Supported formats: ${SUPPORTED_FILE_EXTENSIONS.join(", ")}.`
  );
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

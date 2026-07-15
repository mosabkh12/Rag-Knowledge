import "server-only";
import JSZip from "jszip";
import { ValidationError } from "@/lib/errors";
import { FILE_MAX_SIZE_BYTES, ZIP_MAX_ENTRIES } from "@/lib/constants";
import { isSupportedDocumentExtension } from "./fileExtractor";

export interface ZipEntry {
  fileName: string;
  buffer: Buffer;
}

export interface ZipSkippedEntry {
  fileName: string;
  reason: string;
}

export interface ZipExtractionResult {
  entries: ZipEntry[];
  skipped: ZipSkippedEntry[];
}

const IGNORED_PATH_SEGMENTS = ["__macosx", ".ds_store"];

function shouldIgnoreEntry(path: string): boolean {
  const lower = path.toLowerCase();
  return IGNORED_PATH_SEGMENTS.some((segment) => lower.includes(segment));
}

function basename(path: string): string {
  const parts = path.split("/").filter(Boolean);
  return parts[parts.length - 1] ?? path;
}

/**
 * Extracts every supported document file from a zip archive's bytes.
 * Directories, hidden/OS metadata files, and unsupported extensions are
 * silently skipped. An oversized individual file is skipped (reported
 * in `skipped`) rather than failing the whole archive.
 */
export async function extractZipEntries(buffer: Buffer): Promise<ZipExtractionResult> {
  let archive: JSZip;

  try {
    archive = await JSZip.loadAsync(buffer);
  } catch {
    throw new ValidationError("Could not read this .zip file. It may be corrupted.");
  }

  const candidates = Object.values(archive.files).filter((entry) => {
    if (entry.dir || shouldIgnoreEntry(entry.name)) {
      return false;
    }
    return isSupportedDocumentExtension(basename(entry.name));
  });

  if (candidates.length === 0) {
    throw new ValidationError(
      "No supported documents (.txt, .md, .pdf, .docx) were found inside this .zip file."
    );
  }

  if (candidates.length > ZIP_MAX_ENTRIES) {
    throw new ValidationError(
      `This .zip file contains too many documents. Maximum ${ZIP_MAX_ENTRIES} files per upload.`
    );
  }

  const entries: ZipEntry[] = [];
  const skipped: ZipSkippedEntry[] = [];

  for (const entry of candidates) {
    const fileName = basename(entry.name);
    const fileBuffer = await entry.async("nodebuffer");

    if (fileBuffer.length === 0) {
      continue;
    }

    if (fileBuffer.length > FILE_MAX_SIZE_BYTES) {
      skipped.push({
        fileName,
        reason: `File is too large. Maximum size is ${Math.floor(
          FILE_MAX_SIZE_BYTES / (1024 * 1024)
        )}MB per file.`,
      });
      continue;
    }

    entries.push({ fileName, buffer: fileBuffer });
  }

  if (entries.length === 0) {
    throw new ValidationError(
      skipped[0]?.reason ?? "None of the files inside this .zip could be read."
    );
  }

  return { entries, skipped };
}

import { NextRequest, NextResponse } from "next/server";
import {
  validateCreateDocumentRequest,
  validateContent,
  validateTitle,
} from "@/server/validators/documentValidators";
import {
  extractTextFromBuffer,
  getExtension,
  getMimeType,
} from "@/server/rag/fileExtractor";
import { extractZipEntries } from "@/server/rag/zipExtractor";
import { uploadDocumentFile } from "@/server/storage/documentFileStorage";
import { ingestDocument } from "@/server/rag/ragService";
import { listDocuments } from "@/server/db/documentRepository";
import { requireUser } from "@/server/auth/session";
import { AppError, ValidationError, toStatusCode, toUserFacingMessage } from "@/lib/errors";
import { FILE_MAX_SIZE_BYTES, ZIP_EXTENSION, ZIP_MAX_SIZE_BYTES } from "@/lib/constants";
import type {
  CreateDocumentResponse,
  IngestedDocument,
  IngestFailure,
  ListDocumentsResponse,
} from "@/types/api";

export async function GET() {
  try {
    await requireUser();
    const documents = await listDocuments();
    const response: ListDocumentsResponse = { documents };
    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: toUserFacingMessage(error) },
      { status: toStatusCode(error) }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const profile = await requireUser();
    const contentType = request.headers.get("content-type") ?? "";

    const response = contentType.includes("multipart/form-data")
      ? await handleFileUpload(request, profile.id)
      : await handlePasteText(request, profile.id);

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: toUserFacingMessage(error) },
      { status: toStatusCode(error) }
    );
  }
}

async function handlePasteText(
  request: NextRequest,
  createdBy: string
): Promise<CreateDocumentResponse> {
  const { title, content } = validateCreateDocumentRequest(await request.json());

  const result = await ingestDocument({
    title,
    content,
    createdBy,
    storagePath: null,
    fileName: null,
    mimeType: null,
  });

  return {
    documents: [
      { documentId: result.documentId, title: result.title, chunksCreated: result.chunksCreated },
    ],
    failed: [],
  };
}

async function handleFileUpload(
  request: NextRequest,
  createdBy: string
): Promise<CreateDocumentResponse> {
  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    throw new ValidationError("A file is required.");
  }

  if (file.size === 0) {
    throw new ValidationError("The uploaded file is empty.");
  }

  const rawTitle = formData.get("title");
  const providedTitle =
    typeof rawTitle === "string" && rawTitle.trim().length > 0 ? rawTitle.trim() : null;

  const extension = getExtension(file.name);
  const buffer = Buffer.from(await file.arrayBuffer());

  if (extension === ZIP_EXTENSION) {
    if (file.size > ZIP_MAX_SIZE_BYTES) {
      throw new ValidationError(
        `Zip file is too large. Maximum size is ${Math.floor(
          ZIP_MAX_SIZE_BYTES / (1024 * 1024)
        )}MB.`
      );
    }

    return ingestZipArchive(buffer, createdBy);
  }

  if (file.size > FILE_MAX_SIZE_BYTES) {
    throw new ValidationError(
      `File is too large. Maximum size is ${Math.floor(
        FILE_MAX_SIZE_BYTES / (1024 * 1024)
      )}MB.`
    );
  }

  const document = await ingestSingleFile(buffer, file.name, providedTitle, createdBy);
  return { documents: [document], failed: [] };
}

async function ingestZipArchive(
  buffer: Buffer,
  createdBy: string
): Promise<CreateDocumentResponse> {
  const { entries, skipped } = await extractZipEntries(buffer);

  const documents: IngestedDocument[] = [];
  const failed: IngestFailure[] = skipped.map((entry) => ({
    fileName: entry.fileName,
    error: entry.reason,
  }));

  for (const entry of entries) {
    try {
      const document = await ingestSingleFile(entry.buffer, entry.fileName, null, createdBy);
      documents.push(document);
    } catch (error) {
      failed.push({
        fileName: entry.fileName,
        error: error instanceof AppError ? error.message : "Failed to process this file.",
      });
    }
  }

  if (documents.length === 0) {
    throw new ValidationError(
      failed[0]?.error ?? "None of the files inside this .zip could be added."
    );
  }

  return { documents, failed };
}

async function ingestSingleFile(
  buffer: Buffer,
  fileName: string,
  providedTitle: string | null,
  createdBy: string
): Promise<IngestedDocument> {
  const title = validateTitle(providedTitle ?? deriveTitleFromFilename(fileName));
  const extractedText = await extractTextFromBuffer(buffer, fileName);
  const content = validateContent(extractedText);
  const mimeType = getMimeType(fileName);
  const storagePath = await uploadDocumentFile(buffer, fileName, mimeType);

  const result = await ingestDocument({
    title,
    content,
    createdBy,
    storagePath,
    fileName,
    mimeType,
  });

  return { documentId: result.documentId, title: result.title, chunksCreated: result.chunksCreated };
}

function deriveTitleFromFilename(filename: string): string {
  const withoutExtension = filename.replace(/\.[^./]+$/, "");
  return withoutExtension.trim().length > 0 ? withoutExtension : filename;
}

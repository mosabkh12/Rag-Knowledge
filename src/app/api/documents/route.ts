import { NextRequest, NextResponse } from "next/server";
import {
  validateCreateDocumentRequest,
  validateContent,
  validateTitle,
} from "@/server/validators/documentValidators";
import { extractTextFromFile } from "@/server/rag/fileExtractor";
import { ingestDocument } from "@/server/rag/ragService";
import { listDocuments } from "@/server/db/documentRepository";
import { ValidationError, toStatusCode, toUserFacingMessage } from "@/lib/errors";
import { FILE_MAX_SIZE_BYTES } from "@/lib/constants";
import type { CreateDocumentResponse, ListDocumentsResponse } from "@/types/api";
import type { NewDocumentInput } from "@/types/document";

export async function GET() {
  try {
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
    const contentType = request.headers.get("content-type") ?? "";

    const input = contentType.includes("multipart/form-data")
      ? await parseFileUpload(request)
      : validateCreateDocumentRequest(await request.json());

    const result = await ingestDocument(input);

    const response: CreateDocumentResponse = {
      documentId: result.documentId,
      chunksCreated: result.chunksCreated,
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: toUserFacingMessage(error) },
      { status: toStatusCode(error) }
    );
  }
}

async function parseFileUpload(request: NextRequest): Promise<NewDocumentInput> {
  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    throw new ValidationError("A file is required.");
  }

  if (file.size === 0) {
    throw new ValidationError("The uploaded file is empty.");
  }

  if (file.size > FILE_MAX_SIZE_BYTES) {
    throw new ValidationError(
      `File is too large. Maximum size is ${Math.floor(
        FILE_MAX_SIZE_BYTES / (1024 * 1024)
      )}MB.`
    );
  }

  const rawTitle = formData.get("title");
  const title = validateTitle(
    typeof rawTitle === "string" && rawTitle.trim().length > 0
      ? rawTitle
      : deriveTitleFromFilename(file.name)
  );

  const extractedText = await extractTextFromFile(file);
  const content = validateContent(extractedText);

  return { title, content };
}

function deriveTitleFromFilename(filename: string): string {
  const withoutExtension = filename.replace(/\.[^./]+$/, "");
  return withoutExtension.trim().length > 0 ? withoutExtension : filename;
}

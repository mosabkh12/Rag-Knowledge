import { NextRequest, NextResponse } from "next/server";
import { validateCreateDocumentRequest } from "@/server/validators/documentValidators";
import { ingestDocument } from "@/server/rag/ragService";
import { toStatusCode, toUserFacingMessage } from "@/lib/errors";
import type { CreateDocumentResponse } from "@/types/api";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const input = validateCreateDocumentRequest(body);

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

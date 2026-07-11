import { NextResponse } from "next/server";
import { getDocumentById, deleteDocument } from "@/server/db/documentRepository";
import { toStatusCode, toUserFacingMessage } from "@/lib/errors";
import type { DocumentDetailResponse } from "@/types/api";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const document = await getDocumentById(id);

    const response: DocumentDetailResponse = {
      id: document.id,
      title: document.title,
      content: document.content,
      createdAt: document.createdAt,
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: toUserFacingMessage(error) },
      { status: toStatusCode(error) }
    );
  }
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    await deleteDocument(id);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return NextResponse.json(
      { error: toUserFacingMessage(error) },
      { status: toStatusCode(error) }
    );
  }
}

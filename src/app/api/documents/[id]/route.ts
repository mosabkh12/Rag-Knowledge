import { NextResponse } from "next/server";
import { getDocumentById, deleteDocument } from "@/server/db/documentRepository";
import { requireUser } from "@/server/auth/session";
import { AppError, toStatusCode, toUserFacingMessage } from "@/lib/errors";
import type { DocumentDetailResponse } from "@/types/api";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, { params }: RouteParams) {
  try {
    await requireUser();
    const { id } = await params;
    const document = await getDocumentById(id);

    const response: DocumentDetailResponse = {
      id: document.id,
      title: document.title,
      content: document.content,
      createdAt: document.createdAt,
      createdBy: document.createdBy,
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
    const profile = await requireUser();
    const { id } = await params;
    const document = await getDocumentById(id);

    const isOwner = document.createdBy === profile.id;
    if (profile.role !== "admin" && !isOwner) {
      throw new AppError("You can only delete documents you added.", 403);
    }

    await deleteDocument(id);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return NextResponse.json(
      { error: toUserFacingMessage(error) },
      { status: toStatusCode(error) }
    );
  }
}

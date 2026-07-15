import { NextResponse } from "next/server";
import { getDocumentById } from "@/server/db/documentRepository";
import { getSignedDocumentFileUrl } from "@/server/storage/documentFileStorage";
import { requireUser } from "@/server/auth/session";
import { NotFoundError, toStatusCode, toUserFacingMessage } from "@/lib/errors";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * Redirects to a short-lived signed URL for the document's original
 * uploaded file, so it opens/downloads exactly as uploaded (e.g. a PDF
 * renders inline in the browser).
 */
export async function GET(_request: Request, { params }: RouteParams) {
  try {
    await requireUser();
    const { id } = await params;
    const document = await getDocumentById(id);

    if (!document.storagePath) {
      throw new NotFoundError(
        "This document has no original file — it was added by pasting text."
      );
    }

    const signedUrl = await getSignedDocumentFileUrl(document.storagePath);
    return NextResponse.redirect(signedUrl);
  } catch (error) {
    return NextResponse.json(
      { error: toUserFacingMessage(error) },
      { status: toStatusCode(error) }
    );
  }
}

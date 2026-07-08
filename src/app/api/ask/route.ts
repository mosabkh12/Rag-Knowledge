import { NextRequest, NextResponse } from "next/server";
import { validateAskRequest } from "@/server/validators/askValidators";
import { answerQuestion } from "@/server/rag/ragService";
import { toStatusCode, toUserFacingMessage } from "@/lib/errors";
import type { AskResponse } from "@/types/api";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { question, topK } = validateAskRequest(body);

    const result = await answerQuestion(question, topK);

    const response: AskResponse = {
      answer: result.answer,
      sources: result.sources,
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: toUserFacingMessage(error) },
      { status: toStatusCode(error) }
    );
  }
}

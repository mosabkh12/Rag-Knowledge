import "server-only";
import { getOpenAIClient } from "./openaiClient";
import { getServerEnv } from "@/lib/env";
import { DEFAULT_CHAT_MODEL } from "@/lib/constants";
import { AppError } from "@/lib/errors";

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

/**
 * Generates a chat completion for the given messages.
 */
export async function generateChatCompletion(
  messages: ChatMessage[]
): Promise<string> {
  const client = getOpenAIClient();
  const env = getServerEnv();
  const model = env.OPENAI_CHAT_MODEL?.trim() || DEFAULT_CHAT_MODEL;

  try {
    const response = await client.chat.completions.create({
      model,
      messages,
      temperature: 0.2,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new AppError("The AI model returned an empty response.", 502);
    }

    return content.trim();
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError(
      "Failed to generate an answer. Please try again in a moment.",
      502
    );
  }
}

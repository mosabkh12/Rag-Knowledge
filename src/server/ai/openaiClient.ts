import "server-only";
import OpenAI from "openai";
import { getServerEnv } from "@/lib/env";

let cachedClient: OpenAI | undefined;

/**
 * Returns a singleton OpenAI client. This is the only file in the
 * project allowed to read OPENAI_API_KEY or instantiate the OpenAI SDK.
 */
export function getOpenAIClient(): OpenAI {
  if (cachedClient) {
    return cachedClient;
  }

  const env = getServerEnv();
  cachedClient = new OpenAI({ apiKey: env.OPENAI_API_KEY });
  return cachedClient;
}

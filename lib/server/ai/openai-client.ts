import "server-only";

import OpenAI from "openai";

let client: OpenAI | undefined;

export function getOpenAIClient() {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not configured.");
  }

  client ??= new OpenAI({
    apiKey,
    timeout: 15_000,
    maxRetries: 1,
  });

  return client;
}

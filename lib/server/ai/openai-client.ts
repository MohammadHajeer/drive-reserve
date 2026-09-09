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

    // Keep the user from waiting indefinitely if the provider is slow.
    timeout: 15_000,

    // The SDK retries several transient failures by default. For this
    // interactive recommendation form we prefer a predictable upper bound
    // and a graceful fallback instead of silently extending the wait.
    maxRetries: 0,
  });

  return client;
}

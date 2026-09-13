import "server-only";

import Groq from "groq-sdk";

let cachedClient: Groq | null = null;

export function getGroqClient(): Groq {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error("GROQ_API_KEY is not set. Add it to .env.local");
  }
  if (!cachedClient) {
    cachedClient = new Groq({ apiKey });
  }
  return cachedClient;
}

export function getGroqModel(): string {
  return process.env.GROQ_MODEL || "openai/gpt-oss-20b";
}

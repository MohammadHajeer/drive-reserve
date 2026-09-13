import { NextResponse } from "next/server";

import { checkRateLimit, getClientIp } from "@/lib/ai/rate-limit";
import { generateAlternativesBadges, smartAlternativesRequestSchema } from "@/lib/ai/smart-alternatives";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    const rl = checkRateLimit(`smart-alternatives:${ip}`, 10, 60_000);
    if (!rl.allowed) {
      return NextResponse.json(
        { success: false, error: { code: "RATE_LIMITED", message: "Too many AI requests. Please wait a moment." } },
        { status: 429, headers: { "Cache-Control": "no-store", "Retry-After": String(Math.ceil((rl.resetAt - Date.now()) / 1000)) } },
      );
    }
    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json(
        { success: false, error: { code: "AI_NOT_CONFIGURED", message: "Missing GROQ_API_KEY" } },
        { status: 503, headers: { "Cache-Control": "no-store" } },
      );
    }

    const body = await request.json().catch(() => null);
    const parsed = smartAlternativesRequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: { code: "INVALID_INPUT", message: "Invalid request", issues: parsed.error.flatten() } },
        { status: 400, headers: { "Cache-Control": "no-store" } },
      );
    }

    const result = await generateAlternativesBadges(parsed.data);

    return NextResponse.json({ success: true, data: result }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Smart Alternatives error:", error);
    const message = error instanceof Error ? error.message : "AI alternatives failed";
    return NextResponse.json({ success: false, error: { code: "AI_ALTERNATIVES_FAILED", message } }, { status: 500, headers: { "Cache-Control": "no-store" } });
  }
}

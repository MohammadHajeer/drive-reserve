import { NextResponse } from "next/server";

import { generateAlternativesBadges, smartAlternativesRequestSchema } from "@/lib/ai/smart-alternatives";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
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

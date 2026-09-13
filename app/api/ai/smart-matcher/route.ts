import { NextResponse } from "next/server";

import { fetchAvailableCarsForAI } from "@/lib/ai/fetch-available-cars";
import { rankCarsWithGroq, smartMatcherRequestSchema } from "@/lib/ai/smart-matcher";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "AI_NOT_CONFIGURED",
            message: "AI matcher is not configured. Missing GROQ_API_KEY.",
          },
        },
        { status: 503, headers: { "Cache-Control": "no-store" } },
      );
    }

    const body = await request.json().catch(() => null);
    const parsed = smartMatcherRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INVALID_INPUT",
            message: "Invalid request. Provide query (3-500 chars).",
            issues: parsed.error.flatten(),
          },
        },
        { status: 400, headers: { "Cache-Control": "no-store" } },
      );
    }

    const { query } = parsed.data;
    let cars = parsed.data.cars;

  
    if (!cars || cars.length < 6) {
      const fetched = await fetchAvailableCarsForAI(50);
      if (fetched.length > 0) {
        cars = fetched.map((c) => ({
          id: c.id,
          brand: c.brand,
          model: c.model,
          year: c.year,
          category: c.category,
          transmission: c.transmission,
          fuelType: c.fuelType,
          seats: c.seats,
          pricePerDay: c.pricePerDay,
          color: c.color ?? undefined,
        }));
        const result = await rankCarsWithGroq(query, cars);
        const carMap = new Map(fetched.map((c) => [c.id, c]));
        const enriched = result.matches.map((m) => ({
          ...m,
          car: carMap.get(m.id) ?? null,
        }));
        return NextResponse.json(
          { success: true, data: { matches: result.matches, enriched } },
          { headers: { "Cache-Control": "no-store" } },
        );
      }
    }

    const result = await rankCarsWithGroq(query, cars!);

    return NextResponse.json(
      { success: true, data: result },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    console.error("Smart Matcher error:", error);
    const message = error instanceof Error ? error.message : "AI ranking failed";
    return NextResponse.json(
      {
        success: false,
        error: { code: "AI_RANK_FAILED", message },
      },
      { status: 500, headers: { "Cache-Control": "no-store" } },
    );
  }
}

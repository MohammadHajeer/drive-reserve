import "server-only";

import { z } from "zod";

import { getGroqClient, getGroqModel } from "./groq";

export const smartAlternativesRequestSchema = z.object({
  currentCar: z.object({
    id: z.string().uuid(),
    brand: z.string(),
    model: z.string(),
    year: z.number(),
    category: z.string(),
    transmission: z.string(),
    fuelType: z.string(),
    seats: z.number(),
    pricePerDay: z.number(),
  }),
  alternatives: z
    .array(
      z.object({
        id: z.string().uuid(),
        brand: z.string(),
        model: z.string(),
        year: z.number(),
        category: z.string(),
        transmission: z.string(),
        fuelType: z.string(),
        seats: z.number(),
        pricePerDay: z.number(),
      }),
    )
    .min(1)
    .max(3),
});

export type SmartAlternativesRequest = z.infer<typeof smartAlternativesRequestSchema>;

export const smartAlternativesMatchSchema = z.object({
  id: z.string().min(1),
  badge: z.string().min(5).max(140),
});

export const smartAlternativesResponseSchema = z.object({
  badges: z.array(smartAlternativesMatchSchema),
});

export type SmartAlternativesResponse = z.infer<typeof smartAlternativesResponseSchema>;

function buildPrompt(req: SmartAlternativesRequest): { system: string; user: string } {
  const system = [
    "You are an expert car rental comparison assistant for DriveReserve.",
    "Given a current car and 1-3 alternative cars (already filtered by SQL similarity on category), generate a 1-sentence contextual comparison badge for EACH alternative.",
    "Return ONLY valid JSON with shape: {\"badges\": [{\"id\": \"uuid\", \"badge\": \"one sentence\"}]}",
    "Rules:",
    "- Badge must be 1 sentence, max 20 words, specific and helpful, comparing alternative to current car.",
    "- Highlight meaningful differences: transmission (automatic/manual), fuel type, seats, price per day, year, category.",
    "- For price, calculate difference: e.g., '$11 more per day' or '$8 less per day'.",
    "- Phrase clearly for clients: NEVER write 'Automatic hybrid vs manual petrol' — instead write 'Automatic hybrid — $27 more/day than your manual petrol' or 'Switch to automatic hybrid, $27 more/day'.",
    "- Examples (clear phrasing):",
    "  * \"Automatic with 5 seats (your current: 4 seats), $11 more per day — ideal for families.\"",
    "  * \"Hybrid automatic — $15 less per day than your petrol manual, same SUV category.\"",
    "- Keep tone neutral helpful, not salesy. No markdown, no extra text.",
    "- Use ONLY provided IDs, one badge per alternative, ordered as given.",
    "- Output JSON only.",
  ].join("\n");

  const current = req.currentCar;
  const alts = req.alternatives
    .map(
      (a) =>
        `- id:${a.id} | ${a.brand} ${a.model} (${a.year}) | ${a.category} | ${a.transmission} | ${a.fuelType} | ${a.seats} seats | $${a.pricePerDay}/day`,
    )
    .join("\n");

  const user = `Current car: ${current.brand} ${current.model} (${current.year}) | ${current.category} | ${current.transmission} | ${current.fuelType} | ${current.seats} seats | $${current.pricePerDay}/day\n\nAlternatives:\n${alts}\n\nReturn JSON now.`;

  return { system, user };
}

export async function generateAlternativesBadges(req: SmartAlternativesRequest): Promise<SmartAlternativesResponse> {
  const groq = getGroqClient();
  const model = getGroqModel();
  const { system, user } = buildPrompt(req);

  let raw = "";
  let lastErr: unknown = null;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const useJsonMode = attempt === 0;
      const completion = await groq.chat.completions.create({
        model,
        temperature: 0.3,
        max_tokens: 1000,
        ...(useJsonMode ? { response_format: { type: "json_object" as const } } : {}),
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
      });
      raw = completion.choices[0]?.message?.content ?? "";
      if (!raw) throw new Error("Empty response from Groq");
      lastErr = null;
      break;
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      const isJsonFail = msg.includes("json_validate_failed") || msg.includes("Failed to validate JSON");
      lastErr = e;
      console.warn(`Smart Alternatives Groq attempt ${attempt + 1} failed:`, msg);
      if (!isJsonFail || attempt === 2) {
        // Fallback deterministic badges
        console.warn("Using deterministic fallback for alternatives");
        const fallback: SmartAlternativesResponse = {
          badges: req.alternatives.map((alt) => {
            const priceDiff = alt.pricePerDay - req.currentCar.pricePerDay;
            const priceStr = priceDiff === 0 ? "same price as your current" : priceDiff > 0 ? `$${priceDiff} more per day than your current` : `$${Math.abs(priceDiff)} less per day than your current`;
            const transPart = alt.transmission !== req.currentCar.transmission ? `Switch to ${alt.transmission.toLowerCase()} (your current: ${req.currentCar.transmission.toLowerCase()})` : alt.transmission;
            const fuelPart = alt.fuelType !== req.currentCar.fuelType ? ` ${alt.fuelType.toLowerCase()} fuel` : "";
            const seatsPart = alt.seats !== req.currentCar.seats ? `${alt.seats} seats` : `same ${alt.seats} seats`;
            return {
              id: alt.id,
              badge: `${transPart}${fuelPart} — ${seatsPart}, ${priceStr} — ${alt.year} model.`,
            };
          }),
        };
        raw = JSON.stringify(fallback);
        lastErr = null;
        break;
      }
      await new Promise((r) => setTimeout(r, 300 * (attempt + 1)));
    }
  }
  if (lastErr) throw lastErr as Error;
  if (!raw) throw new Error("Empty response after retries");

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    const match = raw.match(/\{[\s\S]*\}/);
    if (!match) {
      // Fallback
      const fallback: SmartAlternativesResponse = {
        badges: req.alternatives.map((alt) => ({
          id: alt.id,
          badge: `${alt.transmission} ${alt.category}, ${alt.seats} seats at $${alt.pricePerDay}/day`,
        })),
      };
      return fallback;
    }
    try {
      parsed = JSON.parse(match[0]);
    } catch {
      const repaired = match[0].replace(/,\s*([}\]])/g, "$1");
      parsed = JSON.parse(repaired);
    }
  }

  // Try to handle case where model returns {matches: ...} instead of {badges: ...}
  if (parsed && typeof parsed === "object" && "matches" in (parsed as Record<string, unknown>)) {
    const m = (parsed as { matches: unknown[] }).matches;
    if (Array.isArray(m)) {
      parsed = { badges: m.map((x: unknown) => {
        const o = x as Record<string, unknown>;
        return { id: o.id, badge: o.snippet || o.badge || o.reason || "" };
      })};
    }
  }

  const validated = smartAlternativesResponseSchema.safeParse(parsed);
  if (validated.success) {
    // Ensure all alternatives have a badge, fill missing
    const byId = new Map(validated.data.badges.map((b) => [b.id, b]));
    const normalized = req.alternatives.map((alt) => {
      const found = byId.get(alt.id);
      if (found) return found;
      return { id: alt.id, badge: `${alt.transmission} ${alt.category}, ${alt.seats} seats at $${alt.pricePerDay}/day` };
    });
    return { badges: normalized };
  }

  // Fallback if validation fails
  console.warn("Smart Alternatives validation failed, using fallback", validated.error);
  return {
    badges: req.alternatives.map((alt) => ({
      id: alt.id,
      badge: `${alt.transmission} ${alt.category}, ${alt.seats} seats at $${alt.pricePerDay}/day`,
    })),
  };
}

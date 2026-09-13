import "server-only";

import { z } from "zod";

import { getGroqClient, getGroqModel } from "./groq";

// Input validation — cars optional: if not supplied, server fetches full available catalog
export const smartMatcherRequestSchema = z.object({
  query: z.string().trim().min(3).max(500),
  cars: z
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
        color: z.string().optional(),
      }),
    )
    .min(1)
    .max(50)
    .optional(),
});

export type SmartMatcherRequest = z.infer<typeof smartMatcherRequestSchema>;

export const smartMatcherMatchSchema = z.object({
  id: z.string().uuid(),
  score: z.number().min(0).max(1),
  snippet: z.string().min(1).max(140),
  rank: z.number().int().min(1).optional(),
});

export const smartMatcherResponseSchema = z.object({
  matches: z.array(smartMatcherMatchSchema),
});

export type SmartMatcherMatch = z.infer<typeof smartMatcherMatchSchema>;
export type SmartMatcherResponse = z.infer<typeof smartMatcherResponseSchema>;

function buildPrompt(query: string, cars: NonNullable<SmartMatcherRequest["cars"]>): { system: string; user: string } {
  const system = [
    "You are an expert car rental matcher for DriveReserve.",
    "Rank the given available cars by how well they match the user's natural-language travel need.",
    "Consider: brand, model, category, transmission, fuel type, seats, price per day, year, and implied budget/use-case.",
    "Return ONLY valid JSON with shape: {\"matches\": [{\"id\": \"uuid\", \"score\": 0.0-1.0, \"snippet\": \"one sentence tailored explanation, max 20 words\"}]}",
    "Rules:",
    "- matches must be sorted descending by score (best first), one entry per car, include ALL cars.",
    "- score 1.0 = perfect match, 0.0 = no match. Use full range: 0.85+ excellent, 0.6-0.84 good, 0.3-0.59 weak, <0.3 poor.",
    "- CRITICAL CATEGORY RULE: If the user explicitly names a category (sedan, suv, hatchback, coupe, compact, economy, luxury, electric, etc.), any car whose category does NOT contain that keyword must score ≤0.25 and be treated as poor match. Example: query contains 'sedan' → hatchback/suv must be ≤0.25.",
    "- CRITICAL BRAND/MODEL RULE: If the user explicitly names a brand or model (e.g., 'hyundai', 'toyota corolla', 'tucson'), any car whose brand/model does NOT match must score ≤0.25. Brand/model is an exact filter, not a ranking preference.",
    "- CRITICAL FUEL/TRANSMISSION RULE: If the user explicitly names fuel (petrol, diesel, hybrid, electric) or transmission (automatic, manual), any car with different fuel/transmission must score ≤0.25. Fuel and transmission are exact filters.",
    "- CRITICAL PRICE/SEATS/SORT RULE: If the user says 'low to high price' sort by price asc, 'high to low price' price desc, 'alphabetical' brand asc, 'newest' newest, 'year' year desc. If user says 'under $50' or 'max 80' filter price ≤ that. If user says '4 passengers' or '5 seats' require seats ≥ that. Apply these as ranking preferences, not strict filters unless number is explicit.",
    "- snippet for high scores (≥0.5): positive and specific (e.g., 'Automatic sedan with 5 seats for 4 passengers, $38/day keeps you under budget').",
    "- snippet for low scores (<0.3): brief neutral alternative note, never negative/sarcastic (e.g., 'Hatchback alternative — 5 seats automatic but not a sedan'). Avoid phrases like 'not a sedan.' alone; frame as alternative.",
    "- Be helpful, not dismissive. Compare price/features when relevant.",
    "- Do NOT invent cars, only use provided IDs.",
    "- Output JSON only, no markdown, no extra text.",
  ].join("\n");

  const carList = cars
    .map(
      (c) =>
        `- id:${c.id} | ${c.brand} ${c.model} (${c.year}) | category:${c.category} | trans:${c.transmission} | fuel:${c.fuelType} | seats:${c.seats} | $${c.pricePerDay}/day | color:${c.color ?? "n/a"}`,
    )
    .join("\n");

  const user = `User need: "${query}"\n\nAvailable cars:\n${carList}\n\nReturn JSON now.`;

  return { system, user };
}

export async function rankCarsWithGroq(
  query: string,
  cars: NonNullable<SmartMatcherRequest["cars"]>,
): Promise<SmartMatcherResponse> {
  const groq = getGroqClient();
  const model = getGroqModel();
  const { system, user } = buildPrompt(query, cars);

  // Groq intermittently fails JSON validation (400 json_validate_failed) — retry automatically, fallback to deterministic ranking
  let raw = "";
  let lastErr: unknown = null;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const useJsonMode = attempt === 0; // first try with strict json_object, fallback to free-form on retry
      const completion = await groq.chat.completions.create({
        model,
        temperature: 0.2,
        max_tokens: 2000,
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
      const code = (e as { code?: string })?.code ?? "";
      const isJsonFail = msg.includes("json_validate_failed") || msg.includes("Failed to validate JSON") || code === "json_validate_failed";
      lastErr = e;
      console.warn(`Groq attempt ${attempt + 1} failed (${isJsonFail ? "json_validate_failed" : "other"}):`, msg);
      if (!isJsonFail || attempt === 2) {
        // Final failure: deterministic fallback so user never sees 400
        console.warn("Groq failed after retries — using deterministic fallback ranking");
        const fallback: SmartMatcherResponse = {
          matches: cars.map((car, idx) => ({
            id: car.id,
            score: 0.6 - idx * 0.02, // simple ranked fallback
            snippet: `${car.brand} ${car.model} — ${car.category}, ${car.transmission.toLowerCase()}, ${car.seats} seats at $${car.pricePerDay}/day`,
            rank: idx + 1,
          })),
        };
        // Apply same deterministic strict logic as below before return? Let it fall through to post-processing
        // Return fallback directly (will be post-processed for strict caps/boosts)
        let fbRaw: unknown = fallback;
        // Skip JSON parsing, go directly to validation/normalization
        const validatedFb = smartMatcherResponseSchema.parse(fbRaw);
        const byIdFb = new Map(validatedFb.matches.map((m) => [m.id, m]));
        const normalizedFb: SmartMatcherMatch[] = cars.map((car, idx) => {
          const m = byIdFb.get(car.id);
          if (m) return { ...m, rank: idx + 1 };
          return { id: car.id, score: 0, snippet: `Available ${car.category} option at $${car.pricePerDay}/day`, rank: idx + 1 };
        });
        // Reuse post-processing below — duplicate logic, so throw and let caller handle fallback? Simpler: return early with fallback post-processed
        // To avoid duplication, just set raw to JSON string of fallback and continue to normal parsing
        raw = JSON.stringify(fallback);
        lastErr = null;
        break;
      }
      await new Promise((r) => setTimeout(r, 300 * (attempt + 1)));
    }
  }
  if (lastErr) throw lastErr as Error;
  if (!raw) throw new Error("Empty response from Groq after retries");

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch (e) {
    // Try to extract and repair JSON — handles truncated/malformed arrays (Expected ',' or ']' at position 530)
    const msg = e instanceof Error ? e.message : String(e);
    console.warn("Groq JSON parse failed, attempting repair:", msg, raw.slice(0, 200));
    // Try bracket extraction
    const match = raw.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        parsed = JSON.parse(match[0]);
      } catch {
        // Try to repair: remove trailing commas, fix missing brackets
        const repaired = match[0].replace(/,\s*([}\]])/g, "$1").replace(/'/g, '"');
        try {
          parsed = JSON.parse(repaired);
        } catch {
          // Final fallback: deterministic ranking instead of throwing to user
          console.warn("Groq JSON unrepairable — using deterministic fallback");
          const fallback: SmartMatcherResponse = {
            matches: cars.map((car, idx) => ({
              id: car.id,
              score: 0.6 - idx * 0.02,
              snippet: `${car.brand} ${car.model} — ${car.category}, ${car.transmission.toLowerCase()}, ${car.seats} seats at $${car.pricePerDay}/day`,
              rank: idx + 1,
            })),
          };
          parsed = fallback;
        }
      }
    } else {
      console.warn("No JSON object found in Groq output — using fallback");
      const fallback: SmartMatcherResponse = {
        matches: cars.map((car, idx) => ({
          id: car.id,
          score: 0.6 - idx * 0.02,
          snippet: `${car.brand} ${car.model} — ${car.category}, ${car.transmission.toLowerCase()}, ${car.seats} seats at $${car.pricePerDay}/day`,
          rank: idx + 1,
        })),
      };
      parsed = fallback;
    }
  }

  const validated = smartMatcherResponseSchema.parse(parsed);

  // Ensure all cars are represented and normalized
  const byId = new Map(validated.matches.map((m) => [m.id, m]));
  const normalized: SmartMatcherMatch[] = cars.map((car, idx) => {
    const m = byId.get(car.id);
    if (m) return { ...m, rank: idx + 1 };
    // fallback for missing ids
    return {
      id: car.id,
      score: 0,
      snippet: `Available ${car.category} option at $${car.pricePerDay}/day`,
      rank: idx + 1,
    };
  });

  // Deterministic strict enforcement: category AND brand/model, with fuelType awareness for electric
  const qLower = query.toLowerCase();
  const knownCats = ["economy", "sedan", "suv", "luxury", "electric", "hatchback", "compact", "coupe"];
  const requestedCats = knownCats.filter((c) => qLower.includes(c) || qLower.includes(c + "s"));
  if (requestedCats.length > 0) {
    for (const m of normalized) {
      const car = cars!.find((c) => c.id === m.id);
      if (!car) continue;
      const carCat = car.category.toLowerCase();
      const carFuel = car.fuelType.toLowerCase();
      const matchesRequested = requestedCats.some((r) => {
        if (r === "electric") return carCat.includes("electric") || carFuel === "electric";
        return carCat.includes(r);
      });
      if (!matchesRequested && m.score > 0.25) {
        m.score = 0.25;
        m.snippet = `${car.category} alternative — not a ${requestedCats[0]}`;
      }
      // Boost electric fuel cars for electric queries that were scored low due to category mismatch (Tesla Model 3 is sedan + electric)
      if (requestedCats.includes("electric") && carFuel === "electric" && m.score < 0.8) {
        m.score = 0.85;
        m.snippet = `Electric ${car.brand} ${car.model} — ${car.fuelType} power, ${car.seats} seats, $${car.pricePerDay}/day`;
      }
    }
  }
  // Brand/model strict: typo-tolerant (hyunda→hyundai) — prefix + 1-char edit distance, no single-letter false positives
  function lev(a: string, b: string): number {
    if (a === b) return 0;
    if (Math.abs(a.length - b.length) > 1) return 2;
    let i = 0, j = 0, d = 0;
    while (i < a.length && j < b.length) {
      if (a[i] === b[j]) { i++; j++; } else { d++; if (d > 1) return d; if (a.length === b.length) { i++; j++; } else if (a.length > b.length) i++; else j++; }
    }
    d += a.length - i + b.length - j;
    return d;
  }
  const brandsInPage = [...new Set(cars!.map((c) => c.brand.toLowerCase()))];
  const modelsInPage = [...new Set(cars!.map((c) => c.model.toLowerCase()))];
  const qWords = qLower.split(/[\s,\-_]+/).filter(Boolean);
  const requestedBrands = brandsInPage.filter((b) => {
    if (qLower.includes(b)) return true;
    const parts = b.split(/[\s\-_]+/).filter(Boolean);
    return parts.some((p) => qWords.some((w) => w.length >= 3 && (p === w || p.startsWith(w) || w.startsWith(p) || lev(p, w) <= 1)));
  });
  const requestedModels = modelsInPage.filter((m) => {
    if (qLower.includes(m)) return true;
    const parts = m.split(/[\s\-_]+/).filter(Boolean);
    return parts.some((p) => p.length >= 2 && qWords.some((w) => w.length >= 2 && (p === w || p.startsWith(w) || w.startsWith(p) || lev(p, w) <= 1))) || qWords.includes(m);
  });
  const hasBrandOrModel = requestedBrands.length > 0 || requestedModels.length > 0;
  if (hasBrandOrModel) {
    for (const m of normalized) {
      const car = cars!.find((c) => c.id === m.id);
      if (!car) continue;
      const brandMatch =
        requestedBrands.length === 0 || requestedBrands.some((b) => car.brand.toLowerCase().includes(b));
      const modelMatch =
        requestedModels.length === 0 || requestedModels.some((mo) => car.model.toLowerCase().includes(mo));
      if ((!brandMatch || !modelMatch) && m.score > 0.25) {
        m.score = 0.25;
        const wanted = [...requestedBrands, ...requestedModels].join(" ") || "requested";
        m.snippet = `${car.brand} ${car.model} alternative — not ${wanted}`;
      }
    }
  }
  // Fuel/transmission strict: typo-tolerant for petrol/diesel/hybrid/electric, automatic/manual
  const knownFuels = ["petrol", "diesel", "hybrid", "electric"];
  const knownTrans = ["automatic", "manual"];
  const requestedFuels = knownFuels.filter((f) => {
    if (qLower.includes(f)) return true;
    return qWords.some((w) => w.length >= 3 && (w === f || lev(w, f) <= 1 || (f === "diesel" && (w === "diesil" || w === "deasel"))));
  });
  // Extra: handle common typo diesil
  const hasDiesilTypo = qWords.some((w) => w === "diesil" || w === "deasel" || lev(w, "diesel") <= 1);
  const finalFuels = hasDiesilTypo && !requestedFuels.includes("diesel") ? [...requestedFuels, "diesel"] : requestedFuels;
  const requestedTrans = knownTrans.filter((t) => qLower.includes(t) || qWords.some((w) => w.length >= 3 && (w === t || lev(w, t) <= 1)));
  if (finalFuels.length > 0) {
    for (const m of normalized) {
      const car = cars!.find((c) => c.id === m.id);
      if (!car) continue;
      if (!finalFuels.includes(car.fuelType.toLowerCase()) && m.score > 0.25) {
        m.score = 0.25;
        m.snippet = `${car.fuelType} alternative — not ${finalFuels[0]}`;
      }
    }
  }
  if (requestedTrans.length > 0) {
    for (const m of normalized) {
      const car = cars!.find((c) => c.id === m.id);
      if (!car) continue;
      if (!requestedTrans.includes(car.transmission.toLowerCase()) && m.score > 0.25) {
        m.score = 0.25;
        m.snippet = `${car.transmission} alternative — not ${requestedTrans[0]}`;
      }
    }
  }
  // Price/seats strict: maxPrice, seats ≥ requested (fuel consumption queries like "low to high fuel consumption" don't trigger price sort)
  const priceMatch = qLower.match(/(?:under|below|max|up to|less than|budget)\s*\$?\s*(\d{2,3})/);
  const maxPrice = priceMatch ? Number(priceMatch[1]) : undefined;
  if (maxPrice !== undefined && Number.isFinite(maxPrice)) {
    for (const m of normalized) {
      const car = cars!.find((c) => c.id === m.id);
      if (!car) continue;
      if (car.pricePerDay > maxPrice && m.score > 0.25) {
        m.score = 0.25;
        m.snippet = `$${car.pricePerDay}/day exceeds $${maxPrice} budget`;
      }
    }
  }
  const seatMatch = qLower.match(/(\d+)\s*(?:seat|passenger|people)/);
  const requestedSeats = seatMatch ? Number(seatMatch[1]) : undefined;
  if (requestedSeats !== undefined && Number.isFinite(requestedSeats)) {
    for (const m of normalized) {
      const car = cars!.find((c) => c.id === m.id);
      if (!car) continue;
      if (car.seats < requestedSeats && m.score > 0.25) {
        m.score = 0.25;
        m.snippet = `${car.seats} seats — need ${requestedSeats}`;
      }
    }
  }

  // Sort by score desc, fill rank (sort hints like "low to high price" are handled client-side for strict ordering)
  normalized.sort((a, b) => b.score - a.score);
  normalized.forEach((m, i) => (m.rank = i + 1));

  return { matches: normalized };
}

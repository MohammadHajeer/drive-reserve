import OpenAI from "openai";

import type { AiCarRecommendationView } from "@/lib/ai/car-recommendations";
import { getAiCarCandidates } from "@/lib/server/ai/get-ai-car-candidates";
import { checkAiCarRecommendationRateLimit } from "@/lib/server/ai/ai-rate-limit";
import { recommendCarsWithOpenAI } from "@/lib/server/ai/recommend-cars-with-openai";
import {
  aiCarFinderSchema,
  type AiCarFinderFormValues,
} from "@/lib/validations/ai-car-finder";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const encoder = new TextEncoder();

type StreamController = ReadableStreamDefaultController<Uint8Array>;
type FieldErrors = Partial<Record<keyof AiCarFinderFormValues, string>>;

function writeEvent(
  controller: StreamController,
  event: string,
  data: unknown,
) {
  controller.enqueue(
    encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`),
  );
}

function toFieldErrors(
  issues: { path: PropertyKey[]; message: string }[],
): FieldErrors {
  const fieldErrors: FieldErrors = {};

  for (const issue of issues) {
    const field = issue.path[0];

    if (typeof field !== "string" || field in fieldErrors) continue;

    fieldErrors[field as keyof AiCarFinderFormValues] = issue.message;
  }

  return fieldErrors;
}

function getFriendlyAiFailureMessage(error: unknown) {
  if (error instanceof OpenAI.APIConnectionTimeoutError) {
    return "The AI service took too long to respond. Please try again.";
  }

  if (error instanceof OpenAI.RateLimitError) {
    return "The AI service is temporarily busy. Please try again shortly.";
  }

  if (error instanceof OpenAI.APIConnectionError) {
    return "We couldn't reach the AI service. Please check your connection and try again.";
  }

  if (error instanceof OpenAI.AuthenticationError) {
    return "AI recommendations are temporarily unavailable.";
  }

  if (error instanceof OpenAI.APIError) {
    return "The AI service couldn't complete the recommendation. Please try again shortly.";
  }

  return "We couldn't generate AI recommendations right now. Please try again shortly.";
}

function toRecommendationViews(
  recommendations: Awaited<ReturnType<typeof recommendCarsWithOpenAI>>,
): AiCarRecommendationView[] {
  return recommendations.map(({ car, label, reason }) => ({
    car: {
      id: car.id,
      brand: car.brand,
      model: car.model,
      category: car.category,
      pricePerDay: car.pricePerDay,
      seats: car.seats,
      transmission: car.transmission,
      fuelType: car.fuelType,
      year: car.year,
      primaryImageUrl: car.primaryImageUrl,
    },
    label,
    reason,
  }));
}

export async function POST(request: Request) {
  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      void runRecommendationStream(request, controller);
    },
  });

  return new Response(stream, {
    status: 200,
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      "X-Accel-Buffering": "no",
    },
  });
}

async function runRecommendationStream(
  request: Request,
  controller: StreamController,
) {
  try {
    // A comment frame helps establish the SSE stream immediately.
    controller.enqueue(encoder.encode(": connected\n\n"));

    writeEvent(controller, "status", {
      step: "validating",
      message: "Validating your trip details",
    });

    let input: unknown;

    try {
      input = await request.json();
    } catch {
      writeEvent(controller, "validation_error", {
        message: "Please review the trip details and try again.",
        fieldErrors: {},
      });
      return;
    }

    const parsed = aiCarFinderSchema.safeParse(input);

    if (!parsed.success) {
      writeEvent(controller, "validation_error", {
        message: "Please review the trip details and try again.",
        fieldErrors: toFieldErrors(parsed.error.issues),
      });
      return;
    }

    const rateLimit = await checkAiCarRecommendationRateLimit(request.headers);

    if (!rateLimit.allowed) {
      writeEvent(controller, "error", {
        message: `You've made several recommendation requests. Please wait ${rateLimit.retryAfterSeconds} seconds and try again.`,
      });
      return;
    }

    writeEvent(controller, "status", {
      step: "finding-cars",
      message: "Finding vehicles available for your dates",
    });

    const candidates = await getAiCarCandidates(parsed.data);

    if (candidates.length === 0) {
      writeEvent(controller, "error", {
        message:
          "No vehicles match those dates and preferences. Try increasing the budget or relaxing a preference.",
      });
      return;
    }

    writeEvent(controller, "status", {
      step: "comparing",
      message: `Comparing ${candidates.length} ${
        candidates.length === 1 ? "matching vehicle" : "matching vehicles"
      }`,
    });

    const recommendations = await recommendCarsWithOpenAI(
      parsed.data,
      candidates,
    );

    if (recommendations.length === 0) {
      writeEvent(controller, "error", {
        message:
          "We couldn't produce a recommendation from the matching vehicles. Please try again.",
      });
      return;
    }

    writeEvent(controller, "status", {
      step: "preparing",
      message: "Preparing your recommendations",
    });

    const viewRecommendations = toRecommendationViews(recommendations);

    writeEvent(controller, "complete", {
      message: `Generated ${viewRecommendations.length} ${
        viewRecommendations.length === 1
          ? "recommendation"
          : "recommendations"
      } for your trip.`,
      recommendations: viewRecommendations,
    });
  } catch (error) {
    console.error("AI car recommendation stream failed:", error);

    writeEvent(controller, "error", {
      message: getFriendlyAiFailureMessage(error),
    });
  } finally {
    controller.close();
  }
}

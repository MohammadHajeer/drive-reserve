"use server";

import OpenAI from "openai";

import { getAiCarCandidates } from "@/lib/server/ai/get-ai-car-candidates";
import { checkAiCarRecommendationRateLimit } from "@/lib/server/ai/ai-rate-limit";
import { recommendCarsWithOpenAI } from "@/lib/server/ai/recommend-cars-with-openai";
import {
  aiCarFinderSchema,
  type AiCarFinderFormValues,
} from "@/lib/validations/ai-car-finder";

type FieldErrors = Partial<Record<keyof AiCarFinderFormValues, string>>;

export type AiCarRecommendationView = {
  car: {
    id: string;
    brand: string;
    model: string;
    category: string;
    pricePerDay: number;
    seats: number;
    transmission: string;
    fuelType: string;
    year: number;
    primaryImageUrl: string | null;
  };
  label:
    | "Best overall match"
    | "Best value"
    | "Best for comfort"
    | "Best for fuel efficiency"
    | "Best newer option";
  reason: string;
};

export type AiCarRecommendationActionResult =
  | {
      success: true;
      message: string;
      data: {
        recommendations: AiCarRecommendationView[];
      };
    }
  | {
      success: false;
      message: string;
      fieldErrors?: FieldErrors;
    };

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

export async function requestAiCarRecommendations(
  input: unknown,
): Promise<AiCarRecommendationActionResult> {
  const parsed = aiCarFinderSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      message: "Please review the trip details and try again.",
      fieldErrors: toFieldErrors(parsed.error.issues),
    };
  }

  const rateLimit = await checkAiCarRecommendationRateLimit();

  if (!rateLimit.allowed) {
    return {
      success: false,
      message: `You've made several recommendation requests. Please wait ${rateLimit.retryAfterSeconds} seconds and try again.`,
    };
  }

  try {
    const candidates = await getAiCarCandidates(parsed.data);

    if (candidates.length === 0) {
      return {
        success: false,
        message:
          "No vehicles match those dates and preferences. Try increasing the budget or relaxing a preference.",
      };
    }

    const recommendations = await recommendCarsWithOpenAI(
      parsed.data,
      candidates,
    );

    if (recommendations.length === 0) {
      return {
        success: false,
        message:
          "We couldn't produce a recommendation from the matching vehicles. Please try again.",
      };
    }

    const viewRecommendations: AiCarRecommendationView[] =
      recommendations.map(({ car, label, reason }) => ({
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

    return {
      success: true,
      message: `Generated ${viewRecommendations.length} ${
        viewRecommendations.length === 1
          ? "recommendation"
          : "recommendations"
      } for your trip.`,
      data: {
        recommendations: viewRecommendations,
      },
    };
  } catch (error) {
    console.error("AI car recommendation failed:", error);

    return {
      success: false,
      message: getFriendlyAiFailureMessage(error),
    };
  }
}

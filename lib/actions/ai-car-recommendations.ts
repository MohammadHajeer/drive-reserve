"use server";

import { getAiCarCandidates } from "@/lib/server/ai/get-ai-car-candidates";
import {
  recommendCarsWithOpenAI,
  type AiCarRecommendation,
} from "@/lib/server/ai/recommend-cars-with-openai";
import {
  aiCarFinderSchema,
  type AiCarFinderFormValues,
} from "@/lib/validations/ai-car-finder";

type FieldErrors = Partial<Record<keyof AiCarFinderFormValues, string>>;

export type AiCarRecommendationActionResult =
  | {
      success: true;
      message: string;
      data: {
        recommendations: AiCarRecommendation[];
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

export async function requestAiCarRecommendations(
  input: unknown,
): Promise<AiCarRecommendationActionResult> {
  // Browser validation is UX only. Treat every Server Action argument as
  // untrusted and validate it again before database or AI usage.
  const parsed = aiCarFinderSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      message: "Please review the trip details and try again.",
      fieldErrors: toFieldErrors(parsed.error.issues),
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

    return {
      success: true,
      message: `Generated ${recommendations.length} ${
        recommendations.length === 1 ? "recommendation" : "recommendations"
      } for your trip.`,
      data: {
        recommendations,
      },
    };
  } catch (error) {
    console.error("AI car recommendation failed:", error);

    return {
      success: false,
      message:
        "We couldn't generate AI recommendations right now. Please try again shortly.",
    };
  }
}

"use server";

import { getAiCarCandidates } from "@/lib/server/ai/get-ai-car-candidates";
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
        candidateCount: number;
        candidates: Awaited<ReturnType<typeof getAiCarCandidates>>;
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
  // Client-side validation is only UX. Server Actions are callable from the
  // client, so validate every value again before touching the database.
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

    return {
      success: true,
      message: `Found ${candidates.length} ${
        candidates.length === 1 ? "matching vehicle" : "matching vehicles"
      } for your trip.`,
      data: {
        candidateCount: candidates.length,
        candidates,
      },
    };
  } catch (error) {
    console.error("AI car candidate filtering failed:", error);

    return {
      success: false,
      message:
        "Unable to check matching vehicles right now. Please try again.",
    };
  }
}

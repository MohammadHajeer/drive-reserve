import { NextResponse } from "next/server";

import {
  previewReservation,
  ReservationPreviewValidationError,
} from "@/lib/server/reservations/preview-reservation";
import { reservationPreviewSchema } from "@/lib/validations/reservation.validation";

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INVALID_JSON",
          message: "The request body must contain valid JSON.",
        },
      },
      { status: 400 },
    );
  }

  const parsed = reservationPreviewSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Please check the selected reservation dates.",
          fieldErrors: parsed.error.flatten().fieldErrors,
        },
      },
      { status: 400 },
    );
  }

  try {
    const preview = await previewReservation(parsed.data);

    if (preview.unavailableReason === "CAR_NOT_FOUND") {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "CAR_NOT_FOUND",
            message: "The requested car could not be found.",
          },
        },
        {
          status: 404,
          headers: {
            "Cache-Control": "private, no-store",
          },
        },
      );
    }

    const message = preview.available
      ? "The car is available for the selected dates."
      : preview.unavailableReason === "CAR_NOT_AVAILABLE"
        ? "This car is currently unavailable for reservations."
        : "This car is already reserved during the selected dates.";

    return NextResponse.json(
      {
        success: true,
        data: preview,
        message,
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "private, no-store",
        },
      },
    );
  } catch (error) {
    if (error instanceof ReservationPreviewValidationError) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: error.code,
            message: error.message,
          },
        },
        {
          status: 400,
          headers: {
            "Cache-Control": "private, no-store",
          },
        },
      );
    }

    console.error("Reservation preview route error:", error);

    return NextResponse.json(
      {
        success: false,
        error: {
          code: "PREVIEW_FAILED",
          message:
            "Unable to check availability at the moment. Please try again.",
        },
      },
      { status: 500 },
    );
  }
}

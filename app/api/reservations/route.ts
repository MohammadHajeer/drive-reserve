import { NextResponse } from "next/server";

import { getAppRole } from "@/lib/supabase/route-access";
import { createClient } from "@/lib/supabase/server";
import { reservationPreviewSchema } from "@/lib/validations/reservation.validation";

type ReservationRpcError = {
  code: string;
  message: string;
  status: number;
};

const noStoreHeaders = {
  "Cache-Control": "private, no-store",
};

function errorResponse(error: ReservationRpcError) {
  return NextResponse.json(
    {
      success: false,
      error: {
        code: error.code,
        message: error.message,
      },
    },
    {
      status: error.status,
      headers: noStoreHeaders,
    },
  );
}

function mapReservationRpcError(message: string): ReservationRpcError {
  if (message.includes("Authentication is required")) {
    return {
      code: "UNAUTHENTICATED",
      message: "Authentication is required.",
      status: 401,
    };
  }

  if (message.includes("Only customers can create reservations")) {
    return {
      code: "FORBIDDEN",
      message: "Customer access is required.",
      status: 403,
    };
  }

  if (message.includes("Pickup date cannot be in the past")) {
    return {
      code: "PICKUP_DATE_IN_PAST",
      message: "Pickup date cannot be in the past.",
      status: 400,
    };
  }

  if (message.includes("Return date must be after pickup date")) {
    return {
      code: "INVALID_RENTAL_DATES",
      message: "Return date must be after the pickup date.",
      status: 400,
    };
  }

  if (
    message.includes(
      "Reservations cannot be created more than 180 days in advance",
    )
  ) {
    return {
      code: "BOOKING_HORIZON_EXCEEDED",
      message: "Reservations cannot be created more than 180 days in advance.",
      status: 400,
    };
  }

  if (message.includes("A reservation cannot exceed 30 rental days")) {
    return {
      code: "RENTAL_PERIOD_TOO_LONG",
      message: "A reservation cannot exceed 30 rental days.",
      status: 400,
    };
  }

  if (message.includes("You can have at most 5 upcoming reservations")) {
    return {
      code: "MAXIMUM_UPCOMING_RESERVATIONS_REACHED",
      message:
        "Maximum upcoming reservations reached. You can have at most 5 upcoming reservations.",
      status: 409,
    };
  }

  if (message.includes("You can have at most 2 concurrent reservations")) {
    return {
      code: "MAXIMUM_CONCURRENT_RESERVATIONS_REACHED",
      message:
        "Maximum concurrent reservations reached. Please choose dates that do not exceed your reservation limit.",
      status: 409,
    };
  }

  if (
    message.includes("The selected car was just reserved for these dates")
  ) {
    return {
      code: "DATES_JUST_RESERVED",
      message:
        "Those dates were just reserved by another customer. Please choose a different range.",
      status: 409,
    };
  }

  if (
    message.includes("The selected car is unavailable for these dates")
  ) {
    return {
      code: "DATES_UNAVAILABLE",
      message:
        "Those dates overlap an existing reservation or are no longer available. Please choose a different range.",
      status: 409,
    };
  }

  if (
    message.includes("The selected car is unavailable or does not exist")
  ) {
    return {
      code: "CAR_UNAVAILABLE",
      message: "The selected car is unavailable or could not be found.",
      status: 409,
    };
  }

  return {
    code: "RESERVATION_CREATE_FAILED",
    message:
      "An unexpected database failure occurred. Please try again later.",
    status: 500,
  };
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: claimsData, error: claimsError } =
      await supabase.auth.getClaims();
    const claims = claimsData?.claims as Record<string, unknown> | undefined;

    if (claimsError || typeof claims?.sub !== "string") {
      return errorResponse({
        code: "UNAUTHENTICATED",
        message: "Authentication is required.",
        status: 401,
      });
    }

    if (getAppRole(claims) !== "customer") {
      return errorResponse({
        code: "FORBIDDEN",
        message: "Customer access is required.",
        status: 403,
      });
    }

    let body: unknown;

    try {
      body = await request.json();
    } catch {
      return errorResponse({
        code: "INVALID_JSON",
        message: "The request body must contain valid JSON.",
        status: 400,
      });
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
        {
          status: 400,
          headers: noStoreHeaders,
        },
      );
    }

    const { data: reservation, error } = await supabase.rpc(
      "create_reservation",
      {
        p_car_id: parsed.data.carId,
        p_pickup_date: parsed.data.pickupDate,
        p_return_date: parsed.data.returnDate,
      },
    );

    if (error) {
      console.error("Create reservation RPC error:", error);
      return errorResponse(mapReservationRpcError(error.message));
    }

    if (!reservation) {
      console.error("Create reservation RPC returned no reservation.");
      return errorResponse(mapReservationRpcError(""));
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          reservation: {
            id: reservation.id,
            carId: reservation.car_id,
            pickupDate: reservation.pickup_date,
            returnDate: reservation.return_date,
            rentalDays: reservation.rental_days,
            totalPrice: reservation.total_price,
            status: reservation.status,
          },
        },
      },
      {
        status: 201,
        headers: noStoreHeaders,
      },
    );
  } catch (error) {
    console.error("Create reservation route error:", error);

    return errorResponse({
      code: "RESERVATION_CREATE_FAILED",
      message:
        "An unexpected database failure occurred. Please try again later.",
      status: 500,
    });
  }
}

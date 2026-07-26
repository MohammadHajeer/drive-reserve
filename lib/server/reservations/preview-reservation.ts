import "server-only";

import { createClient } from "@/lib/supabase/server";
import {
  reservationPreviewSchema,
  type ReservationPreviewInput,
} from "@/lib/validations/reservation.validation";

export type ReservationUnavailableReason =
  | "CAR_NOT_FOUND"
  | "CAR_NOT_AVAILABLE"
  | "DATES_UNAVAILABLE"
  | null;

export type ReservationPreview = {
  carId: string;
  pickupDate: string;
  returnDate: string;
  rentalDays: number;
  available: boolean;
  pricePerDay: number | null;
  totalPrice: number | null;
  unavailableReason: ReservationUnavailableReason;
};

export class ReservationPreviewValidationError extends Error {
  constructor(
    message: string,
    public readonly code: string,
  ) {
    super(message);
    this.name = "ReservationPreviewValidationError";
  }
}

function parseUnavailableReason(
  reason: string | null,
): ReservationUnavailableReason {
  switch (reason) {
    case "CAR_NOT_FOUND":
    case "CAR_NOT_AVAILABLE":
    case "DATES_UNAVAILABLE":
      return reason;

    case null:
      return null;

    default:
      throw new Error(`Unexpected availability reason: ${reason}`);
  }
}

export async function previewReservation(
  input: ReservationPreviewInput,
): Promise<ReservationPreview> {
  const parsed = reservationPreviewSchema.safeParse(input);

  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors;

    throw new ReservationPreviewValidationError(
      fieldErrors.pickupDate?.[0] ??
        fieldErrors.returnDate?.[0] ??
        "Please check the selected reservation dates.",
      "VALIDATION_ERROR",
    );
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .rpc("preview_reservation", {
      p_car_id: parsed.data.carId,
      p_pickup_date: parsed.data.pickupDate,
      p_return_date: parsed.data.returnDate,
    })
    .single();

  if (error) {
    console.error("Reservation preview RPC error:", error);

    if (error.message.includes("PICKUP_DATE_NOT_AFTER_TODAY")) {
      throw new ReservationPreviewValidationError(
        "Pickup date must be after today.",
        "PICKUP_DATE_NOT_AFTER_TODAY",
      );
    }

    if (error.message.includes("BOOKING_HORIZON_EXCEEDED")) {
      throw new ReservationPreviewValidationError(
        "Reservations cannot be created more than 180 days in advance.",
        "BOOKING_HORIZON_EXCEEDED",
      );
    }

    if (error.message.includes("RENTAL_PERIOD_TOO_LONG")) {
      throw new ReservationPreviewValidationError(
        "A reservation cannot exceed 30 rental days.",
        "RENTAL_PERIOD_TOO_LONG",
      );
    }

    if (error.message.includes("INVALID_RENTAL_DATES")) {
      throw new ReservationPreviewValidationError(
        "Return date must be after the pickup date.",
        "INVALID_RENTAL_DATES",
      );
    }

    throw new Error("Unable to generate the reservation preview.");
  }

  if (!data) {
    throw new Error("The reservation preview returned no data.");
  }

  return {
    carId: data.car_id,
    pickupDate: data.pickup_date,
    returnDate: data.return_date,
    rentalDays: data.rental_days,
    available: data.available,
    pricePerDay:
      data.price_per_day === null ? null : Number(data.price_per_day),
    totalPrice:
      data.total_price === null ? null : Number(data.total_price),
    unavailableReason: parseUnavailableReason(
      data.unavailable_reason,
    ),
  };
}

import "server-only";

import { createClient } from "@/lib/supabase/server";
import type { ReservationPreviewInput } from "@/lib/validations/reservation.validation";

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
  const supabase = await createClient();

  const { data, error } = await supabase
    .rpc("preview_reservation", {
      p_car_id: input.carId,
      p_pickup_date: input.pickupDate,
      p_return_date: input.returnDate,
    })
    .single();

  if (error) {
    console.error("Reservation preview RPC error:", error);
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
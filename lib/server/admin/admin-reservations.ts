import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import type { AdminReservation } from "@/features/admin/reservations/admin-reservation.types";
import type { Database, Tables } from "@/types/database.types";

type ReservationRow = Tables<"reservations">;
type ProfileRow = Tables<"profiles">;
type CarRow = Tables<"cars">;
type CarImageRow = Tables<"car_images">;

export const ADMIN_RESERVATION_SELECT = `
  id,
  customer_id,
  car_id,
  pickup_date,
  return_date,
  rental_days,
  price_per_day_snapshot,
  subtotal,
  total_price,
  status,
  cancellation_reason,
  rejection_reason,
  created_at,
  updated_at,
  profiles!reservations_customer_id_fkey (
    id,
    full_name,
    phone
  ),
  cars!reservations_car_id_fkey (
    id,
    brand,
    model,
    year,
    plate_number,
    category,
    car_images (
      image_url,
      is_primary,
      display_order
    )
  )
` as const;

type ReservationWithRelations = Pick<
  ReservationRow,
  | "id"
  | "customer_id"
  | "car_id"
  | "pickup_date"
  | "return_date"
  | "rental_days"
  | "price_per_day_snapshot"
  | "subtotal"
  | "total_price"
  | "status"
  | "cancellation_reason"
  | "rejection_reason"
  | "created_at"
  | "updated_at"
> & {
  profiles: Pick<ProfileRow, "id" | "full_name" | "phone"> | null;
  cars:
    | (Pick<
        CarRow,
        "id" | "brand" | "model" | "year" | "plate_number" | "category"
      > & {
        car_images: Pick<
          CarImageRow,
          "image_url" | "is_primary" | "display_order"
        >[];
      })
    | null;
};

export function mapAdminReservation(
  supabase: SupabaseClient<Database>,
  reservation: ReservationWithRelations,
): AdminReservation {
  const profile = reservation.profiles;
  const car = reservation.cars;
  const images = Array.isArray(car?.car_images) ? car.car_images : [];
  const primaryImage =
    images.find((image) => image.is_primary) ??
    [...images].sort(
      (first, second) => first.display_order - second.display_order,
    )[0];

  return {
    id: reservation.id,
    customer: {
      id: profile?.id ?? reservation.customer_id,
      fullName: profile?.full_name || null,
      // Email is stored in auth.users and is not exposed by the public schema.
      email: null,
      phone: profile?.phone ?? null,
    },
    car: {
      id: car?.id ?? reservation.car_id,
      brand: car?.brand ?? null,
      model: car?.model ?? null,
      year: car?.year ?? null,
      plateNumber: car?.plate_number ?? null,
      category: car?.category ?? null,
      primaryImageUrl: primaryImage
        ? supabase.storage
            .from("car-images")
            .getPublicUrl(primaryImage.image_url).data.publicUrl
        : null,
    },
    pickupDate: reservation.pickup_date,
    returnDate: reservation.return_date,
    rentalDays: reservation.rental_days ?? 0,
    pricePerDaySnapshot: Number(reservation.price_per_day_snapshot),
    subtotal: Number(reservation.subtotal ?? 0),
    totalPrice: Number(reservation.total_price ?? 0),
    status: reservation.status,
    cancellationReason: reservation.cancellation_reason,
    rejectionReason: reservation.rejection_reason,
    createdAt: reservation.created_at,
    updatedAt: reservation.updated_at,
  };
}

export async function getAdminReservationById(
  supabase: SupabaseClient<Database>,
  reservationId: string,
) {
  const { data, error } = await supabase
    .from("reservations")
    .select(ADMIN_RESERVATION_SELECT)
    .eq("id", reservationId)
    .maybeSingle();

  return {
    reservation: data ? mapAdminReservation(supabase, data) : null,
    error,
  };
}

import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import type { CustomerReservation } from "@/features/customer/reservations/customer-reservations.schema";
import type { Database } from "@/types/database.types";

export async function getCustomerReservations(
  supabase: SupabaseClient<Database>,
  userId: string,
): Promise<CustomerReservation[]> {
  const { data, error } = await supabase
    .from("reservations")
    .select(
      `
        id,
        pickup_date,
        return_date,
        rental_days,
        total_price,
        status,
        created_at,
        cars!reservations_car_id_fkey (
          id,
          brand,
          model,
          category,
          car_images (
            image_url,
            is_primary,
            display_order
          )
        )
      `,
    )
    .eq("customer_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;

  return (data ?? []).map((reservation) => {
    const car = reservation.cars;
    const images = car?.car_images ?? [];
    const primaryImage =
      images.find((image) => image.is_primary) ??
      [...images].sort(
        (first, second) => first.display_order - second.display_order,
      )[0];
    const imageUrl = primaryImage
      ? supabase.storage.from("car-images").getPublicUrl(primaryImage.image_url)
          .data.publicUrl
      : null;

    return {
      id: reservation.id,
      pickupDate: reservation.pickup_date,
      returnDate: reservation.return_date,
      rentalDays: reservation.rental_days ?? 0,
      totalPrice: Number(reservation.total_price ?? 0),
      status: reservation.status,
      createdAt: reservation.created_at,
      car: {
        id: car?.id ?? null,
        name: car ? `${car.brand} ${car.model}` : "Vehicle unavailable",
        category: car?.category ?? null,
        imageUrl,
      },
    };
  });
}


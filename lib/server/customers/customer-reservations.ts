import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import type {
  CustomerReservation,
  CustomerReservationDetail,
} from "@/features/customer/reservations/customer-reservations.schema";
import type { Database, Tables } from "@/types/database.types";

type ReservationRow = Tables<"reservations">;
type ProfileRow = Tables<"profiles">;
type CarRow = Tables<"cars">;
type CarImageRow = Tables<"car_images">;

const CUSTOMER_RESERVATION_DETAIL_SELECT = `
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
    full_name,
    phone
  ),
  cars!reservations_car_id_fkey (
    id,
    brand,
    model,
    year,
    plate_number,
    color,
    category,
    transmission,
    fuel_type,
    seats,
    car_images (
      image_url,
      is_primary,
      display_order
    )
  )
` as const;

type CustomerReservationWithRelations = Pick<
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
  profiles: Pick<ProfileRow, "full_name" | "phone"> | null;
  cars:
    | (Pick<
        CarRow,
        | "id"
        | "brand"
        | "model"
        | "year"
        | "plate_number"
        | "color"
        | "category"
        | "transmission"
        | "fuel_type"
        | "seats"
      > & {
        car_images: Pick<
          CarImageRow,
          "image_url" | "is_primary" | "display_order"
        >[];
      })
    | null;
};

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

function mapCustomerReservationDetail(
  supabase: SupabaseClient<Database>,
  reservation: CustomerReservationWithRelations,
  customerEmail: string | null,
): CustomerReservationDetail {
  const car = reservation.cars;
  const images = Array.isArray(car?.car_images) ? car.car_images : [];
  const primaryImage =
    images.find((image) => image.is_primary) ??
    [...images].sort(
      (first, second) => first.display_order - second.display_order,
    )[0];

  return {
    id: reservation.id,
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
    customer: {
      fullName: reservation.profiles?.full_name || null,
      email: customerEmail,
      phone: reservation.profiles?.phone ?? null,
    },
    car: {
      id: car?.id ?? reservation.car_id,
      brand: car?.brand ?? null,
      model: car?.model ?? null,
      year: car?.year ?? null,
      plateNumber: car?.plate_number ?? null,
      color: car?.color ?? null,
      category: car?.category ?? null,
      transmission: car?.transmission ?? null,
      fuelType: car?.fuel_type ?? null,
      seats: car?.seats ?? null,
      imageUrl: primaryImage
        ? supabase.storage
            .from("car-images")
            .getPublicUrl(primaryImage.image_url).data.publicUrl
        : null,
    },
  };
}

export async function getCustomerReservationById(
  supabase: SupabaseClient<Database>,
  userId: string,
  customerEmail: string | null,
  reservationId: string,
) {
  const { data, error } = await supabase
    .from("reservations")
    .select(CUSTOMER_RESERVATION_DETAIL_SELECT)
    .eq("id", reservationId)
    .eq("customer_id", userId)
    .maybeSingle();

  return {
    reservation: data
      ? mapCustomerReservationDetail(supabase, data, customerEmail)
      : null,
    error,
  };
}

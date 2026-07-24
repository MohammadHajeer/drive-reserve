import "server-only";

import { z } from "zod";

import { createClient } from "@/lib/supabase/server";
import type { AdminCar } from "../admin-car.types";

const carIdSchema = z.uuid();

export async function getAdminCarForEdit(
  carId: string,
): Promise<AdminCar | null> {
  const parsedId = carIdSchema.safeParse(carId);

  if (!parsedId.success) return null;

  const supabase = await createClient();
  const { data: car, error } = await supabase
    .from("cars")
    .select(
      `
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
        price_per_day,
        description,
        status,
        created_at,
        updated_at,
        car_images (
          id,
          image_url,
          is_primary,
          display_order
        )
      `,
    )
    .eq("id", parsedId.data)
    .maybeSingle();

  if (error) {
    throw new Error("Unable to load the car for editing.", { cause: error });
  }

  if (!car) return null;

  const images = Array.isArray(car.car_images)
    ? [...car.car_images]
        .sort((first, second) => first.display_order - second.display_order)
        .map((image) => ({
          id: image.id,
          path: image.image_url,
          url: supabase.storage
            .from("car-images")
            .getPublicUrl(image.image_url).data.publicUrl,
          isPrimary: image.is_primary,
          displayOrder: image.display_order,
        }))
    : [];

  return {
    id: car.id,
    brand: car.brand,
    model: car.model,
    year: car.year,
    plateNumber: car.plate_number,
    color: car.color,
    category: car.category,
    transmission: car.transmission,
    fuelType: car.fuel_type,
    seats: car.seats,
    pricePerDay: Number(car.price_per_day),
    description: car.description,
    status: car.status,
    images,
    createdAt: car.created_at,
    updatedAt: car.updated_at,
  };
}

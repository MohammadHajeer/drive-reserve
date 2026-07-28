import "server-only";

import { z } from "zod";

import { createClient } from "@/lib/supabase/server";

const carIdSchema = z.uuid();

export async function getPublicCarById(id: string) {
  try {
    const parsedId = carIdSchema.safeParse(id);

    if (!parsedId.success) {
      return {
        success: false as const,
        error: {
          code: "INVALID_CAR_ID",
          message: "The provided car ID is invalid.",
        },
      };
    }

    const supabase = await createClient();

    const { data: car, error } = await supabase
      .from("cars")
      .select(
        `
          id,
          brand,
          model,
          year,
          color,
          category,
          transmission,
          fuel_type,
          seats,
          price_per_day,
          description,
          features,
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
      .eq("status", "available")
      .maybeSingle();

    if (error) {
      console.error("Car details error:", error);

      return {
        success: false as const,
        error: {
          code: "CAR_LOAD_FAILED",
          message: "Unable to load the car.",
        },
      };
    }

    if (!car) {
      return {
        success: false as const,
        error: {
          code: "CAR_NOT_FOUND",
          message: "The requested car was not found.",
        },
      };
    }

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
      success: true as const,
      data: {
        car: {
          id: car.id,
          brand: car.brand,
          model: car.model,
          year: car.year,
          color: car.color,
          category: car.category,
          transmission: car.transmission,
          fuelType: car.fuel_type,
          seats: car.seats,
          pricePerDay: Number(car.price_per_day),
          description: car.description,
          features: car.features,
          status: car.status,
          images,
          createdAt: car.created_at,
          updatedAt: car.updated_at,
        },
      },
    };
  } catch (error) {
    console.error("Car details load error:", error);

    return {
      success: false as const,
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: "An unexpected error occurred.",
      },
    };
  }
}

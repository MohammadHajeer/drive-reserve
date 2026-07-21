import { NextResponse } from "next/server";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";

const carIdSchema = z.uuid();

export async function GET(
  _request: Request,
  context: {
    params: Promise<{
      id: string;
    }>;
  },
) {
  try {
    const { id } = await context.params;

    const parsedId = carIdSchema.safeParse(id);

    if (!parsedId.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INVALID_CAR_ID",
            message: "The provided car ID is invalid.",
          },
        },
        { status: 400 },
      );
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

      return NextResponse.json(
        {
          success: false,
          error: {
            code: "CAR_LOAD_FAILED",
            message: "Unable to load the car.",
          },
        },
        { status: 500 },
      );
    }

    if (!car) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "CAR_NOT_FOUND",
            message: "The requested car was not found.",
          },
        },
        { status: 404 },
      );
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

    return NextResponse.json({
      success: true,
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
          status: car.status,
          images,
          createdAt: car.created_at,
          updatedAt: car.updated_at,
        },
      },
    });
  } catch (error) {
    console.error("Car details route error:", error);

    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message: "An unexpected error occurred.",
        },
      },
      { status: 500 },
    );
  }
}

import { NextResponse } from "next/server";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";
import { updateCarSchema } from "@/lib/validations/cars.validation";
import { CAR_STATUSES, FUEL_TYPES, TRANSMISSIONS } from "@/types/domain";

const carIdSchema = z.uuid();

function unauthorizedResponse() {
  return NextResponse.json(
    {
      success: false,
      error: {
        code: "UNAUTHENTICATED",
        message: "Authentication is required.",
      },
    },
    { status: 401 },
  );
}

function forbiddenResponse() {
  return NextResponse.json(
    {
      success: false,
      error: {
        code: "FORBIDDEN",
        message: "Administrator access is required.",
      },
    },
    { status: 403 },
  );
}

export async function PATCH(
  request: Request,
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

    const { data: claimsData, error: claimsError } =
      await supabase.auth.getClaims();

    if (claimsError || !claimsData?.claims?.sub) {
      return unauthorizedResponse();
    }

    if (claimsData.claims.user_role !== "admin") {
      return forbiddenResponse();
    }

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

    const parsedBody = updateCarSchema.safeParse(body);

    if (!parsedBody.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Please check the submitted car information.",
            fieldErrors: parsedBody.error.flatten().fieldErrors,
            formErrors: parsedBody.error.flatten().formErrors,
          },
        },
        { status: 400 },
      );
    }

    const input = parsedBody.data;

    const updates: {
      brand?: string;
      model?: string;
      year?: number;
      plate_number?: string;
      color?: string;
      category?: string;
      transmission?: (typeof TRANSMISSIONS)[number];
      fuel_type?: (typeof FUEL_TYPES)[number];
      seats?: number;
      price_per_day?: number;
      description?: string | null;
      status?: (typeof CAR_STATUSES)[number];
    } = {};

    if (input.brand !== undefined) {
      updates.brand = input.brand;
    }

    if (input.model !== undefined) {
      updates.model = input.model;
    }

    if (input.year !== undefined) {
      updates.year = input.year;
    }

    if (input.plateNumber !== undefined) {
      updates.plate_number = input.plateNumber;
    }

    if (input.color !== undefined) {
      updates.color = input.color;
    }

    if (input.category !== undefined) {
      updates.category = input.category;
    }

    if (input.transmission !== undefined) {
      updates.transmission = input.transmission;
    }

    if (input.fuelType !== undefined) {
      updates.fuel_type = input.fuelType;
    }

    if (input.seats !== undefined) {
      updates.seats = input.seats;
    }

    if (input.pricePerDay !== undefined) {
      updates.price_per_day = input.pricePerDay;
    }

    if (input.description !== undefined) {
      updates.description = input.description === "" ? null : input.description;
    }

    if (input.status !== undefined) {
      updates.status = input.status;
    }

    const { data: car, error } = await supabase
      .from("cars")
      .update(updates)
      .eq("id", parsedId.data)
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
      .maybeSingle();

    if (error) {
      console.error("Update car error:", error);

      if (error.code === "23505") {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: "PLATE_NUMBER_EXISTS",
              message: "A car with this plate number already exists.",
            },
          },
          { status: 409 },
        );
      }

      return NextResponse.json(
        {
          success: false,
          error: {
            code: "CAR_UPDATE_FAILED",
            message: "Unable to update the car.",
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
        },
      },
      message: "Car updated successfully.",
    });
  } catch (error) {
    console.error("Update car route error:", error);

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

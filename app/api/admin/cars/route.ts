import { type NextRequest, NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";
import {
  adminCarsQuerySchema,
  createCarSchema,
} from "@/lib/validations/cars.validation";

const sortOptions = {
  newest: { column: "created_at", ascending: false },
  oldest: { column: "created_at", ascending: true },
  "price-asc": { column: "price_per_day", ascending: true },
  "price-desc": { column: "price_per_day", ascending: false },
  "year-desc": { column: "year", ascending: false },
  "brand-asc": { column: "brand", ascending: true },
} as const;

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

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    const { data: claimsData, error: claimsError } =
      await supabase.auth.getClaims();

    if (claimsError || !claimsData?.claims?.sub) {
      return unauthorizedResponse();
    }

    if (claimsData.claims.user_role !== "admin") {
      return forbiddenResponse();
    }

    const searchParams = request.nextUrl.searchParams;

    const parsed = adminCarsQuerySchema.safeParse({
      search: searchParams.get("search") ?? "",
      status: searchParams.get("status") || undefined,
      category: searchParams.get("category") || undefined,
      transmission: searchParams.get("transmission") || undefined,
      sort: searchParams.get("sort") ?? "newest",
      page: searchParams.get("page") ?? "1",
      limit: searchParams.get("limit") ?? "10",
    });

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INVALID_QUERY_PARAMETERS",
            message: "Please check the selected filters.",
            fieldErrors: parsed.error.flatten().fieldErrors,
          },
        },
        { status: 400 },
      );
    }

    const { search, status, category, transmission, sort, page, limit } =
      parsed.data;

    let query = supabase.from("cars").select(
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
      {
        count: "exact",
      },
    );

    if (search) {
      query = query.or(
        [
          `brand.ilike.%${search}%`,
          `model.ilike.%${search}%`,
          `plate_number.ilike.%${search}%`,
          `category.ilike.%${search}%`,
        ].join(","),
      );
    }

    if (status) {
      query = query.eq("status", status);
    }

    if (category) {
      query = query.eq("category", category);
    }

    if (transmission) {
      query = query.eq("transmission", transmission);
    }

    const sortOption = sortOptions[sort];
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, count, error } = await query
      .order(sortOption.column, {
        ascending: sortOption.ascending,
      })
      .order("id", {
        ascending: true,
      })
      .range(from, to);

    if (error) {
      console.error("Admin cars load error:", error);

      return NextResponse.json(
        {
          success: false,
          error: {
            code: "CARS_LOAD_FAILED",
            message: "Unable to load the cars.",
          },
        },
        { status: 500 },
      );
    }

    const cars = (data ?? []).map((car) => {
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
    });

    const total = count ?? 0;

    return NextResponse.json(
      {
        success: true,
        data: {
          cars,
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
            hasNextPage: page * limit < total,
            hasPreviousPage: page > 1,
          },
        },
      },
      {
        headers: {
          "Cache-Control": "private, no-store",
        },
      },
    );
  } catch (error) {
    console.error("Admin cars route error:", error);

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

export async function POST(request: Request) {
  try {
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

    const parsed = createCarSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Please check the submitted car information.",
            fieldErrors: parsed.error.flatten().fieldErrors,
          },
        },
        { status: 400 },
      );
    }

    const input = parsed.data;

    const { data: car, error } = await supabase
      .from("cars")
      .insert({
        brand: input.brand,
        model: input.model,
        year: input.year,
        plate_number: input.plateNumber,
        color: input.color,
        category: input.category,
        transmission: input.transmission,
        fuel_type: input.fuelType,
        seats: input.seats,
        price_per_day: input.pricePerDay,
        description: input.description || null,
        status: input.status,
      })
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
          updated_at
        `,
      )
      .single();

    if (error) {
      console.error("Create car error:", error);

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
            code: "CAR_CREATION_FAILED",
            message: "Unable to create the car.",
          },
        },
        { status: 500 },
      );
    }

    return NextResponse.json(
      {
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
            images: [],
            createdAt: car.created_at,
            updatedAt: car.updated_at,
          },
        },
        message: "Car created successfully.",
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Create car route error:", error);

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

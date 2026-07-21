import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";

const categories = [
  "economy",
  "compact",
  "sedan",
  "suv",
  "luxury",
  "electric",
] as const;

const transmissions = ["automatic", "manual"] as const;
const seatGroups = ["2-4", "5", "7+"] as const;

const querySchema = z
  .object({
    search: z
      .string()
      .trim()
      .max(80, "Search cannot exceed 80 characters")
      .regex(/^[\p{L}\p{N}\s-]*$/u, "Search contains unsupported characters")
      .default(""),

    categories: z.array(z.enum(categories)).max(6).default([]),

    transmissions: z.array(z.enum(transmissions)).max(2).default([]),

    seatGroups: z.array(z.enum(seatGroups)).max(3).default([]),

    minPrice: z.coerce.number().min(0).optional(),
    maxPrice: z.coerce.number().min(0).optional(),

    sort: z
      .enum(["price-asc", "price-desc", "newest", "year-desc", "brand-asc"])
      .default("price-asc"),

    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(24).default(6),
  })
  .superRefine((data, context) => {
    if (
      data.minPrice !== undefined &&
      data.maxPrice !== undefined &&
      data.minPrice > data.maxPrice
    ) {
      context.addIssue({
        code: "custom",
        path: ["minPrice"],
        message: "Minimum price cannot exceed maximum price",
      });
    }
  });

function getListParameter(
  searchParams: URLSearchParams,
  name: string,
): string[] {
  return searchParams
    .getAll(name)
    .flatMap((value) => value.split(","))
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);
}

function getOptionalParameter(
  searchParams: URLSearchParams,
  name: string,
): string | undefined {
  const value = searchParams.get(name)?.trim();

  return value ? value : undefined;
}

const categoryLabels: Record<(typeof categories)[number], string> = {
  economy: "Economy",
  compact: "Compact",
  sedan: "Sedan",
  suv: "SUV",
  luxury: "Luxury",
  electric: "Electric",
};

const sortOptions = {
  "price-asc": {
    column: "price_per_day",
    ascending: true,
  },
  "price-desc": {
    column: "price_per_day",
    ascending: false,
  },
  newest: {
    column: "created_at",
    ascending: false,
  },
  "year-desc": {
    column: "year",
    ascending: false,
  },
  "brand-asc": {
    column: "brand",
    ascending: true,
  },
} as const;

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    const parsed = querySchema.safeParse({
      search: searchParams.get("search") ?? "",
      categories: getListParameter(searchParams, "category"),
      transmissions: getListParameter(searchParams, "transmission"),
      seatGroups: getListParameter(searchParams, "seats"),
      minPrice: getOptionalParameter(searchParams, "minPrice"),
      maxPrice: getOptionalParameter(searchParams, "maxPrice"),
      sort: searchParams.get("sort") ?? "price-asc",
      page: searchParams.get("page") ?? "1",
      limit: searchParams.get("limit") ?? "6",
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

    const {
      search,
      categories: selectedCategories,
      transmissions: selectedTransmissions,
      seatGroups: selectedSeatGroups,
      minPrice,
      maxPrice,
      sort,
      page,
      limit,
    } = parsed.data;

    const supabase = await createClient();

    let query = supabase
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
          status,
          created_at,
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
      )
      .eq("status", "available");

    if (search) {
      const normalizedSearch = search.replace(/\s+/g, " ");

      query = query.or(
        [
          `brand.ilike.%${normalizedSearch}%`,
          `model.ilike.%${normalizedSearch}%`,
          `category.ilike.%${normalizedSearch}%`,
        ].join(","),
      );
    }

    if (selectedCategories.length > 0) {
      const categoryFilters = selectedCategories.flatMap((category) => {
        if (category === "electric") {
          return ["fuel_type.eq.electric", "category.ilike.%Electric%"];
        }

        return [`category.ilike.%${categoryLabels[category]}%`];
      });

      query = query.or(categoryFilters.join(","));
    }

    if (selectedTransmissions.length > 0) {
      query = query.in("transmission", selectedTransmissions);
    }

    if (minPrice !== undefined) {
      query = query.gte("price_per_day", minPrice);
    }

    if (maxPrice !== undefined) {
      query = query.lte("price_per_day", maxPrice);
    }

    if (selectedSeatGroups.length > 0) {
      const seatFilters = selectedSeatGroups.map((group) => {
        switch (group) {
          case "2-4":
            return "and(seats.gte.2,seats.lte.4)";

          case "5":
            return "seats.eq.5";

          case "7+":
            return "seats.gte.7";
        }
      });

      query = query.or(seatFilters.join(","));
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
      console.error("Cars listing error:", error);

      return NextResponse.json(
        {
          success: false,
          error: {
            code: "CARS_LOAD_FAILED",
            message: "Unable to load the available cars.",
          },
        },
        { status: 500 },
      );
    }

    const cars = (data ?? []).map((car) => {
      const images = Array.isArray(car.car_images)
        ? [...car.car_images].sort(
            (first, second) => first.display_order - second.display_order,
          )
        : [];

      const primaryImage =
        images.find((image) => image.is_primary) ?? images[0] ?? null;

      const primaryImageUrl = primaryImage
        ? supabase.storage
            .from("car-images")
            .getPublicUrl(primaryImage.image_url).data.publicUrl
        : null;

      return {
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
        status: car.status,
        primaryImageUrl,
      };
    });

    const total = count ?? 0;

    return NextResponse.json({
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
    });
  } catch (error) {
    console.error("Cars route error:", error);

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
